"use client";

import ContentLayout from "@/components/content-layout";

export default function BackendForm({backend}) {
  return (
    <ContentLayout breadcrumbItems={[
      {label: "Backend", link: "/backend"},
      {label: "Formulaire"}
    ]}>

    </ContentLayout>
  );
}
