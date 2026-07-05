import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, Plus } from "lucide-react";
import { toast } from "sonner";
import { adminRpc, Ticket } from "./adminRpc";
import { Card, EmptyState, FilterTabs, PageHead, RowsSkeleton, TableWrap, Td, Th } from "./components";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type TicketTab = "all" | "urgent" | "waiting_on_us" | "waiting_on_customer" | "closed";

const STATUS_LABEL: Record<Ticket["status"], string> = {
  open: "Open",
  waiting_on_us: "Waiting on us",
  waiting_on_customer: "Waiting on customer",
  closed: "Closed",
};

const PRIORITY_CLASS: Record<Ticket["priority"], string> = {
  urgent: "bg-destructive/10 text-destructive",
  normal: "bg-info/10 text-info",
  low: "bg-secondary text-foreground-secondary",
};

export default function ConsoleSupport() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TicketTab>("all");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ email: "", subject: "", body: "", priority: "normal" });

  const ticketsQuery = useQuery({
    queryKey: ["ac-tickets"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_tickets");
      if (error) throw new Error(error.message);
      return (data ?? []) as Ticket[];
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, status, priority }: { id: number; status?: string; priority?: string }) => {
      const { error } = await adminRpc("admin_update_ticket", {
        p_id: id, p_status: status ?? null, p_priority: priority ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Update failed: ${err.message}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ac-tickets"] });
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await adminRpc("admin_create_ticket", {
        p_email: form.email.trim(),
        p_subject: form.subject.trim(),
        p_body: form.body.trim() || null,
        p_priority: form.priority,
      });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Could not log ticket: ${err.message}`),
    onSuccess: () => {
      toast.success("Ticket logged");
      setForm({ email: "", subject: "", body: "", priority: "normal" });
      setShowNew(false);
      queryClient.invalidateQueries({ queryKey: ["ac-tickets"] });
    },
  });

  const tickets = ticketsQuery.data ?? [];
  const open = tickets.filter((t) => t.status !== "closed");
  const urgent = open.filter((t) => t.priority === "urgent");

  const filtered = useMemo(() => {
    switch (tab) {
      case "urgent": return tickets.filter((t) => t.priority === "urgent" && t.status !== "closed");
      case "waiting_on_us": return tickets.filter((t) => t.status === "waiting_on_us" || t.status === "open");
      case "waiting_on_customer": return tickets.filter((t) => t.status === "waiting_on_customer");
      case "closed": return tickets.filter((t) => t.status === "closed");
      default: return tickets;
    }
  }, [tickets, tab]);

  const submitNew = (e: FormEvent) => {
    e.preventDefault();
    createTicket.mutate();
  };

  return (
    <div className="space-y-5">
      <PageHead
        title="Support queue"
        subtitle={`Customer tickets & flagged accounts · ${open.length} open${urgent.length ? ` · ${urgent.length} urgent` : ""}`}
        actions={
          <button
            onClick={() => setShowNew((s) => !s)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-[12.5px] font-semibold hover:bg-[#e05f40] transition-colors"
          >
            <Plus size={14} /> Log ticket
          </button>
        }
      />

      {showNew && (
        <Card title="Log a ticket" subtitle="Record a customer issue that came in via email or WhatsApp">
          <form onSubmit={submitNew} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="email"
              required
              placeholder="Customer email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Select value={form.priority} onValueChange={(priority) => setForm((f) => ({ ...f, priority }))}>
              <SelectTrigger className="rounded-xl text-[13px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              placeholder="Details (optional)"
              rows={3}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground-secondary text-[12.5px] font-semibold hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTicket.isPending}
                className="px-4 py-2 rounded-xl bg-primary text-white text-[12.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-60"
              >
                {createTicket.isPending ? "Saving…" : "Save ticket"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4">
          <FilterTabs
            tabs={[
              { key: "all" as TicketTab, label: "All", count: tickets.length },
              { key: "urgent" as TicketTab, label: "Urgent", count: urgent.length },
              { key: "waiting_on_us" as TicketTab, label: "Waiting on us", count: tickets.filter((t) => t.status === "waiting_on_us" || t.status === "open").length },
              { key: "waiting_on_customer" as TicketTab, label: "Waiting on customer", count: tickets.filter((t) => t.status === "waiting_on_customer").length },
              { key: "closed" as TicketTab, label: "Closed", count: tickets.filter((t) => t.status === "closed").length },
            ]}
            active={tab}
            onChange={(k) => setTab(k as TicketTab)}
          />
        </div>

        {ticketsQuery.isLoading ? (
          <TableWrap>
            <tbody><RowsSkeleton cols={6} /></tbody>
          </TableWrap>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title={tickets.length === 0 ? "No tickets yet" : "Nothing in this view"}
            note={
              tickets.length === 0
                ? "Log tickets manually with the button above, or wire the Contact page form to the support_tickets table so customer messages land here automatically."
                : "Switch tabs to see other tickets."
            }
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th first>Ticket</Th>
                <Th>Customer</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                  <Td first>
                    <p className="font-semibold text-foreground max-w-[280px] truncate">
                      <span className="text-foreground-muted font-medium mr-1.5">#OSC-{String(t.id).padStart(4, "0")}</span>
                      {t.subject}
                    </p>
                    {t.body && <p className="text-[11px] text-foreground-muted truncate max-w-[280px] mt-0.5">{t.body}</p>}
                  </Td>
                  <Td className="text-foreground-secondary truncate max-w-[180px]">{t.email ?? "—"}</Td>
                  <Td>
                    <Select
                      value={t.priority}
                      disabled={updateTicket.isPending}
                      onValueChange={(priority) => updateTicket.mutate({ id: t.id, priority })}
                    >
                      <SelectTrigger className={`h-7 w-[96px] rounded-full border-0 text-[11px] font-semibold px-3 ${PRIORITY_CLASS[t.priority]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </Td>
                  <Td>
                    <Select
                      value={t.status}
                      disabled={updateTicket.isPending}
                      onValueChange={(status) => updateTicket.mutate({ id: t.id, status })}
                    >
                      <SelectTrigger className="h-7 w-[168px] rounded-full border-border text-[11px] font-semibold px-3 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABEL) as Ticket["status"][]).map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Td>
                  <Td className="text-foreground-muted whitespace-nowrap">
                    {new Date(t.updated_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
