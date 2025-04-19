// pages/_app.tsx
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app"; // Impor tipe untuk AppProps

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Component {...pageProps} />{" "}
        {/* Komponen halaman akan dirender di sini */}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default MyApp;

// import "@/styles/globals.css";
// import type { AppProps } from "next/app";
// import AppShell from "./components/layouts/AppShell";

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <AppShell>
//       <Component {...pageProps} />
//     </AppShell>
//   );
// }
