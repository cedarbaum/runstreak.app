import {
  activityStats,
  ActivityStreak,
  DateBucket,
  groupActivitiesByBucket,
  Statistic,
} from "@/utils/RunningStats";
import { Settings, SettingsContext } from "@/utils/SettingsContext";
import { formatDateIntl, getTimeZone } from "@/utils/SettingsUtil";
import useRunStreakData from "@/utils/useRunStreakData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSession } from "next-auth/react";
import { useContext, useState } from "react";
import { DateTime } from "luxon";
import { Line } from "react-chartjs-2";
import { useRouter } from "next/router";
import StatSelector from "@/components/StatSelector";
import AggregationSelector from "@/components/AggregationSelector";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

function getTimeseriesForStat(
  stat: Statistic,
  streak: ActivityStreak,
  bucketType: DateBucket,
  settings: Settings | null
) {
  const activityBuckets = groupActivitiesByBucket(
    streak.activities,
    bucketType,
    settings
  );

  const labels = activityBuckets.map((bucket) => bucket.bucketLabel);
  const distances = activityBuckets.map(({ activities }) => {
    const tz = getTimeZone(settings);
    const startDate = DateTime.fromMillis(activities[0].start_date).setZone(tz);
    const endDate = DateTime.fromMillis(
      activities[activities.length - 1].start_date
    ).setZone(tz);
    const streakLength = endDate.diff(startDate, "days").days + 1;
    return stat.calc(
      {
        activities,
        streakLength,
        startTime: startDate.toMillis(),
        endTime: endDate.toMillis(),
      },
      settings
    );
  });

  return {
    labels,
    datasets: [
      {
        label: `${stat.name} (${stat.unit(settings)})`,
        data: distances,
        fill: false,
        borderColor: "rgb(79, 70, 229)",
        tension: 0.1,
      },
    ],
  };
}

export default function Analytics() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentStreak, streaks } = useRunStreakData(session?.user?.id);
  const { settings } = useContext(SettingsContext);
  const [bucketType, setBucketType] = useState<DateBucket | null>(null);
  const [stat, setStat] = useState<Statistic>(activityStats[0]);

  const { startTime, endTime } = router.query;

  let streak = null;
  if (startTime && endTime && streaks) {
    const startTimeMillis = parseInt(startTime as string);
    const endTimeMillis = parseInt(endTime as string);

    streak = streaks.find(
      (streak) =>
        streak.startTime === startTimeMillis && streak.endTime === endTimeMillis
    );
  } else if (currentStreak) {
    streak = currentStreak;
  }

  if (!streaks) {
    return null;
  }

  if (!streak) {
    return (
      <h1 className="font-bold text-2xl text-red-600">
        No streak found between provided dates
      </h1>
    );
  }

  const defaultAggregation =
    streak.streakLength < 30 ? DateBucket.Day : DateBucket.Week;

  const timeseriesData = getTimeseriesForStat(
    stat,
    streak,
    bucketType ?? defaultAggregation,
    settings
  );

  return (
    <div>
      <h1 className="font-bold text-xl md:text-2xl mb-4">{`Statistic for streak between ${formatDateIntl(
        streak?.startTime,
        settings
      )} - ${formatDateIntl(streak?.endTime, settings)}`}</h1>
      <div className="h-[33vh] md:h-[50vh]">
        <Line options={options} data={timeseriesData} />
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-between mt-8 mb-8 ring-1 ring-inset ring-gray-300 p-4">
        <div className="mb-4 lg:mb-0">
          <StatSelector stats={activityStats} onChange={setStat} />
        </div>
        <AggregationSelector
          onChange={setBucketType}
          defaultAggregation={defaultAggregation}
        />
      </div>
    </div>
  );
}
