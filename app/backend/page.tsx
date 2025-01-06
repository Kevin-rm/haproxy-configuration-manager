"use client";

import {JSX} from "react";
import ContentLayout from "@/components/content-layout";

const breadcrumbItems = [
  {label: "Backend", link: "/backend"},
  {label: "Liste"}
];

export default function BackendList(): JSX.Element {
  return (
    <ContentLayout breadcrumbItems={breadcrumbItems}>
      Backends
    </ContentLayout>
  );
}
