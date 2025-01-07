"use client";

import React, {JSX, useState} from "react";
import ContentLayout from "@/components/content-layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@radix-ui/react-menu";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRouter} from "next/navigation";

const breadcrumbItems = [
  {label: "Backend", link: "/backend"},
  {label: "Ajout"}
];

export default function AddBackend(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    mode: "tcp",
    servers: [{ name: "", ip_address: "", port: "", check: true }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement save logic here
    await router.push("/backend");
  };

  const addServer = () => {
    setFormData({
      ...formData,
      servers: [
        ...formData.servers,
        { name: "", ip_address: "", port: "", check: true },
      ],
    });
  };

  return (
    <ContentLayout breadcrumbItems={breadcrumbItems}>
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>New Backend Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) =>
                    setFormData({...formData, mode: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Servers</Label>
                  <Button type="button" variant="outline" onClick={addServer}>
                    Add Server
                  </Button>
                </div>

                {formData.servers.map((server, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={server.name}
                        onChange={(e) => {
                          const newServers = [...formData.servers];
                          newServers[index].name = e.target.value;
                          setFormData({...formData, servers: newServers});
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label>IP Address</Label>
                      <Input
                        value={server.ip_address}
                        onChange={(e) => {
                          const newServers = [...formData.servers];
                          newServers[index].ip_address = e.target.value;
                          setFormData({...formData, servers: newServers});
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label>Port</Label>
                      <Input
                        type="number"
                        value={server.port}
                        onChange={(e) => {
                          const newServers = [...formData.servers];
                          newServers[index].port = e.target.value;
                          setFormData({...formData, servers: newServers});
                        }}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/backend")}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Backend</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
