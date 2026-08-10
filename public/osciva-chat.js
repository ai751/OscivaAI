/* Osciva AI — embeddable chat widget (self-contained, no dependencies).
 * Design matches osciva.io/chat; backend is the Osciva Supabase `chat` function
 * (real RAG + multi-provider answers + live streaming + conversation logging).
 *
 * Two ways to embed:
 *
 * 1) Simple (recommended) — auto-pulls logo / name / colour / welcome from the agent:
 *    <script src="https://YOUR_APP/osciva-chat.js"
 *            data-agent-id="AGENT_UUID"
 *            data-api="https://ivmliklvsqmblplkwutq.supabase.co/functions/v1/chat"></script>
 *
 * 2) With manual overrides — set window.OscivaConfig BEFORE the script tag:
 *    <script>
 *      window.OscivaConfig = {
 *        agentId: 'AGENT_UUID',                       // or use data-agent-id
 *        headerLogo: 'https://site.com/logo.png',
 *        companyName: 'Adya Hospital, Ballari',
 *        tagline: '🏥 Multi-Specialty • 24/7 Care',
 *        welcomeMessage: 'Hi there! 👋 ...',
 *        bubbleMessages: ['Need help? 💬', 'Ask me anything 💡']
 *      };
 *    </script>
 *    <script src="https://YOUR_APP/osciva-chat.js" data-agent-id="AGENT_UUID"></script>
 *
 * Anything set in window.OscivaConfig wins over the agent's saved settings.
 */
(function () {
  "use strict";
  if (window.OscivaInitialized) return;
  window.OscivaInitialized = true;

  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var cfg = window.OscivaConfig || {};

  var AGENT_ID = cfg.agentId || (script && script.getAttribute("data-agent-id"));
  var API =
    cfg.api ||
    (script && script.getAttribute("data-api")) ||
    "https://ivmliklvsqmblplkwutq.supabase.co/functions/v1/chat";
  if (!AGENT_ID) {
    console.error("[Osciva] Missing agentId (set data-agent-id or window.OscivaConfig.agentId).");
    return;
  }

  // Bubble icon is universal Osciva branding; the header logo is per-agent.
  var OSCIVA_LOGO = "https://osciva.io/images/osciva-web.png";

  // Track which keys the embedder set manually so the backend can't override them.
  var manual = {};
  ["headerLogo", "companyName", "tagline", "welcomeMessage", "color", "position", "suggestions"].forEach(
    function (k) { if (cfg[k] !== undefined) manual[k] = true; }
  );

  var settings = {
    headerLogo: cfg.headerLogo || "",
    bubbleLogo: cfg.bubbleLogo || OSCIVA_LOGO,
    companyName: cfg.companyName || "AI Assistant",
    tagline: cfg.tagline || "Online",
    welcomeMessage: cfg.welcomeMessage || "Hi 👋 How can I help you today?",
    color: cfg.color || "#1e293b",
    position: cfg.position || "right",
    suggestions: cfg.suggestions || [],
    bubbleMessages: cfg.bubbleMessages || ["Need help? 💬", "We're here for you 👋", "Ask me anything 💡", "Let's chat! 🤖"],
    passwordRequired: false,
    branding: true, // "Powered by Osciva" — hidden for paid plans via backend config
  };

  var conversationId = null;
  var history = []; // {role, content}

  // ---- Per-agent access password (kept only for this browser session) ----
  function pwKey() { return "osciva_pw_" + AGENT_ID; }
  function getPw() { try { return sessionStorage.getItem(pwKey()) || ""; } catch (e) { return ""; } }
  function setPw(v) { try { if (v) sessionStorage.setItem(pwKey(), v); else sessionStorage.removeItem(pwKey()); } catch (e) {} }
  function needsPassword() { return settings.passwordRequired && !getPw(); }

  // ---- Inter font (matches osciva.io). Loaded once into the host page head. ----
  if (!document.getElementById("osciva-font")) {
    var f = document.createElement("link");
    f.id = "osciva-font";
    f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(f);
  }

  // ---- Shadow DOM host (isolates widget from host-page CSS) ----
  var host = document.createElement("div");
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function linkify(s) {
    return escapeHtml(s).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  function nowTime() {
    var d = new Date();
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  function styles() {
    var c = settings.color;
    var side = settings.position === "left" ? "left" : "right";
    return (
      "*{box-sizing:border-box;font-family:'Inter',-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}" +
      ":host{all:initial}" +
      ".chat-container{position:fixed;bottom:24px;" + side + ":24px;z-index:2147483000;display:none;width:360px;height:560px;" +
      "background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.2);overflow:hidden;flex-direction:column;border:1px solid #e2e8f0}" +
      ".chat-container.open{display:flex}" +
      ".chat-interface{display:flex;flex-direction:column;height:100%}" +
      ".brand-header{padding:10px 14px;display:flex;align-items:center;gap:10px;background:" + c + ";color:#fff;position:relative;overflow:hidden;flex-shrink:0}" +
      ".brand-header::before{content:'';position:absolute;top:-50%;right:-50%;width:200%;height:200%;" +
      "background:radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 70%);animation:opulse 4s ease-in-out infinite}" +
      "@keyframes opulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.1);opacity:.8}}" +
      ".brand-header img{width:32px;height:32px;border-radius:50%;background:#fff;object-fit:contain;padding:2px;box-shadow:0 2px 8px rgba(0,0,0,.15);z-index:1}" +
      ".header-info{display:flex;flex-direction:column;gap:1px;z-index:1;flex:1;min-width:0}" +
      ".company-name{font-weight:700;font-size:13px;letter-spacing:-.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".tagline{font-size:9px;opacity:.9;font-weight:400}" +
      ".header-buttons{display:flex;gap:6px;align-items:center;z-index:1}" +
      ".refresh-button,.close-button{background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;font-size:16px;width:28px;height:28px;" +
      "border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .2s ease}" +
      ".refresh-button:hover,.close-button:hover{background:rgba(255,255,255,.25)}" +
      ".chat-messages{flex:1;padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:#f8fafc;min-height:0;scrollbar-width:none}" +
      ".chat-messages::-webkit-scrollbar{width:0;background:transparent}" +
      ".message-wrapper{display:flex;gap:10px;align-items:flex-start}" +
      ".message-wrapper.user{justify-content:flex-end}" +
      ".message-wrapper.bot{justify-content:flex-start}" +
      ".message-content{display:flex;flex-direction:column;gap:5px;max-width:78%}" +
      ".chat-message{padding:12px 16px;border-radius:14px;font-size:13px;line-height:1.5;word-wrap:break-word;white-space:pre-line;animation:omsg .4s ease}" +
      "@keyframes omsg{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
      ".chat-message.user{background:" + c + ";color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 12px rgba(30,41,59,.2)}" +
      ".chat-message.bot{background:#fff;color:#1e293b;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #e2e8f0}" +
      ".chat-message.bot a{color:" + c + ";text-decoration:none;font-weight:600}" +
      ".chat-message.bot a:hover{text-decoration:underline}" +
      ".message-time{font-size:10px;opacity:.6;padding-left:4px;font-weight:500}" +
      ".sugg{display:flex;flex-wrap:wrap;gap:6px;padding:0 18px 8px;background:#f8fafc}" +
      ".sugg button{font-size:12px;padding:6px 11px;border-radius:14px;border:1px solid " + c + "55;background:#fff;color:" + c + ";cursor:pointer}" +
      ".chat-input{display:flex;gap:8px;padding:12px;border-top:1px solid #e2e8f0;background:#fff;align-items:center;flex-shrink:0}" +
      ".chat-input textarea{flex:1;border-radius:20px;border:1px solid #e2e8f0;padding:10px 16px;font-size:16px;resize:none;height:40px;" +
      "line-height:20px;overflow-y:auto;box-sizing:border-box;transition:border-color .3s ease;scrollbar-width:none}" +
      ".chat-input textarea::-webkit-scrollbar{width:0;background:transparent}" +
      ".chat-input textarea::placeholder{color:#94a3b8;opacity:1}" +
      ".chat-input textarea:focus{outline:none;border-color:" + c + "}" +
      ".send-btn{border:none;padding:0;width:40px;height:40px;border-radius:50%;background:" + c + ";color:#fff;cursor:pointer;" +
      "transition:all .3s ease;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}" +
      ".send-btn:hover{transform:scale(1.1);box-shadow:0 4px 12px rgba(30,41,59,.4)}" +
      ".send-btn:disabled{opacity:.5;cursor:default;transform:none;box-shadow:none}" +
      ".chat-footer{text-align:center;padding:12px;font-size:12px;color:#94a3b8;background:#f8fafc;border-top:1px solid #e2e8f0;font-weight:600;flex-shrink:0}" +
      ".chat-footer a{color:" + c + ";text-decoration:none;font-weight:700}" +
      ".pw-gate{position:absolute;top:52px;left:0;right:0;bottom:0;background:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:32px 28px;text-align:center;z-index:6}" +
      ".pw-gate.show{display:flex}" +
      ".pw-gate .pw-lock{width:52px;height:52px;border-radius:50%;background:" + c + "14;color:" + c + ";display:flex;align-items:center;justify-content:center;font-size:24px}" +
      ".pw-gate h4{margin:0;font-size:15px;font-weight:700;color:#1e293b}" +
      ".pw-gate p{margin:0;font-size:12px;color:#64748b;line-height:1.5;max-width:240px}" +
      ".pw-gate input{width:100%;max-width:240px;padding:11px 14px;border-radius:10px;border:1px solid #e2e8f0;font-size:15px;text-align:center}" +
      ".pw-gate input:focus{outline:none;border-color:" + c + "}" +
      ".pw-gate button{width:100%;max-width:240px;padding:11px;border-radius:10px;border:none;background:" + c + ";color:#fff;font-size:14px;font-weight:600;cursor:pointer}" +
      ".pw-gate button:disabled{opacity:.6;cursor:default}" +
      ".pw-gate .pw-err{font-size:12px;color:#dc2626;font-weight:500;min-height:14px}" +
      ".chat-toggle{position:fixed;bottom:24px;" + side + ":24px;width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;z-index:2147483000;" +
      "display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.15);transition:all .3s ease;padding:0;background:#fff}" +
      ".chat-toggle img{width:100%;height:100%;object-fit:contain;padding:11px;border-radius:50%}" +
      ".chat-toggle:hover{transform:scale(1.1);box-shadow:0 12px 32px rgba(0,0,0,.2)}" +
      ".chat-bubble-text{position:fixed;bottom:95px;" + side + ":24px;background:#fff;color:#1e293b;font-size:13px;font-weight:600;" +
      "padding:10px 18px;border-radius:50px;z-index:2147483000;box-shadow:0 8px 24px rgba(0,0,0,.15);white-space:nowrap;display:none}" +
      ".chat-bubble-text.show{display:block}" +
      "@media screen and (max-width:480px){.chat-container{width:calc(100vw - 32px);max-width:380px;height:calc(100vh - 140px);" +
      "max-height:560px;bottom:16px;right:16px;left:16px;margin:0 auto}}"
    );
  }

  function build() {
    root.innerHTML =
      "<style>" + styles() + "</style>" +
      '<div class="chat-container" id="container">' +
      '  <div class="chat-interface">' +
      '    <div class="brand-header">' +
      '      <img id="hdlogo" src="' + (settings.headerLogo || settings.bubbleLogo) + '" alt="" />' +
      '      <div class="header-info">' +
      '        <span class="company-name" id="cname"></span>' +
      '        <div class="tagline" id="tag"></div>' +
      '      </div>' +
      '      <div class="header-buttons">' +
      '        <button class="refresh-button" id="refresh" title="Restart chat">↻</button>' +
      '        <button class="close-button" id="close" title="Close">×</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="chat-messages" id="messages"></div>' +
      '    <div class="sugg" id="sugg"></div>' +
      '    <div class="chat-input">' +
      '      <textarea id="input" placeholder="Type your message..."></textarea>' +
      '      <button class="send-btn" id="send" title="Send">➤</button>' +
      '    </div>' +
      (settings.branding
        ? '    <div class="chat-footer">Powered by <a href="https://osciva.io/" target="_blank" rel="noopener">Osciva⚡</a></div>'
        : "") +
      '    <div class="pw-gate" id="pwgate">' +
      '      <div class="pw-lock">🔒</div>' +
      '      <h4>Password required</h4>' +
      '      <p>This assistant is protected. Enter the password to start chatting.</p>' +
      '      <input id="pwinput" type="password" placeholder="Enter password" autocomplete="off" />' +
      '      <div class="pw-err" id="pwerr"></div>' +
      '      <button id="pwbtn">Unlock</button>' +
      '    </div>' +
      '  </div>' +
      "</div>" +
      '<button class="chat-toggle" id="toggle"><img src="' + settings.bubbleLogo + '" alt="Chat" /></button>' +
      '<div class="chat-bubble-text" id="bubbleText"></div>';

    root.getElementById("cname").textContent = settings.companyName;
    root.getElementById("tag").textContent = settings.tagline;

    root.getElementById("toggle").addEventListener("click", toggleOpen);
    root.getElementById("close").addEventListener("click", function () { setOpen(false); });
    root.getElementById("refresh").addEventListener("click", refresh);
    root.getElementById("send").addEventListener("click", onSend);
    root.getElementById("input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    });

    root.getElementById("pwbtn").addEventListener("click", submitPassword);
    root.getElementById("pwinput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submitPassword(); }
    });

    typeBubble();
  }

  // ---- Password gate ----
  function showGate() {
    root.getElementById("pwgate").classList.add("show");
    var i = root.getElementById("pwinput");
    if (i) { i.value = ""; setTimeout(function () { i.focus(); }, 60); }
  }
  function hideGate() { root.getElementById("pwgate").classList.remove("show"); }

  function submitPassword() {
    var inp = root.getElementById("pwinput");
    var err = root.getElementById("pwerr");
    var btn = root.getElementById("pwbtn");
    var val = (inp.value || "").trim();
    if (!val) { err.textContent = "Please enter the password."; return; }
    btn.disabled = true;
    err.textContent = "";
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agentId: AGENT_ID, messages: [], verifyOnly: true, password: val }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }, function () { return { ok: false, d: {} }; }); })
      .then(function (res) {
        btn.disabled = false;
        if (res.ok && res.d && res.d.ok) {
          setPw(val);
          hideGate();
          if (root.getElementById("messages").children.length === 0) startConversation();
        } else {
          err.textContent =
            res.d && res.d.error === "too_many_attempts" && res.d.reply
              ? res.d.reply
              : "Incorrect password. Please try again.";
          inp.focus();
        }
      })
      .catch(function () { btn.disabled = false; err.textContent = "Couldn't verify right now. Try again."; });
  }

  function setOpen(open) {
    var container = root.getElementById("container");
    var toggle = root.getElementById("toggle");
    if (open) {
      container.classList.add("open");
      hideBubble();
      if (toggle) toggle.style.display = "none"; // hide the bubble while panel is open
      if (needsPassword()) showGate();
      else if (root.getElementById("messages").children.length === 0) startConversation();
    } else {
      container.classList.remove("open");
      if (toggle) toggle.style.display = "flex"; // restore the bubble when closed
      resumeBubble(); // bring the "Need help?" teaser back
    }
  }
  function toggleOpen() {
    setOpen(!root.getElementById("container").classList.contains("open"));
  }

  function startConversation() {
    conversationId = null;
    history = [];
    addMessage(settings.welcomeMessage, true);
    renderSuggestions();
  }
  function refresh() {
    root.getElementById("messages").innerHTML = "";
    root.getElementById("sugg").innerHTML = "";
    startConversation();
  }

  // Returns the inner .chat-message element (so streaming can append into it).
  function addMessage(text, isBot) {
    var messages = root.getElementById("messages");
    var wrap = document.createElement("div");
    wrap.className = "message-wrapper " + (isBot ? "bot" : "user");
    wrap.innerHTML =
      '<div class="message-content">' +
      '  <div class="chat-message ' + (isBot ? "bot" : "user") + '"></div>' +
      '  <div class="message-time"' + (isBot ? "" : ' style="text-align:right"') + ">" + nowTime() + "</div>" +
      "</div>";
    messages.appendChild(wrap);
    var msgEl = wrap.querySelector(".chat-message");
    if (isBot) msgEl.innerHTML = linkify(text);
    else msgEl.textContent = text;
    messages.scrollTop = messages.scrollHeight;
    return msgEl;
  }

  function renderSuggestions() {
    var box = root.getElementById("sugg");
    box.innerHTML = "";
    (settings.suggestions || []).slice(0, 4).forEach(function (s) {
      var b = document.createElement("button");
      b.textContent = s;
      b.addEventListener("click", function () {
        root.getElementById("input").value = s;
        onSend();
      });
      box.appendChild(b);
    });
  }

  function showTyping() {
    var messages = root.getElementById("messages");
    var wrap = document.createElement("div");
    wrap.className = "message-wrapper bot";
    wrap.id = "typing";
    wrap.innerHTML = '<div class="message-content"><div class="chat-message bot">…</div></div>';
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    var t = root.getElementById("typing");
    if (t) t.remove();
  }

  function onSend() {
    var input = root.getElementById("input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    root.getElementById("sugg").innerHTML = "";
    addMessage(text, false);
    history.push({ role: "user", content: text });

    var sendBtn = root.getElementById("send");
    sendBtn.disabled = true;
    showTyping();

    var done = false;
    var messages = root.getElementById("messages");
    function finishOk() { done = true; hideTyping(); sendBtn.disabled = false; }
    function fail() {
      if (done) return;
      finishOk();
      addMessage("Sorry, I'm having trouble connecting. Please try again.", true);
    }

    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agentId: AGENT_ID, messages: history.slice(-12), stream: true, conversationId: conversationId, password: getPw() }),
    })
      .then(function (r) {
        if (!r.ok || !r.body) return r.json().then(handleJson, fail);
        var ct = r.headers.get("content-type") || "";
        if (ct.indexOf("text/event-stream") >= 0 && r.body.getReader) return handleStream(r);
        return r.json().then(handleJson, fail);
      })
      .catch(fail);

    function handleJson(data) {
      finishOk();
      if (data && data.error === "password_required") { setPw(""); showGate(); return; }
      if (data && data.conversationId) conversationId = data.conversationId;
      var reply = data && data.reply ? data.reply : null;
      if (reply) { addMessage(reply, true); history.push({ role: "assistant", content: reply }); }
      else addMessage("Sorry, I'm having trouble right now. Please try again.", true);
    }

    function handleStream(r) {
      var reader = r.body.getReader();
      var decoder = new TextDecoder();
      var botEl = null, full = "", buf = "";
      function pump() {
        return reader.read().then(function (res) {
          if (res.done) {
            if (!done) finishOk();
            if (botEl) botEl.innerHTML = linkify(full);
            if (full) history.push({ role: "assistant", content: full });
            else if (!botEl) addMessage("Sorry, I'm having trouble right now. Please try again.", true);
            return;
          }
          buf += decoder.decode(res.value, { stream: true });
          var idx;
          while ((idx = buf.indexOf("\n")) >= 0) {
            var line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (line.indexOf("data:") !== 0) continue;
            var payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              var evt = JSON.parse(payload);
              if (evt.conversationId) conversationId = evt.conversationId;
              if (evt.delta) {
                if (!done) finishOk();
                if (!botEl) botEl = addMessage("", true);
                full += evt.delta;
                botEl.textContent = full; // textContent while streaming (safe)
                messages.scrollTop = messages.scrollHeight;
              }
            } catch (e) { /* ignore keep-alives */ }
          }
          return pump();
        });
      }
      return pump().catch(fail);
    }
  }

  // ---- Animated floating bubble text (matches osciva.io) ----
  var msgIndex = 0, charIndex = 0, currentMsg = "", bubbleStopped = false;
  function showBubble() { root.getElementById("bubbleText").classList.add("show"); }
  function hideBubble() { bubbleStopped = true; root.getElementById("bubbleText").classList.remove("show"); }
  function resumeBubble() {
    if (!bubbleStopped) return;
    bubbleStopped = false;
    charIndex = 0; currentMsg = "";
    root.getElementById("bubbleText").textContent = "";
    typeBubble();
  }
  function typeBubble() {
    if (bubbleStopped) return;
    var container = root.getElementById("container");
    if (container && container.classList.contains("open")) return;
    var el = root.getElementById("bubbleText");
    var msgs = settings.bubbleMessages;
    if (!msgs || !msgs.length) return;
    showBubble();
    if (charIndex < msgs[msgIndex].length) {
      currentMsg += msgs[msgIndex].charAt(charIndex);
      el.textContent = currentMsg;
      charIndex++;
      setTimeout(typeBubble, 80);
    } else {
      setTimeout(function () {
        charIndex = 0;
        msgIndex = (msgIndex + 1) % msgs.length;
        currentMsg = "";
        el.textContent = "";
        setTimeout(typeBubble, 500);
      }, 3000);
    }
  }

  // ---- Load agent config from backend, merge (manual overrides win), render ----
  fetch(API + "?agentId=" + encodeURIComponent(AGENT_ID))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && !data.error) {
        if (!manual.companyName && data.name) settings.companyName = data.name;
        if (!manual.welcomeMessage && data.welcomeMsg) settings.welcomeMessage = data.welcomeMsg;
        if (!manual.headerLogo && data.logoUrl) settings.headerLogo = data.logoUrl;
        if (!manual.color && data.color) settings.color = data.color;
        if (!manual.position && data.position) settings.position = data.position;
        if (!manual.suggestions && data.suggestions) settings.suggestions = data.suggestions;
        settings.passwordRequired = data.passwordRequired === true;
        // Old backends don't send the flag — keep branding on in that case.
        settings.branding = data.branding !== false;
      }
    })
    .catch(function () { /* render with defaults / manual config */ })
    .then(build);
})();
