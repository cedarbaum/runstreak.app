import { SettingsContext, SettingsContextType } from "@/utils/SettingsContext";
import { getDistanceUnit, getTimeZone } from "@/utils/SettingsUtil";
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
    setShowClearCacheModal(false);
    signOut();
  };

  const cancel = () => {
    setShowClearCacheModal(false);
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
                ${open ? "relative z-[300]" : "text-opacity-90"}
                group inline-flex items-center bg-strava px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none`}
            >
              <span>Settings</span>
              {open ? (
                <ChevronDownIcon
                  className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80`}
                  aria-hidden="true"
                />
              ) : (
                <ChevronUpIcon
                  className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80`}
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
                          className={`font-bold relative -ml-px inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 ${
                            distanceUnit === "km"
                              ? "bg-strava text-white"
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
                          className={`font-bold relative -ml-px inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:z-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 ${
                            distanceUnit === "mi"
                              ? "bg-strava text-white"
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
                    <div className="flex justify-between items-center mt-8 w-full">
                      <div className="w-[45%]">
                        <a
                          href="#"
                          className="w-full px-4 py-2 font-medium inline-flex justify-center bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => setShowClearCacheModal(true)}
                        >
                          Clear cache
                        </a>
                      </div>
                      <div className="w-[45%]">
                        <a
                          href="#"
                          className="w-full bg-strava text-white inline-flex items-center justify-center whitespace-nowrap border border-transparent px-4 py-2 font-medium"
                          onClick={() => signOut()}
                        >
                          Sign out
                        </a>
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
