import { Athlete } from "./StravaTypes";

export default function getRunnerEmojiForAthlete(
  athlete: Athlete | undefined | null
) {
  if (athlete?.sex === "M") {
    return "🏃‍♂️‍️";
  } else if (athlete?.sex === "F") {
    return "🏃‍♀️";
  }

  return "🏃";
}
