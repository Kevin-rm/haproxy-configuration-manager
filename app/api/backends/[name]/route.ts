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

export const GET = async (request: NextRequest, {params}: { params: { name: string } }) => {
  try {
    const backendName: string = params.name;

    const backend = parseConfigFileContents(getConfigFileContents()).backends.find(b => b.name === backendName);
    if (!backend)
      return Response.json({
        status_code: StatusCodes.NOT_FOUND,
        error: `Backend "${backendName}" non trouvé`
      }, {status: StatusCodes.NOT_FOUND});

    return Response.json({
      status_code: StatusCodes.OK,
      data: backend
    });
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}

export const PUT = async (request: NextRequest, {params}: { params: { name: string } }) => {
  try {
    const backendName: string = params.name;
    const backendData: Backend = await request.json();

    const config: HAProxyConfig = parseConfigFileContents(getConfigFileContents());
    const backends: Backend[] = config.backends;

    const existingBackendIndex = backends.findIndex(b => b.name === backendName);
    if (existingBackendIndex === -1)
      return Response.json({
        status_code: StatusCodes.NOT_FOUND,
        error: `Backend "${backendName}" non trouvé`
      }, {status: StatusCodes.NOT_FOUND});

    backends[existingBackendIndex] = {
      ...backends[existingBackendIndex],
      ...backendData,
      name: backendName
    } as Backend;
    writeContentsToConfigFile(generateConfigFileContents(config));

    return Response.json({
      status_code: StatusCodes.OK,
      message: "Backend mis à jour avec succès"
    }, {status: StatusCodes.OK});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}
