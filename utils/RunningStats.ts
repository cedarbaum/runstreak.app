import { DateTime, Duration } from "luxon";
import { Activity } from "./StravaCache";

const metersToMiles = (meters: number) => meters * 0.000621371;

const metersPerSecondToMinutesPerMile = (mps: number) => {
  return 26.8224 / mps;
};

export const stats = [
  {
    name: "Avg. distance:",
    calc: (activities: Activity[]) => {
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );
      return (metersToMiles(totalDistance) / activities.length).toFixed(2);
    },
    unit: () => "mi",
  },
  {
    name: "Avg. speed:",
    calc: (activities: Activity[]) => {
      const totalAvgSpeed = activities.reduce(
        (acc, activity) => acc + activity.average_speed,
        0
      );
      const minutesPerMile = metersPerSecondToMinutesPerMile(
        totalAvgSpeed / activities.length
      );

      return Duration.fromObject({ minutes: minutesPerMile }).toFormat("mm:ss");
    },
    unit: () => "min/mi",
  },
  {
    name: "Avg. moving time:",
    calc: (activities: Activity[]) => {
      const totalDuration = activities.reduce(
        (acc, activity) => acc + activity.moving_time,
        0
      );

      const averageDuration = Duration.fromMillis(
        (totalDuration * 1000) / activities.length
      ).normalize();

      return averageDuration.toFormat("hh:mm:ss");
    },
    unit: () => "",
  },
  {
    name: "Total distance:",
    calc: (activities: Activity[]) => {
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );

      return metersToMiles(totalDistance).toFixed(2);
    },
    unit: () => "mi",
  },
];

export type ActivityDateBucket = {
  date: DateTime;
  activities: Activity[];
};

export function getLongestStreak(
  activities: Activity[]
): [Activity[], ActivityDateBucket[]] {
  let longestStreakBuckets: ActivityDateBucket[] = [];
  let longestStreak: Activity[] = [];

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = DateTime.now().setZone(tz);
  let lastDate = now.startOf("day");

  for (let idx = activities.length - 1; idx >= 0; idx--) {
    const activity = activities[idx];
    const activityDate = DateTime.fromMillis(activity.start_date)
      .setZone(tz)
      .startOf("day");
    const dayDiff = lastDate.diff(activityDate, "days").days;

    if (dayDiff === 0) {
      if (longestStreak.length === 0) {
        longestStreakBuckets.push({
          date: activityDate,
          activities: [activity],
        });
      } else {
        longestStreakBuckets[0].activities.unshift(activity);
      }
      longestStreak.unshift(activity);
    } else if (dayDiff === 1) {
      longestStreakBuckets.unshift({
        date: activityDate,
        activities: [activity],
      });
      longestStreak.unshift(activity);
    } else {
      return [longestStreak, longestStreakBuckets];
    }

    lastDate = activityDate;
  }

  return [longestStreak, longestStreakBuckets];
}
