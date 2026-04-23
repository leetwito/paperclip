import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@paperclipai/shared";
import { agentsApi } from "../api/agents";
import { queryKeys } from "../lib/queryKeys";
import { useActingAs } from "../context/ActingAsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActingAsSwitcherProps {
  companyId: string;
  userName: string;
}

export function ActingAsSwitcher({ companyId, userName }: ActingAsSwitcherProps) {
  const { actingAsId, setActingAsId } = useActingAs();
  const { data: humans } = useQuery({
    queryKey: queryKeys.agents.humanAgents(companyId),
    queryFn: () => agentsApi.list(companyId, { kind: "human" }),
    enabled: !!companyId,
  });

  const list: Agent[] = humans ?? [];
  const selected = actingAsId ? list.find((a) => a.id === actingAsId) ?? null : null;

  const label = selected
    ? `${userName} → ${selected.name}`
    : "Acting as …";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="acting-as-trigger"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors max-w-[180px] truncate"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {list.length === 0 && (
          <DropdownMenuItem disabled data-testid="acting-as-empty">
            No human personas
          </DropdownMenuItem>
        )}
        {list.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            data-testid={`acting-as-item-${agent.id}`}
            onSelect={() => setActingAsId(agent.id)}
          >
            {agent.name}
          </DropdownMenuItem>
        ))}
        {selected && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="acting-as-clear"
              onSelect={() => setActingAsId(null)}
            >
              Clear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
