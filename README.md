# 🏃‍♂️‍️🔥🔥🔥

This is a simple web app to track your running streaks (consecutive days of running) on Strava.

## Getting Started

### Configuring authentication

This project uses [NextAuth.js](https://next-auth.js.org/) for authentication.

You will first need to create a [Strava API application](https://developers.strava.com/docs/getting-started/).

Once this is done, configure the following environment variables in a `.env.local` file:

```
STRAVA_CLIENT_ID=CLIENT_ID
STRAVA_CLIENT_SECRET=CLIENT_SECRET
NEXTAUTH_SECRET=SECURE_GENERATED_SECRET
```

### Rate limiting

Since Strava has a relatively strict default API limit per application, it is useful to restrict the number of API requests per account. This application uses Redis hosted hosted on [Upstash](https://upstash.com/) to track and throttle requests. Once you setup the Redis DB, fillout the following env variables:

```
UPSTASH_REDIS_REST_URL=URL
UPSTASH_REDIS_REST_TOKEN=TOKEN
```

Finally, set the per account limit you want to use.

```
STRAVA_DAILY_API_LIMIT=LIMIT
```

Note that if you wish to not setup rate limiting, you can just comment out the code in [@/utils/RateLimiting.ts](./utils/RateLimiting.ts).

### Building / Running

This project uses a standard Next.js setup:

```bash
npm install
npm run dev
```
