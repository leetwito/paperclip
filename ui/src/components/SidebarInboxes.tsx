import { Inbox as InboxIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@paperclipai/shared";
import { SidebarNavItem } from "./SidebarNavItem";
import { useInboxBadge } from "../hooks/useInboxBadge";
import { agentsApi } from "../api/agents";
import { queryKeys } from "../lib/queryKeys";

// Shallowest (no reportsTo) first; tiebreaker by name.
function sortByDepthThenName(a: Agent, b: Agent): number {
  const aDepth = a.reportsTo ? 1 : 0;
  const bDepth = b.reportsTo ? 1 : 0;
  if (aDepth !== bDepth) return aDepth - bDepth;
  return a.name.localeCompare(b.name);
}

export function SidebarInboxes({ companyId }: { companyId: string }) {
  const inboxBadge = useInboxBadge(companyId);

  const { data: humans = [] } = useQuery({
    queryKey: queryKeys.agents.humanAgents(companyId),
    queryFn: () => agentsApi.list(companyId, { kind: "human" }),
    enabled: !!companyId,
  });

  const sorted = [...humans].sort(sortByDepthThenName);

  return (
    <div className="flex flex-col">
      <SidebarNavItem
        to="/inbox"
        label="Inbox"
        icon={InboxIcon}
        badge={inboxBadge.inbox}
        badgeTone={inboxBadge.failedRuns > 0 ? "danger" : "default"}
        alert={inboxBadge.failedRuns > 0}
      />
      {sorted.length > 0 && (
        <div className="flex flex-col pl-5">
          {sorted.map((h) => (
            <SidebarNavItem
              key={h.id}
              to={`/inbox/${h.id}`}
              label={h.name}
              icon={InboxIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}
