import jwt from "jsonwebtoken";

export const generateAuthToken = (userId, res) => {
  // Generate a JWT token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30m", // Gunakan "30m" bukan "30menit"
  });

  // Set token dalam cookie
  res.cookie("jwt", token, {
    httpOnly: true, // Mencegah akses token dari JavaScript (lebih aman)
    secure: process.env.NODE_ENV !== "development", // Hanya aktif di HTTPS jika di production
    sameSite: "strict", // Mencegah CSRF
    maxAge: 30 * 60 * 1000, // 30 menit dalam milidetik
  });

  // Set token dalam response header
  res.header("Authorization", `Bearer ${token}`);

  return token;
};
