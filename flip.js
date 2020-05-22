const fs = require("fs");

const loginsByUserId = {};

const filenames = fs.readdirSync("./data/channels");
for (filename of filenames) {
  const userId = filename.replace(/\.txt$/, "");
  const login = fs.readFileSync(`./data/channels/${filename}`, "utf8").trim();
  if (login === "") continue;

  loginsByUserId[userId] = login;
  console.log(`${userId} -> ${login}`);
}

const followerFilenames = fs.readdirSync("./data/followers");
for (filename of followerFilenames) {
  const splitFile = fs
    .readFileSync(`./data/followers/${filename}`, "utf8")
    .trim()
    .split("\n");
  const login = splitFile[0];
  const follows = splitFile.slice(2);

  console.log(`${login} follows ${follows.length} channels`);

  for (follow of follows) {
    const followLogin = loginsByUserId[follow];
    fs.writeFileSync(`./data/channels-by-name/${followLogin}.txt`, login, {
      flag: "a",
    });
  }
}
