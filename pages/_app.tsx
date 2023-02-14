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

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [athleteLoading, setAthleteLoading] = useState(false);
  const [activitesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<ApplicationError | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [settings, setSettings] = useLocalStorage<Settings | null>(
    "settings",
    null
  );

  return (
    <ApplicationContext.Provider
      value={{
        isAthleteLoading: athleteLoading,
        isActivitiesLoading: activitesLoading,
        setAthleteLoading: setAthleteLoading,
        setIsActivitiesLoading: setActivitiesLoading,
        error,
        setError,
        headerHeight,
        setHeaderHeight,
      }}
    >
      <SettingsContext.Provider
        value={{
          settings,
          setSettings,
        }}
      >
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </SettingsContext.Provider>
    </ApplicationContext.Provider>
  );
};

export default App;
