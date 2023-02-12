import { Activity, useStravaCacheForAthlete } from "@/utils/StravaCache";
import { useSession } from "next-auth/react";
import { useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";
import CountUp from "react-countup";
import { ApplicationContext } from "@/utils/ApplicationContext";
import { timeout } from "@/utils/Timeout";
import {
  ActivityDateBucket,
  getLongestStreak,
  stats,
} from "@/utils/RunningStats";
import getErrorMessageFromResponse from "@/utils/ResponseError";

export default function Stats() {
  const { data: session } = useSession();
  const [activityDateBuckets, setActivityDateBuckers] = useState<
    ActivityDateBucket[] | undefined
  >(undefined);

  const { activities, setActivities } = useStravaCacheForAthlete(
    session?.user?.id
  );
  const { setError, setIsActivitiesLoading } = useContext(ApplicationContext);

  useAsyncEffect(async () => {
    if (session && session.user?.id) {
      if (activityDateBuckets !== undefined) {
        return;
      }

      let mostRecentActivity = undefined;
      if (activities && activities.length > 0) {
        mostRecentActivity = activities[activities.length - 1];
      }

      let page = 1;
      let streakContinues = true;
      let allFetchedActivities: Activity[] = [];
      let activityStreakLength = 0;

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

        allFetchedActivities = fetchedActivities.concat(allFetchedActivities);

        const [activityStreak, _] = getLongestStreak(allFetchedActivities);

        streakContinues = activityStreak.length > activityStreakLength;
        activityStreakLength = activityStreak.length;
        page += 1;

        await timeout(100);
      } while (streakContinues);

      setIsActivitiesLoading(false);

      const finalMergedActivities = activities
        ? activities.concat(allFetchedActivities)
        : allFetchedActivities;

      const [finalActivityStreak, bucketedActivityStreak] = getLongestStreak(
        finalMergedActivities
      );

      setActivities(finalActivityStreak);
      setActivityDateBuckers(bucketedActivityStreak);
    }
  }, [session?.user?.id, activities]);

  return (
    <div className="">
      <dl className="grid grid-cols-1 overflow-hidden bg-white md:grid-cols-2">
        <div className="px-4 py-5 sm:p-6 border-l border-t border-b border-r md:border-r-0 border-gray-200">
          <dt className="text-base font-normal text-gray-900">
            <span className="text-2xl font-bold">Streak:</span>
            <br />
            {activityDateBuckets ? (
              <CountUp start={0} end={activityDateBuckets.length} delay={0}>
                {({ countUpRef }) => (
                  <span
                    className="text-8xl inline-block text-center w-full"
                    ref={countUpRef}
                  />
                )}
              </CountUp>
            ) : (
              <span className="text-8xl inline-block text-center w-full">
                --
              </span>
            )}
          </dt>
          <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
            <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
              <span className="ml-2 text-sm font-medium text-gray-500"></span>
            </div>
          </dd>
        </div>
        <div className="h-full md:border-t border-l">
          <dl className="h-full grid grid-cols-2 grid-rows-2 overflow-hidden bg-white">
            {stats.map((stat, idx) => (
              <div
                key={`stat${idx}`}
                className="px-4 py-5 sm:p-6 border-r border-b border-gray-200"
              >
                <dt className="text-base font-normal text-gray-900">
                  <span className="font-bold">{stat.name}</span>
                  <br />
                  <span>
                    {activities && activityDateBuckets
                      ? `${stat.calc(activities)} ${stat.unit()}`
                      : "--"}
                  </span>
                </dt>
                <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                  <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                    <span className="ml-2 text-sm font-medium text-gray-500"></span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </dl>
    </div>
  );
}
