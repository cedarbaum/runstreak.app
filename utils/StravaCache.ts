import useLocalStorage from "./useLocalStorage";

export type Activity = {
  id: string;
  elapsed_time: number;
  moving_time: number;
  start_date: number;
  average_speed: number;
  max_speed: number;
  distance: number;
  total_elevation_gain: number;
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

type ActivitiesCache = {
  activity_schema: number;
  athlete_activities: {
    id: string;
    activities: Activity[];
  }[];
};

function useStravaAthleteCache() {
  return useLocalStorage<AthleteCache | null>("strava-cache-athletes", null);
}

function useStravaActivitiesCache() {
  return useLocalStorage<ActivitiesCache | null>(
    "strava-cache-activities",
    null
  );
}

export function useStravaCache() {
  const [athleteData, setAthleteData] = useStravaAthleteCache();
  const [activitiesData, setActivitiesData] = useStravaActivitiesCache();

  const getAthlete = (athleteId: string | undefined): Athlete | null =>
    athleteData?.athletes?.find((a: Athlete) => a.id === athleteId) ?? null;

  const setAthlete = (athlete: Athlete) => {
    let newAthletes: Athlete[];
    const existingAthlete = getAthlete(athlete.id);
    if (existingAthlete) {
      newAthletes = athleteData!.athletes!.map((a: Athlete) => {
        if (a.id === athlete.id) {
          return athlete;
        } else {
          return a;
        }
      });
    } else {
      const allAthletes = athleteData?.athletes ?? [];
      newAthletes = allAthletes.concat([athlete]);
    }

    setAthleteData({
      athlete_schema: 1,
      athletes: newAthletes,
    });
  };

  const getActivities = (athleteId: string | undefined): Activity[] | null =>
    activitiesData?.athlete_activities?.find(
      (a: { id: string; activities: Activity[] }) => a.id === athleteId
    )?.activities ?? null;

  const setActivities = (athleteId: string, newActivities: Activity[]) => {
    let newAthleteActivities: { id: string; activities: Activity[] }[];
    const existingActivitiesForAthlete = getActivities(athleteId);
    if (existingActivitiesForAthlete) {
      newAthleteActivities = activitiesData!.athlete_activities!.map(
        (a: { id: string; activities: Activity[] }) => {
          if (a.id === athleteId) {
            return { ...a, activities: newActivities };
          } else {
            return a;
          }
        }
      );
    } else {
      const allActivityData = activitiesData?.athlete_activities ?? [];
      newAthleteActivities = allActivityData.concat([
        {
          id: athleteId,
          activities: newActivities,
        },
      ]);
    }

    setActivitiesData({
      activity_schema: 1,
      athlete_activities: newAthleteActivities,
    });
  };

  return { getAthlete, setAthlete, getActivities, setActivities };
}
