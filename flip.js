const fs = require("fs");

const filenames = fs.readdirSync("./data-bak/followers");

for (filename of filenames) {
  const userId = filename.replace(/.txt$/, "");
  const followedUserIds = fs
    .readFileSync(`./data-bak/followers/${filename}`, "utf8")
    .trim()
    .split("\n");
  for (followedUserId of followedUserIds) {
    fs.writeFileSync(`./data/channels/${followedUserId}.txt`, `${userId}\n`, {
      flag: "a",
    });
  }
  console.log(`Wrote user IDs for ${userId}`);
}
