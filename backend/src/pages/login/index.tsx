import styles from "@/styles/login-register.module.scss"; // Import SCSS module

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const handleGoogleLogin = () => {
  console.log("Login with Google clicked");
};
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Login successful!");
      // Redirect to dashboard or home page
      router.push("/"); // Adjust the path as needed
    } else {
      setMessage(data.error || "Something went wrong. Please try again.");
      console.log(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FFFBE3] text-black">
      <div className={styles["register-container"]}>
        <h1>Login</h1>
        <form>
          <div className={styles["form-group"]}>
            <label htmlFor="email" className={styles["form-label"]}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles["form-input"]}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="password" className={styles["form-label"]}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles["form-input"]} pr-12`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white border-2 border-black shadow-md hover:bg-[#FF90E8] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    // Eye Off (custom style)
                    <>
                      <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.08-2.89 3.05-5.17 5.56-6.41" />
                      <path d="M1 1l22 22" />
                    </>
                  ) : (
                    // Eye (custom style)
                    <>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className={styles["form-button"]}>
            Login
          </button>
        </form>

        <div className="my-4">
          <div className="w-full h-[2px] bg-black my-4"></div>

          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 border-2 border-black bg-white text-black py-3 px-4 font-bold shadow-[4px_4px_0_0_#000] hover:bg-[#FF90E8]  hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272.1v95h146.9c-6.3 34-25.1 62.7-53.5 82v67h86.3c50.4-46.5 81.7-115.1 81.7-193.8z"
                fill="#4285f4"
              />
              <path
                d="M272.1 544.3c72.6 0 133.6-24.1 178.1-65.4l-86.3-67c-23.9 16-54.4 25.3-91.8 25.3-70.7 0-130.7-47.7-152.2-111.7H30.7v69.9c44.7 88.4 137.2 148.9 241.4 148.9z"
                fill="#34a853"
              />
              <path
                d="M119.9 325.5c-10.6-31.5-10.6-65.4 0-96.9v-69.9H30.7c-31.4 62.6-31.4 136.1 0 198.7l89.2-69.9z"
                fill="#fbbc04"
              />
              <path
                d="M272.1 107.7c39.6-.6 77.6 13.5 106.9 39.5l80.1-80.1C411.4 24.1 350.4 0 272.1 0 168 0 75.4 60.5 30.7 148.8l89.2 69.9c21.5-64 81.5-111.7 152.2-111z"
                fill="#ea4335"
              />
            </svg>
            Login with Google
          </motion.button>
        </div>

        <p className={styles["link-text"]}>
          Don’t have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
