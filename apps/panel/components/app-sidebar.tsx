"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
  Bot,
  GalleryVerticalEnd,
  type LucideIcon,
  SquareTerminal,
  UsersRound,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

type SidebarAccess = {
  roleLabel: string;
  canReadArticles: boolean;
  canCreateArticles: boolean;
  canManageSite: boolean;
  canReadUsers: boolean;
};

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: { title: string; url: string }[];
};

export function AppSidebar({
  user,
  access,
  ...props
}: {
  user: { name: string; email: string; avatar: string };
  access: SidebarAccess;
} & React.ComponentProps<typeof Sidebar>) {
  const navMain: NavItem[] = [];

  if (access.canReadArticles) {
    navMain.push({
      title: "Artigos",
      url: "/panel/blog",
      icon: SquareTerminal,
      isActive: true,
      items: [
        ...(access.canCreateArticles
          ? [
              {
                title: "Escrever artigo",
                url: "/panel/blog/create",
              },
            ]
          : []),
        {
          title: "Lista de artigos",
          url: "/panel/blog/articles",
        },
      ],
    });
  }

  if (access.canManageSite) {
    navMain.push({
      title: "Informações gerais",
      url: "/panel/blog/general-information/",
      icon: Bot,
      items: [
        {
          title: "Canais para contato",
          url: "/panel/blog/general-information/contact-channels",
        },
      ],
    });
  }

  if (access.canReadUsers) {
    navMain.push({
      title: "Administração",
      url: "/panel/admin",
      icon: UsersRound,
      items: [
        {
          title: "Usuários",
          url: "/panel/admin/users",
        },
      ],
    });
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "Kianda",
              logo: GalleryVerticalEnd,
              plan: access.roleLabel,
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        {navMain.length > 0 && <NavMain items={navMain} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
