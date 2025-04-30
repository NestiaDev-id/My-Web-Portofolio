import csrf from "csrf";
import type { NextApiRequest, NextApiResponse } from "next";

const tokens = new csrf();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = tokens.create(process.env.CSRF_SECRET!);
  const isProd = process.env.NODE_ENV === "production";

  // Kirim token via cookie (atau JSON jika kamu lebih suka fetch + simpan manual)
  //   res.setHeader(
  //     "Set-Cookie",
  //     `csrfToken=${token}; Path=/; SameSite=Lax; HttpOnly=${isProd}`
  //   );
  res.setHeader("Set-Cookie", `csrfToken=${token}; Path=/; SameSite=Lax;`);

  res.status(200).json({ csrfToken: token });
}
