import fs from "fs";

const t = fs.readFileSync(".env.vercel.tmp", "utf8");
const m = t.match(/^BLOB_READ_WRITE_TOKEN="?([^"\r\n]+)/m);
if (!m) {
  console.log("NO_BLOB_TOKEN");
  process.exit(1);
}
console.log("BLOB_OK len=" + m[1].length + " prefix=" + m[1].slice(0, 14));
// append to local .env if missing
let env = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "";
if (!/^BLOB_READ_WRITE_TOKEN=/m.test(env)) {
  env += `\nBLOB_READ_WRITE_TOKEN="${m[1]}"\n`;
  fs.writeFileSync(".env", env);
  console.log("APPENDED_TO_ENV");
} else {
  env = env.replace(
    /^BLOB_READ_WRITE_TOKEN=.*$/m,
    `BLOB_READ_WRITE_TOKEN="${m[1]}"`
  );
  fs.writeFileSync(".env", env);
  console.log("UPDATED_ENV");
}
