import styles from "@/styles/login-register.module.scss"; // Import SCSS module

import React from "react";
// import "../../styles/register.module.scss"; // Import the pure SCSS file

const Register: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className={styles["register-container"]}>
        <h1>Register</h1>
        <form>
          <div className={styles["form-group"]}>
            <label htmlFor="username" className={styles["form-label"]}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
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
