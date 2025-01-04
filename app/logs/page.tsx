"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

export default function LogsPage(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={[{label: "Logs"}]}>
      Hello
    </ContentLayout>
  );
}
