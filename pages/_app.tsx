import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import {
  ApplicationContext,
  ApplicationError,
} from "@/utils/ApplicationContext";
import { useState } from "react";
import { AppType } from "next/app";
import { Session } from "next-auth";
import useLocalStorage from "@/utils/useLocalStorage";
import { Settings, SettingsContext } from "@/utils/SettingsContext";
import Layout from "@/components/layout";
import { Analytics } from "@vercel/analytics/react";
import { useStravaCache } from "@/utils/StravaCache";
import { StravaContext } from "@/utils/StravaContext";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [athleteLoading, setAthleteLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<ApplicationError | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [settings, setSettings] = useLocalStorage<Settings | null>(
    "settings",
    null
  );
  const { getAthlete, setAthlete, getActivities, setActivities } =
    useStravaCache();

  return (
    <ApplicationContext.Provider
      value={{
        isAthleteLoading: athleteLoading,
        isActivitiesLoading: activitiesLoading,
        setAthleteLoading: setAthleteLoading,
        setIsActivitiesLoading: setActivitiesLoading,
        error,
        setError,
        headerHeight,
        setHeaderHeight,
      }}
    >
      <StravaContext.Provider
        value={{ getAthlete, setAthlete, getActivities, setActivities }}
      >
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
      </StravaContext.Provider>
    </ApplicationContext.Provider>
  );
};

export default App;
