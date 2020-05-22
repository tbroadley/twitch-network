const dotenv = require("dotenv");
const fs = require("fs");
const fetch = require("node-fetch");

dotenv.config();

go();

async function go() {
  const userResponse = await twitch("/users?login=sneakyteak");
  const userId = (await userResponse.json()).data[0].id;

  console.log(`Fetching followers for ${userId}`);
  await fetchFollowers(userId);

  const followerFiles = fs.readdirSync("./data/followers");
  for (index in followerFiles) {
    const userId = followerFiles[index].replace(".txt", "");
    console.log(
      `Fetching follows for ${userId} (${Number(index) + 1}/${
        followerFiles.length
      })`
    );
    await fetchFollows(userId);
  }
}

async function fetchFollowers(userId) {
  let nextCursor = undefined;

  while (true) {
    const followersResponse = await twitch(
      `/users/follows?to_id=${userId}&first=100${
        nextCursor ? `&after=${nextCursor}` : ""
      }`
    );

    const {
      data: followers,
      pagination: { cursor },
    } = await followersResponse.json();
    nextCursor = cursor;

    for (index in followers) {
      const { from_id, from_name } = followers[index];
      fs.writeFileSync(`./data/followers/${from_id}.txt`, `${from_name}\n\n`);
    }

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

async function fetchFollows(userId) {
  let nextCursor = undefined;

  while (true) {
    const followersResponse = await twitch(
      `/users/follows?from_id=${userId}&first=100${
        nextCursor ? `&after=${nextCursor}` : ""
      }`
    );

    const {
      data: follows,
      pagination: { cursor },
    } = await followersResponse.json();
    nextCursor = cursor;

    for (index in follows) {
      const { to_id, to_name } = follows[index];
      fs.writeFileSync(`./data/followers/${userId}.txt`, `${to_id}\n`, {
        flag: "a",
      });
      fs.writeFileSync(`./data/channels/${to_id}.txt`, `${to_name}\n`);
    }

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

function twitch(path) {
  return fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
    },
  });
}
