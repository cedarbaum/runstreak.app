import { Fragment, useContext } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { SettingsContext, SettingsContextType } from "@/utils/SettingsContext";
import { getTimeZone } from "@/utils/SettingsUtil";

// From: https://github.com/ndom91/react-timezone-select/blob/main/src/timezone-list.ts
const allTimezones = [
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Juneau",
  "America/Boise",
  "America/Dawson",
  "America/Chihuahua",
  "America/Phoenix",
  "America/Chicago",
  "America/Regina",
  "America/Mexico_City",
  "America/Belize",
  "America/Detroit",
  "America/Bogota",
  "America/Caracas",
  "America/Santiago",
  "America/St_Johns",
  "America/Sao_Paulo",
  "America/Tijuana",
  "America/Montevideo",
  "America/Argentina/Buenos_Aires",
  "America/Godthab",
  "America/Los_Angeles",
  "Atlantic/Azores",
  "Atlantic/Cape_Verde",
  "GMT",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Africa/Casablanca",
  "Atlantic/Canary",
  "Europe/Belgrade",
  "Europe/Sarajevo",
  "Europe/Brussels",
  "Europe/Amsterdam",
  "Africa/Algiers",
  "Europe/Bucharest",
  "Africa/Cairo",
  "Europe/Helsinki",
  "Europe/Athens",
  "Asia/Jerusalem",
  "Africa/Harare",
  "Europe/Moscow",
  "Asia/Kuwait",
  "Africa/Nairobi",
  "Asia/Baghdad",
  "Asia/Tehran",
  "Asia/Dubai",
  "Asia/Baku",
  "Asia/Kabul",
  "Asia/Yekaterinburg",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Colombo",
  "Asia/Almaty",
  "Asia/Rangoon",
  "Asia/Bangkok",
  "Asia/Krasnoyarsk",
  "Asia/Shanghai",
  "Asia/Kuala_Lumpur",
  "Asia/Taipei",
  "Australia/Perth",
  "Asia/Irkutsk",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Yakutsk",
  "Australia/Darwin",
  "Australia/Adelaide",
  "Australia/Sydney",
  "Australia/Brisbane",
  "Australia/Hobart",
  "Asia/Vladivostok",
  "Pacific/Guam",
  "Asia/Magadan",
  "Asia/Kamchatka",
  "Pacific/Fiji",
  "Pacific/Auckland",
  "Pacific/Tongatapu",
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function TimezoneSelector() {
  const { settings, setSettings } =
    useContext<SettingsContextType>(SettingsContext);

  const currentTz = getTimeZone(settings);
  if (!allTimezones.find((tz) => tz === currentTz)) {
    allTimezones.push(currentTz);
  }

  return (
    <Listbox
      value={currentTz}
      onChange={(timezone) => setSettings({ ...settings, timezone })}
    >
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">{currentTz}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {allTimezones.map((tz, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-8 pr-4"
                      )
                    }
                    value={tz}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {tz}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 left-0 flex items-center pl-1.5"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
