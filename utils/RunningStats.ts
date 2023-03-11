import { groupBy } from "lodash";
import { DateTime, Duration } from "luxon";
import { Settings } from "./SettingsContext";
import {
  formatDate,
  formatDateIntl,
  getDistanceUnit,
  getTimeZone,
} from "./SettingsUtil";
import { Activity } from "./StravaTypes";

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

export interface Statistic {
  name: string;
  calc: (
    streak: ActivityStreak,
    settings: Settings | null,
    format?: boolean
  ) => number | string;
  unit: (settings: Settings | null, formatted?: boolean) => string;
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
    calc: (streak: ActivityStreak, settings: Settings | null, format) => {
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

      const duration = Duration.fromObject({ minutes: minutesPerUnit });
      return format
        ? duration.toFormat("mm:ss")
        : duration.as("minutes").toFixed(2);
    },
    unit: (settings) => `min/${getDistanceUnit(settings)}`,
  },
  {
    name: "Avg. moving time",
    calc: (streak: ActivityStreak, settings: Settings | null, format) => {
      const activities = streak.activities;
      const totalDuration = activities.reduce(
        (acc, activity) => acc + activity.moving_time,
        0
      );

      const averageDuration = Duration.fromMillis(
        (totalDuration * 1000) / activities.length
      ).normalize();

      return format
        ? averageDuration.toFormat("hh:mm:ss")
        : averageDuration.as("minutes").toFixed(2);
    },
    unit: (settings, formatted) => (formatted ? "" : "mins"),
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
  let currentStreakActivities: Activity[] = [];
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
      currentStreakActivities.unshift(activity);
      if (lastActivity == null) {
        currentStreakLength++;
      }
    } else if (dayDiff === 1) {
      currentStreakActivities.unshift(activity);
      currentStreakLength++;
    } else {
      if (currentStreakLength > 0) {
        activityStreaks.unshift({
          activities: currentStreakActivities,
          streakLength: currentStreakLength,
          startTime: normalizeStreakTimeBounds(
            currentStreakActivities[0].start_date,
            tz
          ),
          endTime: normalizeStreakTimeBounds(
            currentStreakActivities[currentStreakActivities.length - 1]
              .start_date,
            tz
          ),
        });
      }

      currentStreakActivities = [activity];
      currentStreakLength = 1;
    }

    lastActivity = activity;
    lastDate = activityDate;
  }

  if (currentStreakLength > 0) {
    activityStreaks.unshift({
      activities: currentStreakActivities,
      streakLength: currentStreakLength,
      startTime: normalizeStreakTimeBounds(
        currentStreakActivities[0].start_date,
        tz
      ),
      endTime: normalizeStreakTimeBounds(
        currentStreakActivities[currentStreakActivities.length - 1].start_date,
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

export enum DateBucket {
  Day = "Day",
  Week = "Week",
  Month = "Month",
  Year = "Year",
}

export function groupActivitiesByBucket(
  activities: Activity[],
  bucket: DateBucket,
  settings: Settings | null
) {
  const bucketedActivities = groupBy(activities, (activity) => {
    const date = DateTime.fromMillis(activity.start_date).setZone(
      getTimeZone(settings)
    );

    let bucketMillis;
    let bucketLabel;
    switch (bucket) {
      case DateBucket.Day:
        bucketMillis = date.startOf("day").toMillis();
        bucketLabel = formatDateIntl(bucketMillis, settings);
        break;
      case DateBucket.Week:
        bucketMillis = date.startOf("week").toMillis();
        bucketLabel = formatDateIntl(bucketMillis, settings);
        break;
      case DateBucket.Month:
        bucketMillis = date.startOf("month").toMillis();
        bucketLabel = formatDate(bucketMillis, "MM/yyyy", settings);
        break;
      case DateBucket.Year:
        bucketMillis = date.startOf("year").toMillis();
        bucketLabel = formatDate(bucketMillis, "yyyy", settings);
        break;
    }

    return `${bucketMillis}___${bucketLabel}`;
  });

  const sortedKeys = Object.keys(bucketedActivities).sort(
    (a, b) => parseInt(a.split("___")[0]) - parseInt(b.split("___")[0])
  );

  return sortedKeys.map((key) => {
    const [bucketMillis, bucketLabel] = key.split("___");
    return {
      bucketMillis: parseInt(bucketMillis),
      bucketLabel,
      activities: bucketedActivities[key],
    };
  });
}
