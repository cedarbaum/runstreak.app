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
  };
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

export function useStravaCacheForAthlete(athleteId: string | undefined) {
  const [athleteData, setAthleteData] = useStravaAthleteCache();
  const [activitiesData, setActivitiesData] = useStravaActivitiesCache();

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

  const activities = activitiesData?.athlete_activities?.find(
    (a: { id: string; activities: Activity[] }) => a.id === athleteId
  )?.activities;
  const setActivities = (newActivities: Activity[]) => {
    let newAthleteActivities: { id: string; activities: Activity[] }[];
    if (activities !== undefined) {
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
      newAthleteActivities = [
        {
          id: athleteId,
          activities: newActivities,
        },
      ];
    }

    setActivitiesData({
      activity_schema: 1,
      athlete_activities: newAthleteActivities,
    });
  };

  return { athlete, setAthlete, activities, setActivities };
}
