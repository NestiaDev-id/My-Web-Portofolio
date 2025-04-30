import styles from "@/styles/login-register.module.scss"; // Import SCSS module

import React, { useState } from "react";
import Router from "next/router";
import { useToast } from "../components/ui/use-toast";

// import "../../styles/register.module.scss"; // Import the pure SCSS file
import { motion } from "framer-motion";
import Link from "next/link";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      console.log("[REGISTER] data", data);

      if (res.ok) {
        toast({
          title: "Registrasi berhasil!",
          description: data.message || "Silahkan login Terlebih dahulu",
        });
        Router.push("auth/login");
      } else {
        toast({
          title: "Registrasi gagal",
          description: data.error || "Coba lagi nanti.",
          variant: "destructive", // kalau ada styling untuk error
        });
      }
    } catch (error) {
      toast({
        title: "Login gagal",
        description: `${error}`,
        variant: "destructive", // kalau ada styling untuk error
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isLoading && (
        <div className="absolute z-50 inset-0 flex items-center justify-center bg-[#FFFBE3]/90">
          <div className="border-4 border-black bg-white p-6 rounded-xl shadow-[4px_4px_0_0_#000]">
            <motion.div
              className="w-12 h-12 border-[5px] border-black border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p className="text-center font-bold">
              Authenticating... Please wait
            </p>
          </div>
        </div>
      )}
      <div className={styles["register-container"]}>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles["form-group"]}>
            <label htmlFor="username" className={styles["form-label"]}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles["form-input"]}
              placeholder="Enter your username"
            />
          </div>

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
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles["form-input"]}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles["form-button"]}>
            Register
          </button>
        </form>

        <p className={styles["link-text"]}>
          Already have an account? <Link href="/auth/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
