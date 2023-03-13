// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import stravaUserCanMakeRequest from "@/utils/RateLimiting";
import { Activity } from "@/utils/StravaTypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

import stravaApi from "strava-v3";

const schemaVersion = 1;

type Data = {
  schema_version: number;
  activities: Activity[];
};

type Error = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  const { page, per_page, after } = JSON.parse(req.body) as {
    page?: number;
    per_page?: number;
    after?: number;
  };

  if (!page || !per_page) {
    return res.status(400).json({ error: "page and per_page required" });
  }

  const jwt = await getToken({ req });
  if (!jwt) {
    return res.status(400).json({ error: "Invalid JWT" });
  }

  if (!(await stravaUserCanMakeRequest(jwt.user.id))) {
    return res.status(429).json({ error: "Account exceeded request limit" });
  }

  // @ts-ignore strava api has wrong typings
  const stravaClient = new stravaApi.client(jwt.accessToken);

  try {
    const activities = await stravaClient.athlete.listActivities({
      page,
      per_page,
      ...(after && {
        after,
      }),
    });

    const simplifiedActivities = activities
      .filter((activity: any) => activity.sport_type === "Run")
      .map((activity: any) => {
        return {
          id: activity.id,
          elapsed_time: activity.elapsed_time,
          moving_time: activity.moving_time,
          start_date: Date.parse(activity.start_date),
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          distance: activity.distance,
          total_elevation_gain: activity.total_elevation_gain,
        };
      });

    return res.status(200).json({
      schema_version: schemaVersion,
      activities: simplifiedActivities,
    });
  } catch (e: any) {
    return res
      .status(e?.statusCode || 500)
      .json({ error: "Failed to retrieve activity data from Strava" });
  }
}
