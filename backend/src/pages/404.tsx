import styles from "@/styles/404.module.scss";

const Custom404 = () => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-screen ${styles.error}`}
    >
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
};

export default Custom404;
