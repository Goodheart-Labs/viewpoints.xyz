import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import apiConfig from "@/config/api";

const handler = async (
  { url, method, body, headers, query: { subpath } }: NextApiRequest,
  res: NextApiResponse
) => {
  if (!subpath) {
    res.status(400).json({ error: "Missing subpath in the request." });
    return;
  }

  const queryString = url?.split("?")[1] ?? "";

  const targetUrl = `${apiConfig.polisUrl}/${
    Array.isArray(subpath) ? subpath.join("/") : subpath
  }${queryString ? "?" + queryString : ""}`;

  console.log(targetUrl);

  try {
    // const response = await axios({
    //   method,
    //   url: targetUrl,
    //   data: body,
    //   headers: {
    //     ...headers,
    //     // Remove host to get past CORS checks
    //     host: undefined,
    //   },
    // });
    // res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(error);

    res
      .status(error.response?.status || 500)
      .json({ error: "An error occurred while processing the request." });
  }
};

export default handler;
