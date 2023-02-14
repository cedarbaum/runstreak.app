import { DateTime, Duration } from "luxon";
import { Activity } from "./StravaCache";

const metersToMiles = (meters: number) => meters * 0.000621371;

const metersPerSecondToMinutesPerMile = (mps: number) => {
  return 26.8224 / mps;
};

export type ActivityStreak = {
  streakLength: number;
  activities: Activity[];
  startTime: number;
  endTime: number;
};

interface Statistic {
  name: string;
  calc: (streak: ActivityStreak) => number | string;
  unit: () => string;
}

export const streakStats: Statistic[] = [
  {
    name: "Streak",
    calc: (streak: ActivityStreak) => {
      return streak.streakLength;
    },
    unit: () => "",
  },
];

export const activityStats: Statistic[] = [
  {
    name: "Avg. distance",
    calc: (streak: ActivityStreak) => {
      const activities = streak.activities;
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );
      return (metersToMiles(totalDistance) / activities.length).toFixed(2);
    },
    unit: () => "mi",
  },
  {
    name: "Avg. speed",
    calc: (streak: ActivityStreak) => {
      const activities = streak.activities;
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
    name: "Avg. moving time",
    calc: (streak: ActivityStreak) => {
      const activities = streak.activities;
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
    name: "Total distance",
    calc: (streak: ActivityStreak) => {
      const activities = streak.activities;
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );

      return metersToMiles(totalDistance).toFixed(2);
    },
    unit: () => "mi",
  },
];

function normalizeStreakTimeBounds(ts: number, tz: string): number {
  return DateTime.fromMillis(ts).setZone(tz).startOf("day").toMillis();
}

export function calculateStreaks(
  now: DateTime,
  tz: string,
  activities: Activity[],
  minStreakLength: number
): ActivityStreak[] {
  let activityStreaks: ActivityStreak[] = [];
  let currentStreakActivites: Activity[] = [];
  let currentStreakLength = 0;

  let lastDate = now.startOf("day");
  let lastActivity = null;

  for (let idx = activities.length - 1; idx >= 0; idx--) {
    const activity = activities[idx];
    const activityDate = DateTime.fromMillis(activity.start_date)
      .setZone(tz)
      .startOf("day");
    const dayDiff = lastDate.diff(activityDate, "days").days;

    if (dayDiff === 0) {
      currentStreakActivites.unshift(activity);
      if (lastActivity == null) {
        currentStreakLength++;
      }
    } else if (dayDiff === 1) {
      currentStreakActivites.unshift(activity);
      currentStreakLength++;
    } else {
      if (currentStreakLength > 0) {
        activityStreaks.unshift({
          activities: currentStreakActivites,
          streakLength: currentStreakLength,
          startTime: normalizeStreakTimeBounds(
            currentStreakActivites[0].start_date,
            tz
          ),
          endTime: normalizeStreakTimeBounds(
            currentStreakActivites[currentStreakActivites.length - 1]
              .start_date,
            tz
          ),
        });
      }

      currentStreakActivites = [activity];
      currentStreakLength = 1;
    }

    lastActivity = activity;
    lastDate = activityDate;
  }

  if (currentStreakLength > 0) {
    activityStreaks.unshift({
      activities: currentStreakActivites,
      streakLength: currentStreakLength,
      startTime: normalizeStreakTimeBounds(
        currentStreakActivites[0].start_date,
        tz
      ),
      endTime: normalizeStreakTimeBounds(
        currentStreakActivites[currentStreakActivites.length - 1].start_date,
        tz
      ),
    });
  }

  return activityStreaks.filter(
    (streak) => streak.streakLength > minStreakLength
  );
}
