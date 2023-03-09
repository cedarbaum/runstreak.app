import { Activity, Athlete, useStravaCache } from "./StravaCache";
import getErrorMessageFromResponse from "./ResponseError";
import { timeout } from "./Timeout";
import { useQuery } from "@tanstack/react-query";

function mergeNewActivities(
  existingActivities: Activity[],
  newActivities: Activity[]
): Activity[] {
  // If activity with id already existed, take newer one
  const newActivityIds = new Set(newActivities.map((a) => a.id));
  existingActivities = existingActivities.filter(
    (a) => !newActivityIds.has(a.id)
  );

  // Ensure ordering
  newActivities = newActivities.sort((a1, a2) => a1.start_date - a2.start_date);

  return existingActivities.concat(newActivities);
}

export default function useStrava(athleteId: string | undefined) {
  const { getAthlete, setAthlete, getActivities, setActivities } =
    useStravaCache();

  const {
    data: athlete,
    isLoading: athleteLoading,
    error: athleteError,
  } = useQuery(
    ["athlete", athleteId],
    async () => {
      const athlete = getAthlete(athleteId);
      if (athlete) {
        return athlete;
      }

      const res = await fetch("/api/athlete", {
        method: "POST",
      });
      const data = (await res.json()).athlete as Athlete;

      if (!res.ok) {
        const errorMessage = await getErrorMessageFromResponse(res);
        throw new Error(errorMessage);
      }

      setAthlete(data);
      return data;
    },
    {
      enabled: !!athleteId,
    }
  );

  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useQuery(
    ["activities", athleteId],
    async () => {
      const activities = getActivities(athleteId);

      let mostRecentActivity = undefined;
      if (activities && activities.length > 0) {
        mostRecentActivity = activities[activities.length - 1];
      }

      let page = 1;
      let allFetchedActivities: Activity[] = [];
      let numNewActivitiesFetched = 0;

      do {
        let fetchedActivities: Activity[] = [];
        const res = await fetch("/api/activities", {
          method: "POST",
          body: JSON.stringify({
            page: page,
            per_page: 200,
            ...(mostRecentActivity && {
              after: mostRecentActivity.start_date / 1000,
            }),
          }),
        });

        if (!res.ok) {
          const errorMessage = await getErrorMessageFromResponse(res);
          throw new Error(errorMessage);
        }

        fetchedActivities = (await res.json()).activities as Activity[];

        // Reverse if doing full hydration, since activities are returned in
        // reverse chronological order
        if (!mostRecentActivity) {
          fetchedActivities = fetchedActivities.reverse();
        }

        numNewActivitiesFetched = fetchedActivities.length;
        allFetchedActivities = fetchedActivities.concat(allFetchedActivities);
        page += 1;
        await timeout(100);
      } while (numNewActivitiesFetched > 0);

      const finalMergedActivities = mergeNewActivities(
        getActivities(athleteId) ?? [],
        allFetchedActivities
      );

      setActivities(athleteId!, finalMergedActivities);
      return finalMergedActivities;
    },
    {
      enabled: !!athleteId,
    }
  );

  return {
    athlete,
    athleteLoading,
    athleteError,
    activities,
    activitiesLoading,
    activitiesError,
  };
}
