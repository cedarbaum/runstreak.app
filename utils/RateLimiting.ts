import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const RATE_LIMIT_PREFIX = "runstreak.app";

const requestLimit = parseInt(process.env.STRAVA_DAILY_API_LIMIT!);
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(requestLimit, "24 h"),
  prefix: `${RATE_LIMIT_PREFIX}-request`,
  analytics: false,
});

export default async function stravaUserCanMakeRequest(
  accountId: string | number
) {
  const encryptedAccountId = crypto
    .createHash("sha256")
    .update(accountId.toString())
    .digest("hex");
  const { success } = await ratelimit.limit(encryptedAccountId);
  return success;
}
