import { NextApiRequest, NextApiResponse } from "next";
import { addData, getData, editData } from "@/lib/mongodb/service";
import runCors from "@/middlewares/cors";

const COLLECTION_NAME = "users"; // sesuaikan dengan nama koleksi kamu di MongoDB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runCors(req, res);
  if (req.method === "POST") {
    // Add user
    await addData(COLLECTION_NAME, req.body, (response) => {
      if (response.status) {
        return res
          .status(201)
          .json({ success: true, message: response.message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: response.message });
      }
    });
  } else if (req.method === "GET") {
    // Get user(s) — bisa pakai query, misalnya email
    try {
      const { email, username } = req.query;
      const query: any = {};
      if (email) query.email = email;
      if (username) query.username = username;

      const data = await getData(COLLECTION_NAME, query);
      if (data.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching user data" });
    }
  } else if (req.method === "PUT") {
    // Edit user
    const { _id } = req.query;

    if (!_id || typeof _id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "_id is required for update" });
    }

    await editData(COLLECTION_NAME, { _id }, req.body, (response) => {
      const statusCode = response.status ? 200 : 400;
      return res
        .status(statusCode)
        .json({ success: response.status, message: response.message });
    });
  } else {
    res.setHeader("Allow", ["POST", "GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
