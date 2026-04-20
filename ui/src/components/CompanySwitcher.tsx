import { ChevronsUpDown, Plus, Settings } from "lucide-react";
import { Link } from "@/lib/router";
import { useCompany } from "../context/CompanyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function statusDotColor(status?: string): string {
  switch (status) {
    case "active":
      return "bg-green-400";
    case "paused":
      return "bg-yellow-400";
    case "archived":
      return "bg-neutral-400";
    default:
      return "bg-green-400";
  }
}

const COMPANY_DISPLAY_ALIASES: Record<string, { displayName: string; logo?: string }> = {
  ClaimOz_Company: { displayName: "ClaimOz", logo: "/claimoz-32.png" },
};

function companyDisplay(name?: string): { displayName: string; logo?: string } {
  if (!name) return { displayName: "" };
  return COMPANY_DISPLAY_ALIASES[name] ?? { displayName: name };
}

export function CompanySwitcher() {
  const { companies, selectedCompany, setSelectedCompanyId } = useCompany();
  const sidebarCompanies = companies.filter((company) => company.status !== "archived");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-1.5 h-auto text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const { displayName, logo } = companyDisplay(selectedCompany?.name);
              return (
                <>
                  {logo && (
                    <img
                      src={logo}
                      alt=""
                      className="h-4 w-4 shrink-0 rounded-sm object-contain"
                    />
                  )}
                  {selectedCompany && (
                    <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColor(selectedCompany.status)}`} />
                  )}
                  <span className="text-sm font-medium truncate">
                    {selectedCompany ? displayName : "Select company"}
                  </span>
                </>
              );
            })()}
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Companies</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sidebarCompanies.map((company) => {
          const { displayName, logo } = companyDisplay(company.name);
          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              className={company.id === selectedCompany?.id ? "bg-accent" : ""}
            >
              {logo && (
                <img
                  src={logo}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded-sm object-contain mr-2"
                />
              )}
              <span className={`h-2 w-2 rounded-full shrink-0 mr-2 ${statusDotColor(company.status)}`} />
              <span className="truncate">{displayName}</span>
            </DropdownMenuItem>
          );
        })}
        {sidebarCompanies.length === 0 && (
          <DropdownMenuItem disabled>No companies</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/company/settings" className="no-underline text-inherit">
            <Settings className="h-4 w-4 mr-2" />
            Company Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/companies" className="no-underline text-inherit">
            <Plus className="h-4 w-4 mr-2" />
            Manage Companies
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
