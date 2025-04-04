import {NextRequest} from "next/server";
import {
  Frontend,
  generateConfigFileContents,
  getConfigFileContents,
  HAProxyConfig,
  parseConfigFileContents,
  writeContentsToConfigFile
} from "@/lib/haproxy-service";
import {StatusCodes} from "@/lib/constants";

export const POST = async (request: NextRequest) => {
  try {
    const frontendData: Frontend = await request.json();
    const config: HAProxyConfig = parseConfigFileContents(getConfigFileContents());

    const frontends: Frontend[] = config.frontends;
    if (frontends.findIndex(f => f.name === frontendData.name) !== -1)
      return Response.json({
        status_code: StatusCodes.BAD_REQUEST,
        error: "Un frontend avec le même nom existe déjà"
      }, {status: StatusCodes.BAD_REQUEST});

    frontends.push(frontendData);
    writeContentsToConfigFile(generateConfigFileContents(config));

    return Response.json({
      status_code: StatusCodes.OK,
      message: "Frontend créé avec succès"
    }, {status: StatusCodes.OK});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}
