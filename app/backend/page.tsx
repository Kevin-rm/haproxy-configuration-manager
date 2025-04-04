"use client";

import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Pencil,
  Settings2,
  Trash2,
  XCircle
} from "lucide-react";
import ContentLayout from "@/components/content-layout";
import Link from "next/link";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Backend} from "@/lib/haproxy-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {useToast} from "@/hooks/use-toast";

const SERVER_HEIGHT = 90;

const deleteBackend = async (name: string) => {
  const response = await fetch(`/api/backends/${name}`, {
    method: "DELETE",
  });

  const jsonResponse = await response.json();
  if (!response.ok) throw new Error(jsonResponse.error);

  return jsonResponse;
}

export default function BackendList() {
  const [backends, setBackends] = useState<Backend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedBackends, setExpandedBackends] = useState<Set<string>>(new Set());
  const [backendToDelete, setBackendToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const {toast} = useToast();

  const getScrollAreaHeight = (serversCount: number) => {
    if (serversCount <= 0) return "auto";
    if (serversCount <= 3) return `${serversCount * SERVER_HEIGHT}px`;
    return `${3 * SERVER_HEIGHT}px`;
  };

  const toggleBackend = (backendName: string) => {
    const newExpanded = new Set(expandedBackends);
    if (newExpanded.has(backendName)) newExpanded.delete(backendName);
    else newExpanded.add(backendName);

    setExpandedBackends(newExpanded);
  };

  const fetchBackends = async () => {
    setLoading(true);

    const response = await fetch("/api/config-file?parse=true");
    const {contents} = await response.json();

    return contents.backends;
  }

  const handleDeleteBackend = async () => {
    if (!backendToDelete) return;

    setIsDeleting(true);
    deleteBackend(backendToDelete)
      .then(value => {
        setBackends(prevBackends =>
          prevBackends.filter(backend => backend.name !== backendToDelete));

        toast({
          title: "Succès",
          description: value.message
        });
      })
      .catch(reason =>
        toast({
          title: "Erreur",
          description: reason.message,
          variant: "destructive"
        }))
      .finally(() => {
        setIsDeleting(false);
        setBackendToDelete(null);
      });
  }

  useEffect(() => {
    fetchBackends()
      .then(data => setBackends(data))
      .finally(() => setLoading(false));
  }, []);

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
            <Link href="/backend/formulaire">
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
                <TableRow className="group hover:bg-muted/30 transition-colors">
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
                          <Link href={`/backend/formulaire/${backend.name}`} className="flex items-center">
                            <Pencil className="h-4 w-4 mr-2"/> Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setBackendToDelete(backend.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2"/> Supprimer
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
                        <ScrollArea
                          className="w-full rounded-md"
                          style={{height: getScrollAreaHeight(backend.servers.length)}}
                        >
                          <div className="grid gap-4 pr-4">
                            {backend.servers.map((server, index) => (
                              <div
                                key={index}
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
                                  className={`flex items-center gap-2 px-3 py-1 transition-colors ${
                                    server.check
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {server.check ?
                                    (<><CheckCircle2 className="h-3 w-3"/> Check actif</>) :
                                    (<><XCircle className="h-3 w-3"/> Check inactif</>)
                                  }
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!backendToDelete} onOpenChange={(open) => !open && setBackendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive"/>
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le backend <strong>{backendToDelete}</strong> ?
              <br/>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBackend}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
}
