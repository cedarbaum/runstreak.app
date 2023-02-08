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

type StravaCache = {
  athlete_schema: number;
  activity_schema: number;
  athlete_and_activites: {
    id: string;
    athlete: Athlete;
    activities: Activity[];
  }[];
};

function useStravaCache() {
  return useLocalStorage<StravaCache | null>("strava-cache", null);
}

export function useStravaCacheForAthlete(athleteId: string | undefined) {
  const [value, setValue] = useStravaCache();

  if (!athleteId) {
    return {
      athlete: null,
      setAthlete: () => {},
      activities: null,
      setActivities: () => {},
    };
  }

  const athlete = value?.athlete_and_activites?.find(
    (a: any) => a.id === athleteId
  )?.athlete;
  const setAthlete = (athlete: Athlete) => {
    const athleteData = value?.athlete_and_activites?.find(
      (a: any) => a.id === athleteId
    );

    let newAthleteAndActivites;
    if (athleteData !== undefined) {
      newAthleteAndActivites = value!.athlete_and_activites!.map((a: any) => {
        if (a.id === athleteId) {
          return { ...a, athlete };
        } else {
          return a;
        }
      });
    } else {
      newAthleteAndActivites = [
        {
          id: athleteId,
          athlete,
          activities: null,
        },
      ];
    }

    setValue({
      athlete_schema: 1,
      activity_schema: 1,
      athlete_and_activites: newAthleteAndActivites,
    });
  };

  const activities = value?.athlete_and_activites?.find(
    (a: any) => a.id === athleteId
  )?.activities;
  const setActivities = (activities: Activity[]) => {
    const athleteData = value?.athlete_and_activites?.find(
      (a: any) => a.id === athleteId
    );

    let newAthleteAndActivites;
    if (athleteData !== undefined) {
      newAthleteAndActivites = value!.athlete_and_activites!.map((a: any) => {
        if (a.id === athleteId) {
            return { ...a, activities };
        } else {
          return a;
        }
      });
    } else {
      newAthleteAndActivites = [
        {
          id: athleteId,
          athlete: null,
          activities,
        },
      ];
    }

    setValue({
      athlete_schema: 1,
      activity_schema: 1,
      athlete_and_activites: newAthleteAndActivites,
    });
  };

  return { athlete, setAthlete, activities, setActivities };
}
