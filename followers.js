const fs = require("fs");

const login = process.argv[2];

const filenames = fs.readdirSync("./data/channels");
for (filename of filenames) {
  const splitContents = fs
    .readFileSync(`./data/channels/${filename}`, "utf8")
    .trim()
    .split("\n");
  if (splitContents[0].trim() !== login) continue;

  for (userId of splitContents.slice(1)) {
    console.log(userId);
  }
  break;
}
