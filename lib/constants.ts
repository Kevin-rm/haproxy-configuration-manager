export const HAPROXY_CONFIG_FILE_PATH = "/etc/haproxy/haproxy.cfg";
export const UTF8_ENCODING = "utf8";

export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
