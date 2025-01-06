import {getConfigFileContents} from "@/lib/haproxy-service";

export const GET = async () => {
  try {
    return Response.json({
      status_code: 200,
      contents: getConfigFileContents(),
      timestamp: new Date()
    });
  } catch (error) {
    const statusCode = 500;

    return new Response({
      status_code: statusCode,
      error: error.message,
    }, {status: statusCode});
  }
}
