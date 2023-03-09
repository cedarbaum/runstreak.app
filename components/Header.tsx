import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import getRunnerEmojiForAthlete from "@/utils/getRunnerEmojiForAthlete";
import { Athlete } from "@/utils/StravaTypes";
import { useWindowWidth } from "@react-hook/window-size";
import SettingsPopover from "./SettingsPopover";
import Link from "next/link";
import useStrava from "@/utils/useStrava";

export interface HeaderProps {
  athlete: Athlete | undefined | null;
}

export default function Header({ athlete }: HeaderProps) {
  const { data: session, status: sessionStatus } = useSession();
  const { activitiesLoading, athleteLoading } = useStrava(session?.user?.id);
  const [loadingCounter, setLoadingCounter] = useState(0);
  const sessionLoading = sessionStatus === "loading";
  const loading = activitiesLoading || athleteLoading || sessionLoading;
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
          <Link href="/">
            <span className="text-4xl">
              {athleteEmoji}
              {fireEmojis}‍️️
            </span>
          </Link>
        </div>
        <div className="-my-2 -mr-2 md:hidden"></div>
        {!sessionLoading && (
          <div className="items-center justify-end md:flex md:flex-1 lg:w-0">
            {!session ? (
              <button
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                onClick={() => signIn("strava")}
                type="button"
              >
                <Image
                  src="btn_strava_connectwith_orange.svg"
                  width={193}
                  height={48}
                  alt="Connect with Strava"
                />
              </button>
            ) : (
              <SettingsPopover />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
