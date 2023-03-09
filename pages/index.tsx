import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import {
  ActivityStreak,
  calculateStreaks,
  sortStreaks,
} from "@/utils/RunningStats";
import { DateTime } from "luxon";
import CurrentStreak from "@/components//CurrentStreak";
import StreaksTable from "@/components/StreaksTable";
import { SettingsContext } from "@/utils/SettingsContext";
import {
  getDistanceUnit,
  getMinDistance,
  getTimeZone,
} from "@/utils/SettingsUtil";
import useStrava from "@/utils/useStrava";

export default function Home() {
  const { data: session } = useSession();
  const [streaks, setStreaks] = useState<ActivityStreak[] | undefined>(
    undefined
  );
  const { activities } = useStrava(session?.user?.id);
  const { settings } = useContext(SettingsContext);

  const tz = getTimeZone(settings);
  const now = DateTime.now().setZone(tz);

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

  const topTenStreaks = streaks?.sort(sortStreaks).reverse().slice(0, 10);

  return (
    <>
      <CurrentStreak currentStreak={currentStreak} />
      {topTenStreaks && <StreaksTable topN={10} topStreaks={topTenStreaks} />}
    </>
  );
}
