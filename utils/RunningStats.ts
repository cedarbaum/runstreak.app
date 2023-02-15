import { DateTime, Duration } from "luxon";
import { Settings } from "./SettingsContext";
import { getDistanceUnit } from "./SettingsUtil";
import { Activity } from "./StravaCache";

const metersToMiles = (meters: number) => meters * 0.000621371;

const metersToKm = (meters: number) => meters / 1000;

const metersPerSecondToMinutesPerMile = (mps: number) => {
  return 26.8224 / mps;
};

const metersPerSecondToMinutesPerKm = (mps: number) => {
  return 16.666666667 / mps;
};

export type ActivityStreak = {
  streakLength: number;
  activities: Activity[];
  startTime: number;
  endTime: number;
};

interface Statistic {
  name: string;
  calc: (streak: ActivityStreak, settings: Settings | null) => number | string;
  unit: (settings: Settings | null) => string;
}

export const streakStats: Statistic[] = [
  {
    name: "Streak",
    calc: (streak: ActivityStreak, settings: Settings | null) => {
      return streak.streakLength;
    },
    unit: (settings) => "",
  },
];

export const activityStats: Statistic[] = [
  {
    name: "Avg. distance",
    calc: (streak: ActivityStreak, settings: Settings | null) => {
      const activities = streak.activities;
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );

      const distanceUnit = getDistanceUnit(settings);
      const distance =
        distanceUnit === "mi"
          ? metersToMiles(totalDistance)
          : metersToKm(totalDistance);
      return (distance / activities.length).toFixed(2);
    },
    unit: (settings) => getDistanceUnit(settings),
  },
  {
    name: "Avg. speed",
    calc: (streak: ActivityStreak, settings: Settings | null) => {
      const activities = streak.activities;
      const totalAvgSpeed = activities.reduce(
        (acc, activity) => acc + activity.average_speed,
        0
      );
      const distanceUnit = getDistanceUnit(settings);
      const minutesPerUnit =
        distanceUnit === "mi"
          ? metersPerSecondToMinutesPerMile(totalAvgSpeed / activities.length)
          : metersPerSecondToMinutesPerKm(totalAvgSpeed / activities.length);

      return Duration.fromObject({ minutes: minutesPerUnit }).toFormat("mm:ss");
    },
    unit: (settings) => `min/${getDistanceUnit(settings)}`,
  },
  {
    name: "Avg. moving time",
    calc: (streak: ActivityStreak, settings: Settings | null) => {
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
    unit: (settings) => "",
  },
  {
    name: "Total distance",
    calc: (streak: ActivityStreak, settings: Settings | null) => {
      const activities = streak.activities;
      const totalDistance = activities.reduce(
        (acc, activity) => acc + activity.distance,
        0
      );

      const distanceUnit = getDistanceUnit(settings);
      const units =
        distanceUnit === "mi"
          ? metersToMiles(totalDistance)
          : metersToKm(totalDistance);
      return units.toFixed(2);
    },
    unit: (settings) => getDistanceUnit(settings),
  },
];

function normalizeStreakTimeBounds(ts: number, tz: string): number {
  return DateTime.fromMillis(ts).setZone(tz).startOf("day").toMillis();
}

export function calculateStreaks(
  now: DateTime,
  tz: string,
  activities: Activity[],
  minStreakLength: number,
  minActivityDistanceMeters: number
): ActivityStreak[] {
  let activityStreaks: ActivityStreak[] = [];
  let currentStreakActivites: Activity[] = [];
  let currentStreakLength = 0;

  let lastDate = now.startOf("day");
  let lastActivity = null;

  activities = activities.filter(
    (a) => a.distance >= minActivityDistanceMeters
  );

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

export function sortStreaks(s1: ActivityStreak, s2: ActivityStreak) {
  if (s1.streakLength < s2.streakLength) {
    return -1;
  }

  if (s1.streakLength > s2.streakLength) {
    return 1;
  }

  const s1TotalDistance = s1.activities.reduce(
    (acc, activity) => acc + activity.distance,
    0
  );

  const s2TotalDistance = s2.activities.reduce(
    (acc, activity) => acc + activity.distance,
    0
  );

  if (s1TotalDistance < s2TotalDistance) {
    return -1;
  }

  if (s1TotalDistance > s2TotalDistance) {
    return 1;
  }

  return 0;
}
