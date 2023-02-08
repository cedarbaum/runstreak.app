import { useSession } from "next-auth/react";
import { useStravaCacheForAthlete } from "./StravaCache";

export default function useRunnerEmoji() {
  const { data: session } = useSession();
  const { athlete } = useStravaCacheForAthlete(session?.user?.id);
  let athleteEmoji = "🏃";
  if (athlete?.sex === "M") {
    athleteEmoji = "🏃‍♂️‍️";
  } else if (athlete?.sex === "F") {
    athleteEmoji = "🏃‍♀️";
  }

  return athleteEmoji;
}
