import {getConfigFileContents, parseConfigFileContents, writeContentsToConfigFile} from "@/lib/haproxy-service";
import {StatusCodes} from "@/lib/constants";
import {NextRequest} from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    let parse: boolean | null = null;
    const searchParams = request.nextUrl.searchParams as URLSearchParams;
    if (searchParams.has("parse"))
      parse = searchParams.get("parse") === "true";

    const contents = getConfigFileContents();
    return Response.json({
      status_code: StatusCodes.OK,
      contents: parse ? parseConfigFileContents(contents) : contents,
    });
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}

export const POST = async (request: Request) => {
  try {
    const {contents} = await request.json();
    writeContentsToConfigFile(contents);

    return Response.json({
      status_code: StatusCodes.CREATED,
      message: "Sauvegarde du fichier avec succès",
    }, {status: StatusCodes.CREATED});
  } catch (error) {
    return Response.json({
      status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message,
      cause: error.cause?.message
    }, {status: StatusCodes.INTERNAL_SERVER_ERROR});
  }
}
