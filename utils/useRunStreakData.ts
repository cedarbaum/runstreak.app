import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { ActivityStreak, calculateStreaks } from "./RunningStats";
import { SettingsContext } from "./SettingsContext";
import { getDistanceUnit, getMinDistance, getTimeZone } from "./SettingsUtil";
import useStrava from "./useStrava";

export default function useRunStreakData(athleteId: string | undefined) {
  const { settings } = useContext(SettingsContext);
  const tz = getTimeZone(settings);
  const now = DateTime.now().setZone(tz);
  const [streaks, setStreaks] = useState<ActivityStreak[] | undefined>(
    undefined
  );

  const { activities } = useStrava(athleteId);

  const minDistance = getMinDistance(settings);
  const minDistanceMeters =
    getDistanceUnit(settings) === "km"
      ? minDistance * 1000
      : minDistance * 1609.34;

  useEffect(() => {
    if (activities) {
      setStreaks(calculateStreaks(now, tz, activities, 1, minDistanceMeters));
    }
  }, [activities, tz, minDistanceMeters]);

  const currentStreak = streaks
    ? streaks.find((streak) => {
        const diff = now
          .startOf("day")
          .diff(DateTime.fromMillis(streak.endTime).setZone(tz), "days");
        return diff.days < 2;
      })
    : undefined;

  return { currentStreak, streaks };
}
