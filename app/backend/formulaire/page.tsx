"use client";

import React from "react";
import {useRouter} from "next/navigation";
import ContentLayout from "@/components/content-layout";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useFieldArray, useForm} from "react-hook-form";
import {toast} from "@/hooks/use-toast";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CirclePlus, Trash2} from "lucide-react";
import {Backend} from "@/lib/haproxy-service";

const serverSchema = z.object({
  name: z.string().min(1, "Le nom du serveur est requis"),
  ip_address: z.string().min(1, "L'adresse IP est requise"),
  port: z.number().min(1, "Le port est requis"),
  check: z.boolean().optional()
});

const backendSchema = z.object({
  name: z.string().min(1, "Le nom du backend est requis"),
  mode: z.enum(["http", "tcp"], "Le mode est requis"),
  servers: z.array(serverSchema)
});

type BackendFormValues = z.infer<typeof backendSchema>;

export default function BackendForm({backend}: { backend?: Backend }) {
  const router = useRouter();
  const isUpdate = !!backend;

  const form = useForm<BackendFormValues>({
    resolver: zodResolver(backendSchema),
    defaultValues: {
      name: backend?.name,
      mode: backend?.mode || "http",
      servers: backend?.servers
    }
  });

  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: "servers",
  });

  const saveBackend = async (values: BackendFormValues) => {
    const response = await fetch(isUpdate ? `/api/backends/${backend.name}` : "/api/backends", {
      method: isUpdate ? "PUT" : "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(values)
    });

    if (!response.ok) throw new Error("Une erreur s'est produite lors de l'enregistrement de backend");
  };

  const handleSubmit = (values: BackendFormValues) => {
    saveBackend(values)
      .then(() => {
        toast({
          title: isUpdate ? "Backend mis à jour" : "Backend créé",
          description: `Le backend "${values.name}" a été ${isUpdate ? "mis à jour" : "créé"} avec succès`,
        });
      })
      .catch((error) => {
        console.error(error);

        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer le backend",
          variant: "destructive",
        });
      })
      .finally(() => router.push("/backend"));
  }

  return (
    <ContentLayout
      breadcrumbItems={[
        {label: "Backend", link: "/backend"},
        {label: isUpdate ? "Modifier" : "Créer"},
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {isUpdate ? "Modification" : "Création"} de Backend
            </h1>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="bg-secondary/50">
            <CardTitle className="flex items-center space-x-2 text-xl">
              Formulaire
            </CardTitle>
            <CardDescription>
              Entrer les informations de serveur backend
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Nom</FormLabel>
                        <FormControl>
                          <Input className="h-11 bg-secondary/5" placeholder="ex: web_backend" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mode"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-secondary/5">
                              <SelectValue placeholder="Choisir un mode"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="http">HTTP</SelectItem>
                            <SelectItem value="tcp">TCP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Serveurs</h3>
                      <p className="text-sm text-muted-foreground">
                        Paramétrer les serveurs qui feront partie de ce backend
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({name: "", ip_address: "", port: 80, check: false})}
                      className="bg-secondary/5 hover:bg-secondary/20 transition-colors"
                    >
                      <CirclePlus className="h-4 w-4 mr-2"/>
                      Ajouter un serveur
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        className="relative border bg-card"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="absolute right-3 top-3 h-7 w-7 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>

                        <CardContent className="p-5">
                          <div className="mb-5 flex items-center">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2.5">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                            <h4 className="text-sm font-medium">
                              Serveur {index + 1}
                            </h4>
                          </div>

                          <div className="grid gap-5">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`servers.${index}.name`}
                                render={({field}) => (
                                  <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                      <Input
                                        className="h-8 bg-background"
                                        placeholder="ex: server1"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage/>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`servers.${index}.ip_address`}
                                render={({field}) => (
                                  <FormItem>
                                    <FormLabel>Adresse IP</FormLabel>
                                    <FormControl>
                                      <Input
                                        className="h-8 bg-background"
                                        placeholder="ex: 192.168.1.10"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage/>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`servers.${index}.port`}
                                render={({field}) => (
                                  <FormItem>
                                    <FormLabel>Port</FormLabel>
                                    <FormControl>
                                      <Input
                                        className="h-8 bg-background"
                                        type="number"
                                        placeholder="ex: 80"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage/>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`servers.${index}.check`}
                                render={({field}) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0 pt-4">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel>Activer la vérification de l'état</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t p-6">
                <Button type="submit" className="w-32 transition-colors">
                  {isUpdate ? "Modifier" : "Soumettre"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </ContentLayout>
  );
}
