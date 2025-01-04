import React, {ReactNode} from "react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

type ContentLayoutProps = {
  children: ReactNode;
  breadcrumbItems: {
    label: string;
    link?: string;
  }[];
}

export default function ContentLayout({children, breadcrumbItems}: Readonly<ContentLayoutProps>) {
  return (
    <>
      <header
        className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1"/>
          <Separator orientation="vertical" className="mr-2 h-4"/>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((breadcrumbItem, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {breadcrumbItem.link ? (
                      <BreadcrumbLink href={breadcrumbItem.link}>{breadcrumbItem.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumbItem.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {children}
      </div>
    </>
  );
}
