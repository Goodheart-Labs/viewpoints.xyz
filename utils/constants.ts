export const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

export const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL;

export const getBaseUrl = () => {
  if (ENV === "production") {
    return "https://viewpoints.xyz";
  }
  if (ENV === "preview") {
    return `https://${VERCEL_URL}`;
  }
  return "http://localhost:3000";
};
