export default function About() {
  return (
    <>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        About
      </h2>
      <section className="mt-4">
        This is a free and open-source web app to help you track your running
        streaks on Strava!
        <ul className="list-disc list-inside mt-4 mb-4 marker:text-indigo-600">
          <li>
            Written using{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://nextjs.org/"
              target="_"
            >
              Next.js
            </a>{" "}
            and the{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://vercel.com"
              target="_"
            >
              Vercel
            </a>{" "}
            platform
          </li>
          <li>
            Styled using{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://tailwindcss.com/"
              target="_"
            >
              Tailwind CSS
            </a>{" "}
            and{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://tailwindui.com/"
              target="_"
            >
              Tailwind UI
            </a>
          </li>
          <li>
            Source code available on{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://github.com/cedarbaum/runstreak.app"
              target="_"
            >
              GitHub
            </a>
          </li>
          <li>Made with ❤️ in 🗽</li>
        </ul>
        If you have any questions or feedback, please email me{" "}
        <a
          className="underline decoration-indigo-600"
          href="mailto:scedarbaum@gmail.com"
        >
          here
        </a>
        !
      </section>
      <h2 className="mt-4 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Privacy
      </h2>
      <section className="mt-4">
        Your privacy is important! The TL;DR is:{" "}
        <b>we cannot access any of your Strava data!</b>
        <ul className="list-disc list-inside mt-4 marker:text-indigo-600">
          <li>
            All athlete and activity data is stored in your browser's local
            storage (delete any time by going to{" "}
            <b>Settings &gt; Clear cache</b>). No activity or athlete data is
            persisted on our servers.
          </li>
          <li>
            We only use cookies to store your login session info (considered a
            strictly necessary cookie under GDPR). No tracking cookies are used.
          </li>
          <li>
            Any analytics are collected using{" "}
            <a
              className="underline decoration-indigo-600"
              href="https://vercel.com/analytics"
              target="_"
            >
              Vercel Analytics
            </a>
            , which is fully anonymous and GDPR-compliant.
          </li>
          <li>
            The only data we store is the number of requests your account makes
            during a 24 hour period. This is to ensure that a user does not use
            too much of our Strava API quota. The Strava account IDs are
            securely encrypted before being stored, so the original IDs cannot
            be practically recovered from our database (even by us).
          </li>
        </ul>
      </section>
    </>
  );
}
