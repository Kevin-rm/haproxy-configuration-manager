"use client"

import * as React from "react"
import {forwardRef, JSX} from "react"
import {BrainCircuit, ChevronRight, Cog, FileCog, FileText, Globe, LucideIcon, Server,} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import Link from "next/link";

const data = {
  headerContent: {
    title: "HAProxy Manager",
    subtitle: "Application",
    url: "/",
    icon: Cog
  },
  mainItems: [
    {
      title: "Backend",
      icon: BrainCircuit,
      subItems: [
        {
          title: "Liste",
          url: "/backend"
        },
        {
          title: "Ajout",
          url: "/backend/ajout"
        }
      ]
    },
    {
      title: "Frontend",
      icon: Globe,
      subItems: [
        {
          title: "Liste",
          url: "/frontend"
        },
        {
          title: "Ajout",
          url: "/frontend/ajout"
        }
      ]
    },
    {
      title: "Fichier de configuration",
      url: "/fichier-configuration",
      icon: FileCog
    }
  ],
  otherItems: [
    {
      title: "Voir les logs",
      url: "/logs",
      icon: FileText
    },
    {
      title: "Activer/Désactiver le serveur",
      url: "/activer-desactiver-serveur",
      icon: Server
    }
  ]
};

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>): JSX.Element {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderContent content={data.headerContent}/>
      </SidebarHeader>
      <SidebarContent>
        <NavigationMain items={data.mainItems}/>
        <NavigationOthers items={data.otherItems}/>
      </SidebarContent>
      <SidebarRail/>
    </Sidebar>
  );
}

function SidebarHeaderContent({content}: {
  content: {
    title: string;
    subtitle: string;
    url: string;
    icon: LucideIcon;
  }
}): JSX.Element {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <a href={content.url}>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {<content.icon className="size-5"/>}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{content.title}</span>
              <span className="truncate text-xs">{content.subtitle}</span>
            </div>
          </SidebarMenuButton>
        </a>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavigationMain({items}: {
  items: {
    title: string;
    icon: LucideIcon;
    isActive?: boolean;
    url?: string;
    subItems?: {
      title: string;
      url: string;
    }[]
  }[]
}): JSX.Element {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Général</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((items) => (
          items.subItems ? (
            <Collapsible
              key={items.title}
              asChild
              defaultOpen={items.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={items.title}>
                    {<items.icon/>}
                    <span>{items.title}</span>
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {items.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <NavLink text={subItem.title} url={subItem.url}/>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={items.title}>
              <SidebarMenuButton tooltip={items.title} asChild>
                <NavLink text={items.title} url={items.url || "#"} icon={items.icon}/>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavigationOthers({items}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[]
}): JSX.Element {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Autres</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <NavLink text={item.title} url={item.url} icon={item.icon}/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavLink = forwardRef(({text, url, icon: Icon, ...props}: {
  text: string;
  url: string;
  icon?: LucideIcon;
}, ref) => (
  <Link href={url} ref={ref} {...props}>
    {Icon && <Icon/>}
    <span>{text}</span>
  </Link>
));
