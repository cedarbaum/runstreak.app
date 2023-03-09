import { createContext } from "react";
import { ActivitiesCache, AthleteCache } from "./StravaCache";

export type StravaCacheContextType = {
  athleteData: AthleteCache | null;
  setAthleteData: (data: AthleteCache | null) => void;
  activitiesData: ActivitiesCache | null;
  setActivitiesData: (data: ActivitiesCache | null) => void;
};

export const StravaCacheContext = createContext<StravaCacheContextType>({
  athleteData: null,
  setAthleteData: () => {},
  activitiesData: null,
  setActivitiesData: () => {},
});
