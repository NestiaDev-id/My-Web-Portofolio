import styles from "@/styles/login-register.module.scss"; // Import SCSS module

import React from "react";

const Login: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
              className={styles["form-input"]}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles["form-button"]}>
            Login
          </button>
        </form>

        <p className={styles["link-text"]}>
          Don’t have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
