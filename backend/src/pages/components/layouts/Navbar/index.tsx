// import { signIn, signOut, useSession } from "next-auth/react";
// import styles from "./Navbar.module.scss";
// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <div className={styles.navbar}>
//       {/* Logo */}
//       <div className={styles["navbar-logo"]}>MyApp</div>

//       {/* Links */}
//       <div className={styles["navbar-links"]}>
//         <Link href="/" className={styles["navbar-link"]}>
//           Home
//         </Link>
//         <Link href="/about" className={styles["navbar-link"]}>
//           About
//         </Link>
//         <Link href="/contact" className={styles["navbar-link"]}>
//           Contact
//         </Link>
//       </div>

//       {/* Profile Section */}
//       {/* <div className={styles.profile}>
//         {session?.user?.image && (
//           <img
//             className={styles.avatar}
//             src={session.user.image}
//             alt="User Avatar"
//           />
//         )}
//         {session ? (
//           <>
//             <span>{session.user?.name}</span>
//             <button onClick={() => signOut()} className={styles.button}>
//               Sign Out
//             </button>
//           </>
//         ) : (
//           <button onClick={() => signIn()} className={styles.button}>
//             Sign In
//           </button>
//         )}
//       </div> */}
//     </div>
//   );
// }
