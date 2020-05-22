const fs = require("fs");

const login = process.argv[2];

const filenames = fs.readdirSync("./data/followers");

let follows = undefined;
for (index in filenames) {
  const filename = filenames[index];
  const contents = fs.readFileSync(`./data/followers/${filename}`, "utf8");
  const loginFromFile = contents.split("\n")[0];
  if (loginFromFile !== login) continue;

  follows = contents.replace(login, "").trim().split("\n");
  break;
}

for (index in follows) {
  const channelName = fs
    .readFileSync(`./data/channels/${follows[index]}.txt`, "utf8")
    .trim();
  console.log(channelName);
}
