import {NextRequest} from "next/server";
import {
  Backend,
  generateConfigFileContents,
  getConfigFileContents,
  HAProxyConfig,
  parseConfigFileContents,
  writeContentsToConfigFile
} from "@/lib/haproxy-service";
import {StatusCodes} from "@/lib/constants";

export const POST = async (request: NextRequest) => {
  try {
    const backendData: Backend = await request.json();
    const config: HAProxyConfig = parseConfigFileContents(getConfigFileContents());

    const backends: Backend[] = config.backends;
    if (backends.findIndex(b => b.name === backendData.name) !== -1)
      return Response.json({
        status_code: StatusCodes.BAD_REQUEST,
        error: "Un backend avec le même nom existe déja"
      }, {status: StatusCodes.BAD_REQUEST});

    backends.push(backendData);
    writeContentsToConfigFile(generateConfigFileContents(config));

    return Response.json({
      status_code: StatusCodes.OK,
      message: "Backend créé avec succès"
    }, {status: StatusCodes.OK});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
      cause: error.cause.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}
