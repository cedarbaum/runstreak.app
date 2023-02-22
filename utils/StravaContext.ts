import React, { createContext } from "react";
import { Activity, Athlete } from "./StravaCache";

export type StravaContextType = {
  getAthlete: (athleteId: string | undefined) => Athlete | null;
  setAthlete: (athlete: Athlete) => void;
  getActivities: (athleteId: string | undefined) => Activity[] | null;
  setActivities: (
    athleteId: string,
    activities: Activity[]
  ) => void;
};

export const StravaContext = createContext<StravaContextType>({
  getAthlete: () => null,
  setAthlete: () => {},
  getActivities: () => null,
  setActivities: () => {},
});
