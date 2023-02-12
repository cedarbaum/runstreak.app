import { useEffect, useState } from "react";

// https://upmostly.com/next-js/using-localstorage-in-next-js
function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return stored ? JSON.parse(stored) : fallbackValue;
  });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setValue(stored ? JSON.parse(stored) : fallbackValue);
  }, [fallbackValue, key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export type Activity = {
  id: string;
  elapsed_time: number;
  moving_time: number;
  start_date: number;
  average_speed: number;
  max_speed: number;
  distance: number;
};

export type Athlete = {
  id: string;
  firstname?: string;
  lastname?: string;
  sex?: string;
};

type AthleteCache = {
  athlete_schema: number;
  athletes: Athlete[];
};

type ActivitesCache = {
  activity_schema: number;
  athlete_activities: {
    id: string;
    activities: Activity[];
  };
};

function useStravaAthleteCache() {
  return useLocalStorage<AthleteCache | null>("strava-cache-athletes", null);
}

function useStravaActivitesCache() {
  return useLocalStorage<ActivitesCache | null>(
    "strava-cache-activities",
    null
  );
}

export function useStravaCacheForAthlete(athleteId: string | undefined) {
  const [athleteData, setAthleteData] = useStravaAthleteCache();
  const [activitesData, setActivitiesData] = useStravaActivitesCache();

  if (!athleteId) {
    return {
      athlete: null,
      setAthlete: () => {},
      activities: null,
      setActivities: () => {},
    };
  }

  const athlete = athleteData?.athletes?.find(
    (a: Athlete) => a.id === athleteId
  );
  const setAthlete = (newAthlete: Athlete) => {
    let newAthletes: Athlete[];
    if (athlete !== undefined) {
      newAthletes = athleteData!.athletes!.map((a: Athlete) => {
        if (a.id === athleteId) {
          return newAthlete;
        } else {
          return a;
        }
      });
    } else {
      newAthletes = [newAthlete];
    }

    setAthleteData({
      athlete_schema: 1,
      athletes: newAthletes,
    });
  };

  const activities = activitesData?.athlete_activites?.find(
    (a: { id: string; activities: Activity[] }) => a.id === athleteId
  )?.activities;
  const setActivities = (newActivities: Activity[]) => {
    let newAthleteActivites: { id: string; activities: Activity[] }[];
    if (activities !== undefined) {
      newAthleteActivites = activitesData!.athlete_activites!.map(
        (a: { id: string; activities: Activity[] }) => {
          if (a.id === athleteId) {
            return { ...a, activities: newActivities };
          } else {
            return a;
          }
        }
      );
    } else {
      newAthleteActivites = [
        {
          id: athleteId,
          activities: newActivities,
        },
      ];
    }

    setActivitiesData({
      activity_schema: 1,
      athlete_activites: newAthleteActivites,
    });
  };

  return { athlete, setAthlete, activities, setActivities };
}
