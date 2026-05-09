"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Kianda",
      logo: GalleryVerticalEnd,
      plan: "Administrador",
    },
    {
      name: "Kianda",
      logo: AudioWaveform,
      plan: "Editor",
    },
    {
      name: "Kianda",
      logo: Command,
      plan: "Psicologo",
    },
  ],
  navMain: [
    {
      title: "Artigos",
      url: "/blog",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Escrever Artigo",
          url: "/blog/create",
        },
        {
          title: "Lista de Artigos",
          url: "/blog/articles",
        },
      ],
    },
    {
      title: "Informações Gerais",
      url: "/blog/general-information/",
      icon: Bot,
      items: [
        {
          title: "Como Kianda Atua",
          url: "/blog/general-information/how-kianda-works",
        },
        {
          title: "Sobre o Kianda",
          url: "/blog/general-information/about-kianda",
        },
        {
          title: "Canais para contato",
          url: "/blog/general-information/contact-channels",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Cadastrar Paciente",
      url: "#",
      icon: Frame,
    },
    {
      name: "Listar Pacientes",
      url: "#",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
