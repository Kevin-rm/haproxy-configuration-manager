"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

export default function LogsPage(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={[{label: "autres", link: "#"}, {label: "Logs"}]}>
      Hello
    </ContentLayout>
  );
}
