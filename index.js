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
  await paginate(
    `/users/follows?to_id=${userId}&first=100`,
    ({ from_id, from_name }) => {
      fs.writeFileSync(`./data/followers/${from_id}.txt`, `${from_name}\n\n`);
    }
  );
}

async function fetchFollows(userId) {
  await paginate(
    `/users/follows?from_id=${userId}&first=100`,
    ({ to_id, to_name }) => {
      fs.writeFileSync(`./data/followers/${userId}.txt`, `${to_id}\n`, {
        flag: "a",
      });
      fs.writeFileSync(`./data/channels/${to_id}.txt`, `${to_name}\n`);
    }
  );
}

async function paginate(path, action) {
  let nextCursor = undefined;

  while (true) {
    const response = await twitch(
      `${path}${nextCursor ? `&after=${nextCursor}` : ""}`
    );

    const {
      data,
      pagination: { cursor },
    } = await response.json();
    nextCursor = cursor;

    for (index in data) {
      await action(data[index]);
    }

    if (nextCursor === undefined) break;

    const rateLimitRemaining = response.headers.get("ratelimit-remaining");
    if (rateLimitRemaining <= 0) {
      const sleepUntilRateLimitReset =
        response.headers.get("ratelimit-reset") * 1000 - Date.now();
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
