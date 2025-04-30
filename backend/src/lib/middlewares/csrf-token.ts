// import type { NextApiRequest, NextApiResponse } from "next";
// import Tokens from "csrf";

// const tokens = new Tokens();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   // Gunakan secret tetap dari env, atau buat baru kalau belum ada
//   const secret = process.env.CSRF_SECRET || tokens.secretSync();

//   // (Opsional) Set CSRF_SECRET ke env di runtime kalau belum ada
//   // Biasanya ini diset di proses build / deploy

//   const token = tokens.create(secret);

//   // Kirim token ke klien (bisa via JSON, atau cookie)
//   res.status(200).json({ csrfToken: token });
// }
