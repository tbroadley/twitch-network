const fs = require("fs");

const login = process.argv[2];

const filenames = fs.readdirSync("./data/channels");
const userId = filenames
  .find(
    (filename) =>
      fs.readFileSync(`./data/channels/${filename}`, "utf8").trim() === login
  )
  .replace(".txt", "");

const followerFilenames = fs.readdirSync("./data/followers");

let followers = [];
for (index in followerFilenames) {
  const filename = followerFilenames[index];
  const splitFile = fs
    .readFileSync(`./data/followers/${filename}`, "utf8")
    .split("\n");
  const followedUserIds = splitFile.slice(2);
  if (!followedUserIds.includes(userId)) continue;

  const followerLogin = splitFile[0].trim();
  followers.push(followerLogin);
}

for (index in followers) {
  console.log(followers[index]);
}
