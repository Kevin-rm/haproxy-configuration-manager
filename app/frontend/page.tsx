"use client";

import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {AlertCircle, CirclePlus, Pencil, Settings2, Trash2} from "lucide-react";
import ContentLayout from "@/components/content-layout";
import Link from "next/link";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Frontend} from "@/lib/haproxy-service";
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

const deleteFrontend = async (name: string) => {
  const response = await fetch(`/api/frontends/${name}`, {
    method: "DELETE",
  });

  const jsonResponse = await response.json();
  if (!response.ok) throw new Error(jsonResponse.error);

  return jsonResponse;
}

export default function FrontendList() {
  const [frontends, setFrontends] = useState<Frontend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [frontendToDelete, setFrontendToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const {toast} = useToast();

  const fetchFrontends = async () => {
    setLoading(true);

    const response = await fetch("/api/config-file?parse=true");
    const {contents} = await response.json();

    return contents.frontends;
  }

  const handleDeleteFrontend = async () => {
    if (!frontendToDelete) return;

    setIsDeleting(true);
    deleteFrontend(frontendToDelete)
      .then(value => {
        setFrontends(prevFrontends =>
          prevFrontends.filter(frontend => frontend.name !== frontendToDelete));

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
        setFrontendToDelete(null);
      });
  }

  useEffect(() => {
    fetchFrontends()
      .then(data => setFrontends(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentLayout breadcrumbItems={[
      {label: "Frontend", link: "/frontend"},
      {label: "Liste"},
    ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Frontends</h1>
            <p className="text-muted-foreground">
              Vos configurations de frontends
            </p>
          </div>
          <Button asChild>
            <Link href="/frontend/formulaire">
              <CirclePlus/> Ajouter
            </Link>
          </Button>
        </div>

        <Table>
          <TableCaption>Liste des frontends</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Bind</TableHead>
              <TableHead>Backend par défaut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frontends.map((frontend, index) => (
              <TableRow key={index} className="group hover:bg-muted/30 transition-colors">
                <TableCell>
                  <span className="font-medium">{frontend.name}</span>
                </TableCell>
                <TableCell>
                  {frontend.mode ? (
                    <Badge
                      variant={frontend.mode === "http" ? "default" : "secondary" as keyof {
                        default: string,
                        secondary: string,
                        destructive: string,
                        outline: string
                      }}
                      className="uppercase"
                    > {frontend.mode} </Badge>
                  ) : "Hérite les configurations par défaut"}
                </TableCell>
                <TableCell>
                  {frontend.binds.map((bind, i) =>
                    <span key={i}>
                      {bind.ip_address}:{bind.port}
                      {i < frontend.binds.length - 1 ? " ; " : ""}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {frontend.default_backend}
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
                        <Link href={`/frontend/formulaire/${frontend.name}`} className="flex items-center">
                          <Pencil className="h-4 w-4 mr-2"/> Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setFrontendToDelete(frontend.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2"/> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!frontendToDelete} onOpenChange={(open) => !open && setFrontendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive"/>
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le frontend <strong>{frontendToDelete}</strong> ?
              <br/>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFrontend}
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
