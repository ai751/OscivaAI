import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, RotateCcw, Search, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import {
  adminRpc, AdminUser, FREE_MSG_QUOTA, inr, PLANS, planBadgeClass,
} from "./adminRpc";
import { planPriceMap, usePricing } from "@/hooks/usePricing";
import { Card, FilterTabs, PageHead, RowsSkeleton, TableWrap, Td, Th } from "./components";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const PAGE_SIZE = 10;
type PlanTab = "all" | "free" | "starter" | "growth";

export default function ConsoleUsers() {
  // Live prices, so the revenue column matches what the admin set.
  const planPrices = planPriceMap(usePricing());
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<PlanTab>("all");
  const [page, setPage] = useState(0);
  const [rename, setRename] = useState<{ userId: string; email: string; name: string } | null>(null);

  useEffect(() => {
    const q = params.get("q");
    if (q !== null) setSearch(q);
  }, [params]);

  const usersQuery = useQuery({
    queryKey: ["ac-users"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_users");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUser[];
    },
  });

  const setPlan = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: string }) => {
      const { error } = await adminRpc("admin_set_plan", { p_user_id: userId, p_plan: plan });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ userId, plan }) => {
      await queryClient.cancelQueries({ queryKey: ["ac-users"] });
      const prev = queryClient.getQueryData<AdminUser[]>(["ac-users"]);
      queryClient.setQueryData<AdminUser[]>(["ac-users"], (old) =>
        old?.map((u) => (u.user_id === userId ? { ...u, plan } : u)),
      );
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ac-users"], ctx.prev);
      toast.error(`Plan change failed: ${err.message}`);
    },
    onSuccess: (_d, { plan }) => {
      toast.success(`Plan updated to ${plan}`);
      queryClient.invalidateQueries({ queryKey: ["ac-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ac-users"] });
      queryClient.invalidateQueries({ queryKey: ["ac-plan-changes"] });
    },
  });

  const resetUsage = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await adminRpc("admin_reset_usage", { p_user_id: userId });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Reset failed: ${err.message}`),
    onSuccess: () => {
      toast.success("Free-message counter reset for this month");
      queryClient.invalidateQueries({ queryKey: ["ac-users"] });
    },
  });

  const renameUser = useMutation({
    mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
      const { error } = await adminRpc("admin_set_user_name", { p_user_id: userId, p_name: name });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Rename failed: ${err.message}`),
    onSuccess: () => {
      toast.success("Account renamed");
      setRename(null);
      queryClient.invalidateQueries({ queryKey: ["ac-users"] });
    },
  });

  const users = usersQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (tab !== "all" && u.plan !== tab) return false;
      if (q && !u.email.toLowerCase().includes(q) && !(u.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, tab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const counts = useMemo(
    () => ({
      all: users.length,
      free: users.filter((u) => u.plan === "free").length,
      starter: users.filter((u) => u.plan === "starter").length,
      growth: users.filter((u) => u.plan === "growth").length,
    }),
    [users],
  );

  return (
    <div className="space-y-5">
      <PageHead
        title="Users & Organizations"
        subtitle={`Manage every account on Osciva AI · ${users.length} total`}
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <FilterTabs
            tabs={[
              { key: "all" as PlanTab, label: "All", count: counts.all },
              { key: "free" as PlanTab, label: "Free", count: counts.free },
              { key: "starter" as PlanTab, label: "Starter", count: counts.starter },
              { key: "growth" as PlanTab, label: "Growth", count: counts.growth },
            ]}
            active={tab}
            onChange={(k) => {
              setTab(k);
              setPage(0);
            }}
          />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Filter by name or email…"
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th first>Account</Th>
              <Th>Plan</Th>
              <Th>Agents</Th>
              <Th>Msgs (30d)</Th>
              <Th>Quota</Th>
              <Th>MRR</Th>
              <Th>Joined</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <RowsSkeleton cols={8} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <UsersIcon size={20} className="mx-auto text-foreground-muted mb-2" />
                  <p className="text-[13px] text-foreground-muted">
                    {users.length === 0 ? "No accounts yet." : "No accounts match the current filter."}
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.user_id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                  <Td first>
                    <p className="text-[13px] font-semibold text-foreground truncate max-w-[240px] flex items-center gap-1.5">
                      {u.name || u.email.split("@")[0]}
                      {u.is_admin && <ShieldCheck size={13} className="text-primary shrink-0" />}
                    </p>
                    <p className="text-[11.5px] text-foreground-muted truncate max-w-[240px]">{u.email}</p>
                  </Td>
                  <Td>
                    <Select
                      value={u.plan}
                      disabled={setPlan.isPending}
                      onValueChange={(plan) => {
                        if (plan !== u.plan) setPlan.mutate({ userId: u.user_id, plan });
                      }}
                    >
                      <SelectTrigger className={`h-7 w-[104px] rounded-full border-0 text-[11.5px] font-semibold capitalize px-3 ${planBadgeClass[u.plan] ?? planBadgeClass.free}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLANS.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize text-[12.5px]">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Td>
                  <Td className="text-foreground-secondary tabular-nums">{u.agent_count}</Td>
                  <Td className="text-foreground-secondary tabular-nums">{u.msgs_30d.toLocaleString()}</Td>
                  <Td>
                    {u.plan === "free" ? (
                      <span className={`tabular-nums ${u.msgs_month >= FREE_MSG_QUOTA * 0.8 ? "text-warning font-semibold" : "text-foreground-secondary"}`}>
                        {u.msgs_month}/{FREE_MSG_QUOTA}
                      </span>
                    ) : (
                      <span className="text-foreground-muted">BYOK</span>
                    )}
                  </Td>
                  <Td className="text-foreground-secondary tabular-nums whitespace-nowrap">
                    {planPrices[u.plan] ? inr(planPrices[u.plan]) : "—"}
                  </Td>
                  <Td className="text-foreground-muted whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Td>
                  <Td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors" aria-label="Account actions">
                          <MoreVertical size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-[12.5px]">
                        <DropdownMenuItem onClick={() => setRename({ userId: u.user_id, email: u.email, name: u.name ?? "" })}>
                          <Pencil size={13} className="mr-2" /> Rename account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={u.plan !== "free" || u.msgs_month === 0}
                          onClick={() => resetUsage.mutate(u.user_id)}
                        >
                          <RotateCcw size={13} className="mr-2" /> Reset free usage ({u.msgs_month}/{FREE_MSG_QUOTA})
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>

        <div className="flex items-center justify-between pt-4">
          <p className="text-[11.5px] text-foreground-muted">
            Showing {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} accounts
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-secondary text-foreground-secondary hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-secondary text-foreground-secondary hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <Dialog open={!!rename} onOpenChange={(open) => !open && setRename(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Rename account</DialogTitle>
            <DialogDescription className="text-[12.5px]">{rename?.email}</DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            value={rename?.name ?? ""}
            onChange={(e) => setRename((r) => (r ? { ...r, name: e.target.value } : r))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && rename && rename.name.trim()) {
                renameUser.mutate({ userId: rename.userId, name: rename.name.trim() });
              }
            }}
            placeholder="Display name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13.5px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <DialogFooter>
            <button
              onClick={() => setRename(null)}
              className="px-4 py-2 rounded-xl bg-secondary text-foreground-secondary text-[12.5px] font-semibold hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!rename?.name.trim() || renameUser.isPending}
              onClick={() => rename && renameUser.mutate({ userId: rename.userId, name: rename.name.trim() })}
              className="px-4 py-2 rounded-xl bg-primary text-white text-[12.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-60"
            >
              {renameUser.isPending ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
