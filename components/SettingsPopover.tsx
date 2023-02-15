import { SettingsContext, SettingsContextType } from "@/utils/SettingsContext";
import { getDistanceUnit, getMinDistance } from "@/utils/SettingsUtil";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { signOut } from "next-auth/react";
import { Fragment, useContext, useState } from "react";
import ClearCacheModal from "./ClearCacheModal";
import TimezoneSelector from "./TimezoneSelector";

export default function SettingsPopover() {
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const { settings, setSettings } =
    useContext<SettingsContextType>(SettingsContext);

  const clearCache = () => {
    localStorage.removeItem("strava-cache-athletes");
    localStorage.removeItem("strava-cache-activities");
    localStorage.removeItem("settings");
    setShowClearCacheModal(false);
    signOut();
  };

  const cancel = () => {
    setShowClearCacheModal(false);
  };

  const onMinDistanceInput = (e: any) => {
    const minDistance = parseFloat(e?.target?.value);
    if (isNaN(minDistance) || minDistance < 0) {
      return;
    }

    setSettings({ ...settings, min_distance: minDistance });
  };

  const distanceUnit = getDistanceUnit(settings);

  return (
    <>
      {showClearCacheModal && (
        <ClearCacheModal onClear={clearCache} onClose={cancel} />
      )}
      <Popover className="relative]">
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? "relative z-[300]" : ""}
                inline-flex items-center border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span>Settings</span>
              {open ? (
                <ChevronDownIcon
                  className="ml-2 h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80"
                  aria-hidden="true"
                />
              ) : (
                <ChevronUpIcon
                  className="ml-2 h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80"
                  aria-hidden="true"
                />
              )}
            </Popover.Button>
            <Popover.Overlay className="fixed inset-0 z-[200] overflow-y-auto bg-black opacity-30" />
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-0"
              enterTo="opacity-100 translate-y-1"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-1"
              leaveTo="opacity-0 translate-y-0"
            >
              <Popover.Panel className="absolute right-0 z-[300] mt-3 transform w-screen max-w-[calc(100vw-2rem)] sm:max-w-sm md:max-w-sm lg:max-w-sm bg-white">
                <div className="shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Unit of distance:</span>
                      <span className="isolate inline-flex shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            setSettings({ ...settings, distance_unit: "km" })
                          }
                          className={`relative -ml-px inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            distanceUnit === "km"
                              ? "bg-indigo-600 text-white"
                              : "bg-white hover-bg-gray-50"
                          }`}
                        >
                          KM
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSettings({ ...settings, distance_unit: "mi" })
                          }
                          className={`relative -ml-px inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            distanceUnit === "mi"
                              ? "bg-indigo-600 text-white"
                              : "bg-white hover-bg-gray-50"
                          }`}
                        >
                          MI
                        </button>
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-8 w-full">
                      <span className="font-bold w-1/2">Timezone:</span>
                      <div className="w-1/2">
                        <TimezoneSelector />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-8">
                      <span className="font-bold">
                        Min. distance ({getDistanceUnit(settings)}):
                      </span>
                      <input
                        className="relative w-1/4 cursor-default border border-gray-300 bg-white py-2 pl-3 pr-3 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        type="text"
                        placeholder={getMinDistance(settings).toString()}
                        onInput={onMinDistanceInput}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-8 w-full">
                      <div className="w-[45%]">
                        <button
                          type="button"
                          className="w-full inline-flex w-full justify-center border border-transparent bg-red-600 px-4 py-2 text-base text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => setShowClearCacheModal(true)}
                        >
                          Clear cache
                        </button>
                      </div>
                      <div className="w-[45%]">
                        <button
                          className="w-full inline-flex items-center justify-center border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => signOut()}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
}
