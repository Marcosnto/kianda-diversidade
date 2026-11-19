"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

export function TeamSwitcher({
	teams,
}: {
	teams: {
		name: string;
		logo: React.ElementType | string;
		plan: string;
	}[];
}) {
	const { isMobile } = useSidebar();
	const [activeTeam, setActiveTeam] = React.useState(teams[0]);

	if (!activeTeam) {
		return null;
	}

	const renderLogo = (logo: React.ElementType | string, className: string) => {
		if (typeof logo === "string") {
			// eslint-disable-next-line @next/next/no-img-element
			return <img alt="" className={className} src={logo} />;
		}
		const Logo = logo;
		return <Logo className={className} />;
	};

	if (teams.length === 1) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg">
						<div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							{renderLogo(activeTeam.logo, "size-full object-cover")}
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{activeTeam.name}</span>
							<span className="truncate text-xs">{activeTeam.plan}</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								{renderLogo(activeTeam.logo, "size-full object-cover")}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{activeTeam.name}</span>
								<span className="truncate text-xs">{activeTeam.plan}</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							Teams
						</DropdownMenuLabel>
						{teams.map((team, index) => (
							<DropdownMenuItem
								key={team.name}
								onClick={() => setActiveTeam(team)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
									{renderLogo(team.logo, "size-full object-cover")}
								</div>
								{team.name}
								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Plus className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Add team</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
