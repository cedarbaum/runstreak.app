import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Footer() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between py-6 md:space-x-10 flex-col md:flex-row">
        {session && (
          <div className="flex justify-start lg:w-0 lg:flex-1 mb-2 md:mb-0">
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
        <div className="flex lg:w-0 lg:flex-1 mb-2 md:mb-0">
          <a
            className="underline decoration-indigo-600"
            href="/about"
            rel="noreferrer"
          >
            About / Privacy
          </a>
        </div>
        <div className="items-center justify-end md:flex">
          <Image
            src="api_logo_pwrdBy_strava_horiz_light.svg"
            width={193}
            height={48}
            alt={"Connect with Strava"}
          />
        </div>
      </div>
    </div>
  );
}
