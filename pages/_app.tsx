import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import {
  ApplicationContext,
  ApplicationError,
} from "@/utils/ApplicationContext";
import { useState } from "react";
import { AppType } from "next/app";
import { Session } from "next-auth";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [athleteLoading, setAthleteLoading] = useState(false);
  const [activitesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<ApplicationError | null>(null);

  return (
    <ApplicationContext.Provider
      value={{
        isAthleteLoading: athleteLoading,
        isActivitiesLoading: activitesLoading,
        setAthleteLoading: setAthleteLoading,
        setIsActivitiesLoading: setActivitiesLoading,
        error,
        setError,
      }}
    >
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ApplicationContext.Provider>
  );
};

export default App;
