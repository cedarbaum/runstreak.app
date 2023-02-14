import { Athlete } from "./StravaCache";

export default function getRunnerEmojiForAthlete(athlete: Athlete | undefined) {
  let athleteEmoji = "🏃";
  if (athlete?.sex === "M") {
    athleteEmoji = "🏃‍♂️‍️";
  } else if (athlete?.sex === "F") {
    athleteEmoji = "🏃‍♀️";
  }

  return athleteEmoji;
}