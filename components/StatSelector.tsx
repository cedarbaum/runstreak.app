import { Statistic } from "@/utils/RunningStats";
import { useState } from "react";

export default function StatSelector({
  stats,
  onChange,
}: {
  stats: Statistic[];
  onChange?: (stat: Statistic) => void;
}) {
  const [selectedId, setSelectedId] = useState(0);

  return (
    <div className="flex flex-col">
      <label className="grow text-base font-semibold text-gray-900">
        Statistic:
      </label>
      <fieldset className="mt-4 flex justify-center">
        <legend className="sr-only">Graph statistic</legend>
        <div className="flex flex-col md:flex-row md:space-x-4 w-fit">
          {stats.map((stat, idx) => (
            <div key={stat.name} className="flex items-center">
              <input
                id={stat.name}
                name="graphed-statistic"
                type="radio"
                checked={selectedId === idx}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                onChange={() => {
                  setSelectedId(idx);
                  onChange?.(stat);
                }}
              />
              <label
                htmlFor={stat.name}
                className={`ml-3 block text-sm font-medium leading-6 text-gray-900 ${
                  selectedId === idx && "font-semibold"
                }`}
              >
                {stat.name}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
