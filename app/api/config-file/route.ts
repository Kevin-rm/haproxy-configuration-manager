import {getConfigFileContents, saveConfigFile} from "@/lib/haproxy-service";
import {StatusCodes} from "@/lib/constants";

export const GET = async () => {
  try {
    return Response.json({
      status_code: StatusCodes.OK,
      contents: getConfigFileContents(),
    });
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}

export const POST = async (request: Request) => {
  try {
    const {contents} = await request.json();
    saveConfigFile(contents);

    return Response.json({
      status_code: StatusCodes.CREATED,
      message: "Sauvegarde du fichier avec succès",
    }, {status: StatusCodes.CREATED});
  } catch (error) {

  }
}
