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
import useRunStreakData from "@/utils/useRunStreakData";

export default function Home() {
  const { data: session } = useSession();
  const { currentStreak, streaks } = useRunStreakData(session?.user?.id);

  const topTenStreaks = streaks?.sort(sortStreaks).reverse().slice(0, 10);

  return (
    <>
      <CurrentStreak currentStreak={currentStreak} />
      {topTenStreaks && <StreaksTable topN={10} topStreaks={topTenStreaks} />}
    </>
  );
}
