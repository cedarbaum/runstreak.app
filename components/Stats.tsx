import { Activity, useStravaCacheForAthlete } from "@/utils/StravaCache";
import { useSession } from "next-auth/react";
import { useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { ApplicationContext } from "@/utils/ApplicationContext";
import { timeout } from "@/utils/Timeout";
import { ActivityStreak, calculateStreaks } from "@/utils/RunningStats";
import getErrorMessageFromResponse from "@/utils/ResponseError";
import { DateTime } from "luxon";
import CurrentStreak from "./CurrentStreak";
import StreaksTable from "./StreaksTable";

export default function Stats() {
  const { data: session } = useSession();
  const [streaks, setStreaks] = useState<ActivityStreak[] | undefined>(
    undefined
  );

  const { activities, setActivities } = useStravaCacheForAthlete(
    session?.user?.id
  );
  const { setError, setIsActivitiesLoading } = useContext(ApplicationContext);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = DateTime.now().setZone(tz);

  useAsyncEffect(async () => {
    if (session && session.user?.id) {
      if (streaks !== undefined) {
        return;
      }

      let mostRecentActivity = undefined;
      if (activities && activities.length > 0) {
        mostRecentActivity = activities[activities.length - 1];
      }

      let page = 1;
      let allFetchedActivities: Activity[] = [];
      let numNewActivitiesFetched = 0;

      setIsActivitiesLoading(true);
      do {
        let fetchedActivities: Activity[] = [];

        try {
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
            setIsActivitiesLoading(false);
            setError({
              message: await getErrorMessageFromResponse(res),
              code: res.status,
            });
            return;
          }

          fetchedActivities = (
            await res.json()
          ).activities.reverse() as Activity[];
        } catch (e: any) {
          setIsActivitiesLoading(false);
          setError({ message: e.message ?? "Unknown error" });
          return;
        }

        numNewActivitiesFetched = fetchedActivities.length;
        allFetchedActivities = fetchedActivities.concat(allFetchedActivities);
        page += 1;
        await timeout(100);
      } while (numNewActivitiesFetched > 0);

      setIsActivitiesLoading(false);

      const finalMergedActivities = activities
        ? activities.concat(allFetchedActivities)
        : allFetchedActivities;

      setActivities(finalMergedActivities);
      setStreaks(calculateStreaks(now, tz, finalMergedActivities, 1));
    }
  }, [session?.user?.id, activities]);

  const currentStreak = streaks
    ? streaks.find((streak) => {
        const diff = now
          .startOf("day")
          .diff(DateTime.fromMillis(streak.endTime).setZone(tz), "days");
        return diff.days < 2;
      })
    : undefined;
  const topTenStreaks = streaks
    ?.sort((s1, s2) =>
      s1.streakLength < s2.streakLength
        ? -1
        : s1.streakLength === s2.streakLength
        ? 0
        : 1
    )
    .reverse()
    .slice(0, 10);

  return (
    <div className="">
      <CurrentStreak currentStreak={currentStreak} />
      {topTenStreaks && <StreaksTable topN={10} topStreaks={topTenStreaks} />}
    </div>
  );
}
