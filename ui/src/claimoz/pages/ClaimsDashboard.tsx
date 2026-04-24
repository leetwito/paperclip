import { useEffect } from "react";
import { useCompany } from "../../context/CompanyContext";
import { useDialog } from "../../context/DialogContext";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import { EmptyState } from "../../components/EmptyState";
import { LayoutDashboard } from "lucide-react";
import { PluginSlotOutlet } from "@/plugins/slots";
import { NorthStarMetrics } from "../components/NorthStarMetrics";
import { LiveTasksFeed } from "../components/LiveTasksFeed";
import { StatusDistribution } from "../components/StatusDistribution";
import { Pipeline } from "../components/Pipeline";
import { Bottlenecks } from "../components/Bottlenecks";
import { Reserves } from "../components/Reserves";
import { RegulatorySLAs } from "../components/RegulatorySLAs";
import { AgentPerformance } from "../components/AgentPerformance";
import { AutonomyDistribution } from "../components/AutonomyDistribution";
import { CSAT } from "../components/CSAT";
import { AIAcceptance } from "../components/AIAcceptance";
import { DecisionConsistency } from "../components/DecisionConsistency";

export function ClaimsDashboard() {
  const { selectedCompanyId, companies } = useCompany();
  const { openOnboarding } = useDialog();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "VP Dashboard" }]);
  }, [setBreadcrumbs]);

  if (!selectedCompanyId) {
    if (companies.length === 0) {
      return (
        <EmptyState
          icon={LayoutDashboard}
          message="Welcome to Paperclip. Set up your first company and agent to get started."
          action="Get Started"
          onAction={openOnboarding}
        />
      );
    }
    return (
      <EmptyState icon={LayoutDashboard} message="Create or select a company to view the dashboard." />
    );
  }

  return (
    <div className="space-y-6">
      <NorthStarMetrics />
      <LiveTasksFeed />
      <StatusDistribution />
      <Pipeline />
      <Bottlenecks />
      <Reserves />
      <RegulatorySLAs />
      <AgentPerformance />
      <AutonomyDistribution />
      <CSAT />
      <AIAcceptance />
      <DecisionConsistency />
      <PluginSlotOutlet
        slotTypes={["dashboardWidget"]}
        context={{ companyId: selectedCompanyId }}
        className="grid gap-4 md:grid-cols-2"
        itemClassName="rounded-lg border bg-card p-4 shadow-sm"
      />
    </div>
  );
}
