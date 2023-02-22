import Head from "next/head";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { Athlete, useStravaCache } from "@/utils/StravaCache";
import Footer from "@/components/Footer";
import Banner from "@/components/Banner";
import { ApplicationContext } from "@/utils/ApplicationContext";
import getErrorMessageFromResponse from "@/utils/ResponseError";
import getRunnerEmojiForAthlete from "@/utils/getRunnerEmojiForAthlete";
import Measure from "react-measure";
import { useRouter } from "next/router";
import { StravaContext } from "@/utils/StravaContext";

export default function Layout({ children }: { children: JSX.Element }) {
  const { data: session } = useSession();
  const { getAthlete, setAthlete } = useContext(StravaContext);
  const { error, setError, setAthleteLoading, setHeaderHeight } =
    useContext(ApplicationContext);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();

  const athlete = getAthlete(session?.user?.id);

  useAsyncEffect(async () => {
    if (session && session.user?.id) {
      if (athlete) {
        return;
      }

      setAthleteLoading(true);

      let data: Athlete;
      try {
        const res = await fetch("/api/athlete");
        data = (await res.json()).athlete as Athlete;

        if (!res.ok) {
          setError({
            message: await getErrorMessageFromResponse(res),
            code: res.status,
          });
          return;
        }
      } catch (e: any) {
        setError({ message: e.message ?? "Unknown error" });
        return;
      } finally {
        setAthleteLoading(false);
      }

      setAthlete(data);
    }
  }, [session?.user?.id, athlete]);

  return (
    <>
      <Head>
        <title>Run Streak</title>
        <meta
          name="description"
          content="Track your running streak on Strava!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${getRunnerEmojiForAthlete(
            athlete
          )}</text></svg>`}
        />
      </Head>
      <div className="container flex flex-col mx-auto justify-center items-center px-4">
        <div className="w-full">
          <Measure
            bounds
            onResize={(contentRect) => {
              setHeaderHeight(contentRect.bounds?.height ?? 0);
            }}
          >
            {({ measureRef }) => (
              <header ref={measureRef} className="sticky top-0 z-50 bg-white">
                {showBanner && error && (
                  <Banner
                    title={"Error"}
                    description={error.message}
                    onClose={() => setShowBanner(false)}
                  />
                )}
                <Header athlete={athlete} />
              </header>
            )}
          </Measure>
          <main>{children}</main>
          <footer className="sticky bottom-0 z-20 bg-white">
            <Footer hideAboutLabel={router?.pathname === "/about"} />
          </footer>
        </div>
      </div>
    </>
  );
}
