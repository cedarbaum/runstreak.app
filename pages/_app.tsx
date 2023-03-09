import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ApplicationContext } from "@/utils/ApplicationContext";
import { useState } from "react";
import { AppType } from "next/app";
import { Session } from "next-auth";
import useLocalStorage from "@/utils/useLocalStorage";
import { Settings, SettingsContext } from "@/utils/SettingsContext";
import Layout from "@/components/layout";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [settings, setSettings] = useLocalStorage<Settings | null>(
    "settings",
    null
  );

  return (
    <ApplicationContext.Provider
      value={{
        headerHeight,
        setHeaderHeight,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SettingsContext.Provider
          value={{
            settings,
            setSettings,
          }}
        >
          <SessionProvider session={session}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Analytics />
          </SessionProvider>
        </SettingsContext.Provider>
      </QueryClientProvider>
    </ApplicationContext.Provider>
  );
};

export default App;
