import { Athlete } from "./StravaTypes";

export default function getRunnerEmojiForAthlete(athlete: Athlete | undefined | null) {
  let athleteEmoji = "🏃";
  if (athlete?.sex === "M") {
    athleteEmoji = "🏃‍♂️‍️";
  } else if (athlete?.sex === "F") {
    athleteEmoji = "🏃‍♀️";
  }

  return athleteEmoji;
}
