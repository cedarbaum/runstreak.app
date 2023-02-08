import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@/utils/ApplicationContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import useRunnerEmoji from "@/utils/useRunnerEmoji";

export default function Header() {
  const { data: session } = useSession();
  const { isActivitiesLoading, isAthleteLoading } =
    useContext(ApplicationContext);
  const [loadingCounter, setLoadingCounter] = useState(0);
  const loading = isActivitiesLoading || isAthleteLoading;
  const athleteEmoji = useRunnerEmoji();

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

  const fireEmojis = "🔥".repeat(loading ? loadingCounter : 3);

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
            <a
              href="#"
              className="bg-strava text-white inline-flex items-center justify-center whitespace-nowrap border border-transparent px-4 py-2 font-medium"
              onClick={() => signOut()}
            >
              Sign out
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
