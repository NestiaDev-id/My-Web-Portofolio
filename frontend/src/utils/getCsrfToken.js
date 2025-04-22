export const getCsrfToken = async () => {
  const res = await fetch("/api/csrf");
  const data = await res.json();
  return data.csrfToken;
};
