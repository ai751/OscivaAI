import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Minus, ShieldCheck, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { adminRpc, AdminUser } from "./adminRpc";
import { Card, PageHead, RowsSkeleton, TableWrap, Td, Th } from "./components";

const PERMISSIONS = [
  "View users & orgs",
  "Change plans",
  "Disable agents",
  "Manage support tickets",
  "Grant/revoke admin access",
  "View revenue & usage",
];

export default function ConsoleTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const usersQuery = useQuery({
    queryKey: ["ac-users"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_users");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUser[];
    },
  });

  const setAdmin = useMutation({
    mutationFn: async ({ targetEmail, isAdmin }: { targetEmail: string; isAdmin: boolean }) => {
      const { error } = await adminRpc("admin_set_admin_by_email", {
        p_email: targetEmail,
        p_is_admin: isAdmin,
      });
      if (error) throw new Error(error.message);
    },
    onError: (err) => {
      const msg = err.message.includes("user_not_found")
        ? "No account exists with that email — they need to sign up first."
        : err.message.includes("cannot_demote_self")
          ? "You can't remove your own admin access — ask another admin."
          : err.message;
      toast.error(msg);
    },
    onSuccess: (_d, { targetEmail, isAdmin }) => {
      toast.success(isAdmin ? `${targetEmail} is now an admin` : `Admin access removed for ${targetEmail}`);
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["ac-users"] });
    },
  });

  const admins = (usersQuery.data ?? []).filter((u) => u.is_admin);

  const invite = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) setAdmin.mutate({ targetEmail: email.trim(), isAdmin: true });
  };

  return (
    <div className="space-y-5">
      <PageHead title="Team & Roles" subtitle="Admin console access control" />

      <Card
        title="Console admins"
        subtitle="Everyone here has full Super Admin access — one role for now, granular roles can come later"
      >
        <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2 mb-5">
          <input
            type="email"
            required
            placeholder="Email of an existing Osciva account…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={setAdmin.isPending}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-[12.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-60"
          >
            <UserPlus size={14} /> Grant admin access
          </button>
        </form>

        <TableWrap>
          <thead>
            <tr>
              <Th first>Member</Th>
              <Th>Role</Th>
              <Th>Access scope</Th>
              <Th>Joined</Th>
              <Th>Manage</Th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <RowsSkeleton cols={5} rows={3} />
            ) : (
              admins.map((a) => (
                <tr key={a.user_id} className="border-b border-border/60 last:border-0">
                  <Td first>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                        {(a.name || a.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-[200px]">
                          {a.name || a.email.split("@")[0]}
                          {a.email === user?.email && <span className="text-foreground-muted font-medium ml-1.5">(you)</span>}
                        </p>
                        <p className="text-[11px] text-foreground-muted truncate max-w-[200px]">{a.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      <ShieldCheck size={11} /> Super Admin
                    </span>
                  </Td>
                  <Td className="text-foreground-secondary">Full platform</Td>
                  <Td className="text-foreground-muted whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Td>
                  <Td>
                    <button
                      disabled={setAdmin.isPending || a.email === user?.email}
                      title={a.email === user?.email ? "You can't remove your own access" : "Remove admin access"}
                      onClick={() => setAdmin.mutate({ targetEmail: a.email, isAdmin: false })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserMinus size={12} /> Revoke
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Card>

      <Card title="Role permission matrix" subtitle="Single Super Admin role today — this is the map for future granular roles">
        <TableWrap>
          <thead>
            <tr>
              <Th first>Permission</Th>
              <Th>Super Admin</Th>
              <Th>Finance</Th>
              <Th>Support</Th>
              <Th>Developer</Th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p, i) => (
              <tr key={p} className="border-b border-border/60 last:border-0">
                <Td first className="font-medium text-foreground">{p}</Td>
                <Td><Check size={15} className="text-success" /></Td>
                {[1, 2, 3].map((col) => (
                  <Td key={col}>
                    <span className="inline-flex items-center gap-1 text-foreground-muted">
                      <Minus size={14} />
                      {i === 0 && col === 1 && <span className="text-[10px]">(future)</span>}
                    </span>
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <p className="text-[11px] text-foreground-muted mt-4">
          Finance / Support / Developer roles aren't implemented yet — everyone with access is a Super Admin. Adding
          granular roles means a `role` column instead of the boolean flag, plus per-RPC checks.
        </p>
      </Card>
    </div>
  );
}
