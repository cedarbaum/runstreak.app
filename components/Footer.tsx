import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Footer({
  hideAboutLabel,
}: {
  hideAboutLabel?: boolean;
}) {
  const { data: session } = useSession();

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between py-2 md:py-6 md:space-x-10 flex-col md:flex-row border-t md:border-t-0">
        {session && (
          <div className="flex justify-start lg:w-0 lg:flex-1 mb-0.5 md:mb-0">
            <span>Signed in as&nbsp;</span>
            <a
              className="underline decoration-indigo-600"
              href={`https://www.strava.com/athletes/${session.user?.id}`}
              target="_blank"
              rel="noreferrer"
            >
              {session.user?.name}
            </a>
          </div>
        )}
        {!hideAboutLabel && (
          <div className="flex lg:w-0 lg:flex-1 mb-0.5 md:mb-0">
            <Link
              className="underline decoration-indigo-600"
              href="/about"
              rel="noreferrer"
            >
              About / Privacy
            </Link>
          </div>
        )}
        <div className="items-center justify-end md:flex">
          <Image
            src="api_logo_pwrdBy_strava_horiz_light.svg"
            width={193}
            height={48}
            alt="Powered by Strava"
          />
        </div>
      </div>
    </div>
  );
}
