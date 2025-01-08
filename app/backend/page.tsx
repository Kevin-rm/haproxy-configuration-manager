"use client";

import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {CheckCircle2, ChevronDown, ChevronRight, CirclePlus, Pencil, Settings2, Trash2, XCircle} from "lucide-react";
import ContentLayout from "@/components/content-layout";
import Link from "next/link";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Backend} from "@/lib/haproxy-service";

export default function BackendList() {
  const [backends, setBackends] = useState<Backend[]>([]);
  const [, setLoading] = useState<Boolean>(true);
  const [expandedBackends, setExpandedBackends] = useState<Set<string>>(new Set());

  const fetchBackends = async () => {
    setLoading(true);

    const response = await fetch("/api/config-file?parse=true");
    const {contents} = await response.json();

    return contents.backends;
  }

  useEffect(() => {
    fetchBackends().then(data => {
      setBackends(data);
      setLoading(false);
    });
  }, []);

  const toggleBackend = (backendName) => {
    const newExpanded = new Set(expandedBackends);
    if (newExpanded.has(backendName)) newExpanded.delete(backendName);
    else newExpanded.add(backendName);

    setExpandedBackends(newExpanded);
  };

  return (
    <ContentLayout breadcrumbItems={[
      {label: "Backend", link: "/backend"},
      {label: "Liste"},
    ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Backends</h1>
            <p className="text-muted-foreground">
              Vos configurations de backends
            </p>
          </div>
          <Button asChild>
            <Link href="/backend/ajout">
              <CirclePlus/> Ajouter
            </Link>
          </Button>
        </div>

        <Table>
          <TableCaption>Liste des backends</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Nombre de serveurs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backends.map((backend, index) => (
              <React.Fragment key={index}>
                <TableRow className="group">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBackend(backend.name)}
                      className="h-8 w-8 transition-transform"
                    >
                      {expandedBackends.has(backend.name) ? (<ChevronDown/>) : (<ChevronRight/>)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{backend.name}</span>
                  </TableCell>
                  <TableCell>
                    {backend.mode ? (
                      <Badge
                        variant={backend.mode === "http" ? "default" : "secondary" as keyof {
                          default: string,
                          secondary: string,
                          destructive: string,
                          outline: string
                        }}
                        className="uppercase"
                      > {backend.mode} </Badge>
                    ) : "Hérite les configurations par défaut"}
                  </TableCell>
                  <TableCell>
                    {backend.servers.length} serveur{backend.servers.length > 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings2 className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/backend/${backend.name}/edit`} className="flex items-center">
                            <Pencil className="h-4 w-4 mr-2"/>
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2"/>
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedBackends.has(backend.name) && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/50 p-6">
                      <div className="rounded-lg border bg-background p-4">
                        <h4 className="text-lg font-semibold mb-4">Liste des serveurs</h4>
                        <div className="grid gap-4">
                          {backend.servers.map((server) => (
                            <div
                              key={`${backend.name}-${server.name}`}
                              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium">{server.name}</h5>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {server.ip_address}:{server.port}
                                </p>
                              </div>
                              <Badge
                                variant={server.check ? "success" : "secondary"}
                                className="flex items-center gap-2"
                              >
                                {server.check ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3"/> Check actif
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3"/> Check inactif
                                  </>
                                )}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentLayout>
  );
}
