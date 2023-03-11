import { DateBucket } from "@/utils/RunningStats";
import { useState } from "react";

export default function AggregationSelector({
  defaultAggregation,
  onChange,
}: {
  defaultAggregation: DateBucket;
  onChange?: (bucket: DateBucket) => void;
}) {
  const [selectedAggregation, setSelectedAggregation] =
    useState(defaultAggregation);

  const getButton = (idx: number, bucket: DateBucket) => {
    let classNameValue;
    if (idx === 0) {
      classNameValue =
        "relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10";
    } else if (idx === Object.keys(DateBucket).length - 1) {
      classNameValue =
        "relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10";
    } else {
      classNameValue =
        "relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10";
    }

    return (
      <button
        type="button"
        key={idx}
        className={`${classNameValue} ${
          selectedAggregation === bucket
            ? " bg-indigo-600 text-white hover:bg-indigo-700"
            : " bg-white text-gray-900 hover:bg-gray-50"
        }`}
        onClick={() => {
          setSelectedAggregation(bucket);
          onChange?.(bucket);
        }}
      >
        {bucket}
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      <label className="grow text-base font-semibold text-gray-900">
        Aggregation period:
      </label>
      <div className="justify-center mt-4 space-y-4 flex space-y-0 space-x-10">
        <span>
          {Object.values(DateBucket).map((bucket, idx) =>
            getButton(idx, bucket)
          )}
        </span>
      </div>
    </div>
  );
}
