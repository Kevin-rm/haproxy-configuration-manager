"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@/components/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export default function BackendForm({ backend }) {
  const router = useRouter();
  const isEdit = !!backend;
  const [servers, setServers] = useState(backend?.servers || []);

  const addServer = () => {
    setServers([...servers, { name: "", ip_address: "", port: "", check: false }]);
  };

  const removeServer = (index) => {
    setServers(servers.filter((_, i) => i !== index));
  };

  const updateServerField = (index, field, value) => {
    const updatedServers = servers.map((server, i) =>
      i === index ? { ...server, [field]: value } : server
    );
    setServers(updatedServers);
  };

  return (
    <ContentLayout
      breadcrumbItems={[
        { label: "Accueil", link: "/" },
        { label: "Backend", link: "/backend" },
        { label: isEdit ? "Modifier" : "Ajouter" },
      ]}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Modifier le backend" : "Ajouter un backend"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration du backend</CardTitle>
          <CardDescription>
            Définissez les paramètres de votre backend HAProxy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form>
            <div className="space-y-6">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="mon-backend" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le nom unique de votre backend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="tcp">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le mode de fonctionnement du backend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Serveurs</h3>
                  <Button type="button" onClick={addServer} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un serveur
                  </Button>
                </div>

                {servers.map((server, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <FormItem className="flex-1">
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          value={server.name}
                          onChange={(e) =>
                            updateServerField(index, "name", e.target.value)
                          }
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="flex-1">
                      <FormLabel>Adresse IP</FormLabel>
                      <FormControl>
                        <Input
                          value={server.ip_address}
                          onChange={(e) =>
                            updateServerField(index, "ip_address", e.target.value)
                          }
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="flex-1">
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={server.port}
                          onChange={(e) =>
                            updateServerField(index, "port", e.target.value)
                          }
                        />
                      </FormControl>
                    </FormItem>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeServer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit">
                  {isEdit ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
