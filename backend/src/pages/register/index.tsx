import styles from "@/styles/login-register.module.scss"; // Import SCSS module

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// import "../../styles/register.module.scss"; // Import the pure SCSS file

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Registration successful! Please log in.");
      router.push("/login"); // Redirect to login page after successful registration
    } else {
      setMessage(data.error || "Something went wrong. Please try again.");
      console.log(data.error);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
