const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

go();

async function go() {
  const userResponse = await fetch(
    "https://api.twitch.tv/helix/users?login=sneakyteak",
    {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
      },
    }
  );
  const userId = (await userResponse.json()).data[0].id;

  let nextCursor = undefined;

  while (true) {
    const followersResponse = await fetch(
      `https://api.twitch.tv/helix/users/follows?to_id=${userId}&first=100${
        nextCursor ? `&after=${nextCursor}` : ""
      }`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
        },
      }
    );

    const {
      data: followers,
      pagination: { cursor },
    } = await followersResponse.json();
    nextCursor = cursor;

    console.log(
      followers
        .map(({ from_id, from_name }) => `${from_id} ${from_name}`)
        .join("\n")
    );

    if (nextCursor === undefined) break;

    const rateLimitRemaining = followersResponse.headers.get(
      "ratelimit-remaining"
    );
    if (rateLimitRemaining <= 0) {
      const sleepUntilRateLimitReset =
        followersResponse.headers.get("ratelimit-reset") * 1000 - Date.now();
      console.log(
        `Sleeping ${sleepUntilRateLimitReset}ms until rate limit reset}`
      );
      await new Promise((resolve, reject) =>
        setTimeout(() => resolve(), sleepUntilRateLimitReset)
      );
    }
  }
}
