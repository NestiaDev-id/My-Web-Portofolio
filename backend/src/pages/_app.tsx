// pages/_app.tsx
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import "@/styles/globals.css";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {getLayout(<Component {...pageProps} />)}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

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
