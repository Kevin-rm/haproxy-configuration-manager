import fs from "fs";
import {HAPROXY_CONFIG_FILE_PATH, UTF8_ENCODING} from "@/lib/constants";
import {execSync} from "node:child_process";

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

    execSync("sudo systemctl reload haproxy");
  } catch (error) {
    throw new Error("Erreur durant la sauvegarde du fichier de configuration", {cause: error});
  }
}

type Server = {
  name: string;
  ip_address: string;
  port: number;
  check?: boolean;
}

type Bind = {
  ip_address: string;
  port: number;
}

export type Backend = {
  name: string;
  mode?: "http" | "tcp";
  servers: Server[];
}

export type Frontend = {
  name: string;
  mode?: "http" | "tcp";
  binds: Bind[],
  default_backend: string;
}

export type HAProxyConfig = {
  global: string[];
  defaults: string[];
  frontends: Frontend[];
  backends: Backend[];
}

export type LogLevel = 'info' | 'warning' | 'error';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
}

export type ServiceStatus = {
  running: boolean;
  enabled: boolean;
  version: string;
  uptime: string;
}

export function getServiceStatus(): ServiceStatus {
  try {
    const isRunning = execSync('systemctl is-active haproxy').toString().trim() === 'active';
    const isEnabled = execSync('systemctl is-enabled haproxy').toString().trim() === 'enabled';
    const versionOutput = execSync('haproxy -v').toString().trim();
    const version = versionOutput.split('\n')[0];
    
    let uptime = 'Non disponible';
    if (isRunning) {
      try {
        const uptimeOutput = execSync('systemctl show haproxy --property=ActiveEnterTimestamp').toString().trim();
        const startTimeStr = uptimeOutput.split('=')[1].trim();

        // Convertir "Mon 2025-04-07 10:42:31 CEST" -> "2025-04-07T10:42:31"
        const match = startTimeStr.match(/\w+\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
        if (!match) throw new Error("Format de date inattendu : " + startTimeStr);

        const isoDateStr = `${match[1]}T${match[2]}`;
        const startTime = new Date(isoDateStr);

        const now = new Date();
        const uptimeMs = now.getTime() - startTime.getTime();
        
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        
        uptime = `${days} jours, ${hours} heures, ${minutes} minutes`;
      } catch (error) {
        uptime = 'Calcul impossible';
      }
    }
    
    return {
      running: isRunning,
      enabled: isEnabled,
      version,
      uptime
    };
  } catch (error) {
    throw new Error("Impossible de récupérer l'état du service HAProxy", {cause: error});
  }
}

export function startService(): void {
  try {
    execSync('sudo systemctl start haproxy');
  } catch (error) {
    throw new Error("Impossible de démarrer le service HAProxy", {cause: error});
  }
}

export function stopService(): void {
  try {
    execSync('sudo systemctl stop haproxy');
  } catch (error) {
    throw new Error("Impossible d'arrêter le service HAProxy", {cause: error});
  }
}

export function restartService(): void {
  try {
    execSync('sudo systemctl restart haproxy');
  } catch (error) {
    throw new Error("Impossible de redémarrer le service HAProxy", {cause: error});
  }
}

export function reloadService(): void {
  try {
    execSync('sudo systemctl reload haproxy');
  } catch (error) {
    throw new Error("Impossible de recharger la configuration HAProxy", {cause: error});
  }
}

export function validateConfig(): { valid: boolean; message: string } {
  try {
    const output = execSync('haproxy -c -f /etc/haproxy/haproxy.cfg').toString();
    return { 
      valid: true, 
      message: "La configuration HAProxy est valide."
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      valid: false, 
      message: `Configuration invalide: ${errorMessage}`
    };
  }
}

export function getLogs(limit: number = 100): LogEntry[] {
  try {
    const logOutput = execSync(`journalctl -u haproxy --no-pager -n ${limit}`).toString();
    const logLines = logOutput.split('\n').filter(line => line.trim() !== '');
    
    return logLines.map(line => {
      const timestampMatch = line.match(/^([A-Za-z]+ \d+ \d+:\d+:\d+)/);
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleString();
      
      let level: LogLevel = 'info';
      if (line.toLowerCase().includes('error') || line.toLowerCase().includes('err') || line.toLowerCase().includes('emerg')) {
        level = 'error';
      } else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('warn')) {
        level = 'warning';
      }
      
      const message = line.replace(/^[A-Za-z]+ \d+ \d+:\d+:\d+ [^ ]+ [^ ]+: /, '').trim();
      
      return {
        timestamp,
        level,
        message,
        source: 'haproxy'
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return [];
  }
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
        else if (trimmedLine.startsWith("default_backend"))
          currentFrontend.default_backend = trimmedLine.split(" ")[1];
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

export function generateConfigFileContents(config: HAProxyConfig): string {
  const sections: string[] = [];

  if (config.global.length > 0) {
    sections.push("global");
    sections.push(...config.global.map(line => `    ${line}`));
    sections.push("");
  }
  
  if (config.defaults.length > 0) {
    sections.push("defaults");
    sections.push(...config.defaults.map(line => `    ${line}`));
    sections.push("");
  }

  for (const frontend of config.frontends) {
    sections.push(`frontend ${frontend.name}`);
    
    if (frontend.mode) sections.push(`    mode ${frontend.mode}`);
    for (const bind of frontend.binds)
      sections.push(`    bind ${bind.ip_address}:${bind.port}`);
    
    if (frontend.default_backend)
      sections.push(`    default_backend ${frontend.default_backend}`);
    
    sections.push("");
  }

  for (const backend of config.backends) {
    sections.push(`backend ${backend.name}`);
    
    if (backend.mode) sections.push(`    mode ${backend.mode}`);
    for (const server of backend.servers)
      sections.push(`    server ${server.name} ${server.ip_address}:${server.port}${server.check ? " check" : ""}`);
    
    sections.push("");
  }
  
  return sections.join("\n");
}
