// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { Athlete } from "@/utils/StravaTypes";

import stravaApi from "strava-v3";
import { DynamoDbRequestThrottler } from "@/utils/DynamoDbRequestThrottler";

const schemaVersion = 1;

type Data = {
  schema_version: number;
  athlete: Athlete;
};

type Error = {
  error: string;
};

const dynamoDbRequestThrottler = new DynamoDbRequestThrottler(
  process.env.DDB_ACCESS_KEY_ID!,
  process.env.DDB_SECRET_ACCESS_KEY!,
  process.env.DDB_REGION!,
  process.env.DDB_TABLE_NAME!,
  parseInt(process.env.STRAVA_DAILY_API_LIMIT!)
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  const jwt = await getToken({ req });
  if (!jwt) {
    return res.status(400).json({ error: "Invalid JWT" });
  }

  if (
    !(await dynamoDbRequestThrottler.canMakeRequest(jwt.user.id.toString()))
  ) {
    return res.status(429).json({ error: "Account exceeded request limit" });
  }

  // @ts-ignore strava api has wrong typings
  const stravaClient = new stravaApi.client(jwt.accessToken);

  try {
    const athlete = await stravaClient.athlete.get({});
    const simplifiedAthlete = {
      id: athlete.id,
      firstname: athlete.firstname,
      lastName: athlete.lastname,
      sex: athlete.sex,
    };

    return res
      .status(200)
      .json({ athlete: simplifiedAthlete, schema_version: schemaVersion });
  } catch (e: any) {
    return res
      .status(e?.statusCode || 500)
      .json({ error: "Failed to retrieve athlete data from Strava" });
  }
}
