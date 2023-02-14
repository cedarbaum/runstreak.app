import CountUp from "react-countup";
import { ActivityStreak, activityStats } from "@/utils/RunningStats";
import { useContext } from "react";
import { SettingsContext, SettingsContextType } from "@/utils/SettingsContext";

export interface CurrentStreakProps {
  currentStreak: ActivityStreak | undefined;
}

export default function CurrentStreak({ currentStreak }: CurrentStreakProps) {
  const { settings } = useContext<SettingsContextType>(SettingsContext);

  return (
    <dl className="grid grid-cols-1 overflow-hidden bg-white md:grid-cols-2">
      <div className="px-4 py-5 sm:p-6 border-l border-t border-b border-r md:border-r-0 border-gray-200">
        <dt className="text-base font-normal text-gray-900">
          <span className="text-2xl font-bold">Current streak:</span>
          <br />
          {currentStreak ? (
            <CountUp start={0} end={currentStreak.streakLength} delay={0}>
              {({ countUpRef }) => (
                <span
                  className="text-8xl inline-block text-center w-full"
                  ref={countUpRef}
                />
              )}
            </CountUp>
          ) : (
            <span className="text-8xl inline-block text-center w-full">--</span>
          )}
        </dt>
      </div>
      <div className="h-full md:border-t border-l">
        <dl className="h-full grid grid-cols-2 grid-rows-2 overflow-hidden bg-white">
          {activityStats.map((stat, idx) => (
            <div
              key={`stat${idx}`}
              className="px-4 py-5 sm:p-6 border-r border-b border-gray-200"
            >
              <dt className="text-base font-normal text-gray-900">
                <span className="font-bold">{stat.name}:</span>
                <br />
                <span>
                  {currentStreak
                    ? `${stat.calc(currentStreak, settings)} ${stat.unit(
                        settings
                      )}`
                    : "--"}
                </span>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </dl>
  );
}
