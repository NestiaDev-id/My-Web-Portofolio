import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Helper to run middleware on API route
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
  origin: "*", // Bisa diganti ke frontend kamu misalnya "http://localhost:3000"
});

export default async function runCors(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);
}
