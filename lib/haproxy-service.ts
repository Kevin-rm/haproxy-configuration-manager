import fs from "fs";
import {HAPROXY_CONFIG_FILE_PATH, UTF8_ENCODING} from "@/lib/constants";

export function getConfigFileContents(): string {
  try {
    return fs.readFileSync(HAPROXY_CONFIG_FILE_PATH, UTF8_ENCODING);
  } catch (error) {
    throw new Error("Impossible de recupérer le contenu du fichier de configuration", {cause: error});
  }
}

export function writeContentsToConfigFile(contents: string): void {
  try {
    fs.writeFileSync(HAPROXY_CONFIG_FILE_PATH, contents, UTF8_ENCODING);
  } catch (error) {
    throw new Error("Erreur durant la sauvegarde du fichier de configuration", {cause: error});
  }
}

interface Server {
  name: string;
  ip_address: string;
  port: number;
  check?: boolean;
}

interface Bind {
  ip_address: string;
  port: number;
}

interface Backend {
  name: string;
  mode?: "http" | "tcp";
  servers: Server[];
}

interface Frontend {
  name: string;
  mode?: "http" | "tcp";
  binds: Bind[],
  default_backend: Backend;
}

interface HAProxyConfig {
  global: string[];
  defaults: string[];
  frontends: Frontend[];
  backends: Backend[];
}

export function parseConfigFileContents(contents: string): HAProxyConfig {
  const lines = contents.split("\n");

  const global: string[] = [];
  const defaults: string[] = [];
  const frontends: Frontend[] = [];
  const backends: Backend[] = [];

  let currentSection: "frontend" | "backend" | "global" | "defaults" | null = null;
  let currentFrontend: Partial<Frontend> | null = null;
  let currentBackend: Partial<Backend> | null = null;

  const parseBindLine = (line: string): Bind => {
    const parts = line.split(" ")[1].split(":");
    return {
      ip_address: parts[0],
      port: parseInt(parts[1], 10)
    };
  };

  const parseServerLine = (line: string): Server => {
    const parts = line.split(" ");
    const [name, address] = parts.slice(1);
    const [ip, port] = address.split(":");
    return {
      name,
      ip_address: ip,
      port: parseInt(port, 10),
      check: parts.includes("check")
    };
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "" || trimmedLine.startsWith("#")) continue;

    if (trimmedLine.startsWith("frontend")) {
      currentSection = "frontend";
      if (currentFrontend) frontends.push(currentFrontend as Frontend);

      currentFrontend = {
        name: trimmedLine.split(" ")[1],
        binds: [],
      };
      continue;
    }

    if (trimmedLine.startsWith("backend")) {
      currentSection = "backend";
      if (currentBackend) backends.push(currentBackend as Backend);

      currentBackend = {
        name: trimmedLine.split(" ")[1],
        servers: []
      };
      continue;
    }

    if (trimmedLine.startsWith("global")) {
      currentSection = "global";
      continue;
    }

    if (trimmedLine.startsWith("defaults")) {
      currentSection = "defaults";
      continue;
    }

    switch (currentSection) {
      case "frontend":
        if (!currentFrontend) break;

        if (trimmedLine.startsWith("bind"))
          currentFrontend.binds?.push(parseBindLine(trimmedLine));
        else if (trimmedLine.startsWith("mode"))
          currentFrontend.mode = trimmedLine.split(" ")[1] as "http" | "tcp";
        else if (trimmedLine.startsWith("default_backend")) {
          const backendName = trimmedLine.split(" ")[1];
          const defaultBackend = backends.find(b => b.name === backendName);
          if (defaultBackend) currentFrontend.default_backend = defaultBackend;
        }
        break;

      case "backend":
        if (!currentBackend) break;

        if (trimmedLine.startsWith("server"))
          currentBackend.servers?.push(parseServerLine(trimmedLine));
        else if (trimmedLine.startsWith("mode"))
          currentBackend.mode = trimmedLine.split(" ")[1] as "http" | "tcp";
        break;

      case "global":
        global.push(trimmedLine);
        break;

      case "defaults":
        defaults.push(trimmedLine);
        break;
    }
  }

  if (currentFrontend) frontends.push(currentFrontend as Frontend);
  if (currentBackend) backends.push(currentBackend as Backend);

  return {global, defaults, frontends, backends};
}
