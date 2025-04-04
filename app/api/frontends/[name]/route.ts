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

export const GET = async (request: NextRequest, {params}: { params: { name: string } }) => {
  try {
    const frontendName: string = params.name;

    const frontend = parseConfigFileContents(getConfigFileContents()).frontends.find(f => f.name === frontendName);
    if (!frontend)
      return Response.json({
        status_code: StatusCodes.NOT_FOUND,
        error: `Frontend "${frontendName}" non trouvé`
      }, {status: StatusCodes.NOT_FOUND});

    return Response.json({
      status_code: StatusCodes.OK,
      data: frontend
    });
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}

export const PUT = async (request: NextRequest, {params}: { params: { name: string } }) => {
  try {
    const frontendName: string = params.name;
    const frontendData: Frontend = await request.json();

    const config: HAProxyConfig = parseConfigFileContents(getConfigFileContents());
    const frontends: Frontend[] = config.frontends;

    const existingFrontendIndex = frontends.findIndex(f => f.name === frontendName);
    if (existingFrontendIndex === -1)
      return Response.json({
        status_code: StatusCodes.NOT_FOUND,
        error: `Frontend "${frontendName}" non trouvé`
      }, {status: StatusCodes.NOT_FOUND});

    frontends[existingFrontendIndex] = {
      ...frontends[existingFrontendIndex],
      ...frontendData,
      name: frontendName
    } as Frontend;
    writeContentsToConfigFile(generateConfigFileContents(config));

    return Response.json({
      status_code: StatusCodes.OK,
      message: "Frontend mis à jour avec succès"
    }, {status: StatusCodes.OK});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}

export const DELETE = async (request: NextRequest, {params}: { params: { name: string } }) => {
  try {
    const frontendName: string = params.name;

    const config: HAProxyConfig = parseConfigFileContents(getConfigFileContents());
    const frontends: Frontend[] = config.frontends;

    const existingFrontendIndex = frontends.findIndex(f => f.name === frontendName);
    if (existingFrontendIndex === -1)
      return Response.json({
        status_code: StatusCodes.NOT_FOUND,
        error: `Frontend "${frontendName}" non trouvé`
      }, {status: StatusCodes.NOT_FOUND});

    config.frontends.splice(existingFrontendIndex, 1);
    writeContentsToConfigFile(generateConfigFileContents(config));

    return Response.json({
      status_code: StatusCodes.OK,
      message: "Frontend supprimé avec succès"
    }, {status: StatusCodes.OK});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}
