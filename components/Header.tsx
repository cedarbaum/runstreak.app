import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@/utils/ApplicationContext";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import getRunnerEmojiForAthlete from "@/utils/getRunnerEmojiForAthlete";
import { Athlete } from "@/utils/StravaCache";
import { useWindowWidth } from "@react-hook/window-size";
import SettingsPopover from "./SettingsPopover";

export interface HeaderProps {
  athlete: Athlete | undefined;
}

export default function Header({ athlete }: HeaderProps) {
  const { data: session } = useSession();
  const { isActivitiesLoading, isAthleteLoading } =
    useContext(ApplicationContext);
  const [loadingCounter, setLoadingCounter] = useState(0);
  const loading = isActivitiesLoading || isAthleteLoading;
  const athleteEmoji = getRunnerEmojiForAthlete(athlete);
  const [numFlames, setNumFlames] = useState(3);
  const windowWidth = useWindowWidth();

  useEffect(() => {
    if (!loading) {
      setLoadingCounter(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingCounter((prev) => (prev + 1) % 4);
    }, 200);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const numFlamesBasedOnWindowSize = windowWidth < 410 && !session ? 1 : 3;
    setNumFlames(numFlamesBasedOnWindowSize);
  }, [windowWidth, session]);

  const fireEmojis = "🔥".repeat(loading ? loadingCounter : numFlames);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between py-6 md:justify-start md:space-x-10">
        <div className="flex justify-start lg:w-0 lg:flex-1">
          <a href="#">
            <span className="text-4xl">
              {athleteEmoji}
              {fireEmojis}‍️️
            </span>
          </a>
        </div>
        <div className="-my-2 -mr-2 md:hidden"></div>
        <div className="items-center justify-end md:flex md:flex-1 lg:w-0">
          {!session ? (
            <a
              className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              onClick={() => signIn("strava")}
            >
              <Image
                src="btn_strava_connectwith_orange.svg"
                width={193}
                height={48}
                alt={"Connect with Strava"}
              />
            </a>
          ) : (
            <SettingsPopover />
          )}
        </div>
      </div>
    </div>
  );
}
