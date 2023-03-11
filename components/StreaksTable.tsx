import {
  ApplicationContext,
  ApplicationContextType,
} from "@/utils/ApplicationContext";
import {
  ActivityStreak,
  activityStats,
  streakStats,
} from "@/utils/RunningStats";
import { SettingsContext, SettingsContextType } from "@/utils/SettingsContext";
import Link from "next/link";
import { useContext } from "react";

export interface StreaksTableProps {
  topN: number;
  topStreaks: ActivityStreak[];
}

export default function StreaksTable({ topN, topStreaks }: StreaksTableProps) {
  const allStats = streakStats.concat(activityStats);
  const { settings } = useContext<SettingsContextType>(SettingsContext);
  const { headerHeight } =
    useContext<ApplicationContextType>(ApplicationContext);

  return (
    <div className="mt-10">
      <div className="sm:flex-auto">
        <h1 className="text-xl font-semibold text-gray-900">
          Top {topN} Streaks:
        </h1>
      </div>
      <div className="flex flex-col">
        <div className="mt-2">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {allStats.map((stat, statIdx) => (
                      <th
                        key={`stat${statIdx}`}
                        scope="col"
                        style={{ top: `${headerHeight}px` }}
                        className={`sticky z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8 ${
                          statIdx === 2 || statIdx == 3
                            ? "hidden md:table-cell"
                            : ""
                        }`}
                      >
                        {stat.name}{" "}
                        {stat.unit(settings, true) !== ""
                          ? `(${stat.unit(settings, true)})`
                          : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {topStreaks.map((streak, streakIdx) => (
                    <tr key={`streak${streakIdx}`}>
                      {allStats.map((stat, statIdx) => (
                        <td
                          key={`stat${statIdx}`}
                          className={`border-b border-gray-200 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8 ${
                            statIdx === 2 || statIdx == 3
                              ? "hidden md:table-cell"
                              : ""
                          }`}
                        >
                          {statIdx > 0 ? (
                            stat.calc(streak, settings, true)
                          ) : (
                            <Link
                              href={{
                                pathname: "/analytics",
                                query: {
                                  startTime: streak?.startTime,
                                  endTime: streak?.endTime,
                                },
                              }}
                              className="underline decoration-indigo-600 ml-1 mt-2"
                            >
                              {stat.calc(streak, settings, true)}
                            </Link>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
