const fs = require("fs");
const path = require("path");
const authPath = path.join(
  process.env.APPDATA,
  "com.vercel.cli",
  "Data",
  "auth.json"
);
const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));

const endpoints = [
  "https://api.vercel.com/login/oauth/token",
  "https://api.vercel.com/v2/oauth/access_token",
  "https://vercel.com/api/login/oauth/token",
];

async function tryRefresh(url) {
  const bodies = [
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: auth.refreshToken,
    }).toString(),
    JSON.stringify({
      refreshToken: auth.refreshToken,
      grant_type: "refresh_token",
    }),
  ];
  for (const body of bodies) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": body.startsWith("{")
          ? "application/json"
          : "application/x-www-form-urlencoded",
      },
      body,
    });
    const text = await res.text();
    console.log(url, res.status, text.slice(0, 300));
    if (res.ok) return JSON.parse(text);
  }
  return null;
}

(async () => {
  for (const url of endpoints) {
    try {
      const data = await tryRefresh(url);
      if (data && (data.token || data.access_token)) {
        const token = data.token || data.access_token;
        auth.token = token;
        if (data.refresh_token || data.refreshToken) {
          auth.refreshToken = data.refresh_token || data.refreshToken;
        }
        if (data.expires_in) {
          auth.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
        } else if (data.expiresAt) {
          auth.expiresAt = data.expiresAt;
        }
        fs.writeFileSync(authPath, JSON.stringify(auth, null, 2));
        console.log("UPDATED auth.json");
        process.exit(0);
      }
    } catch (e) {
      console.log("err", url, e.message);
    }
  }
  console.log("Could not refresh");
  process.exit(1);
})();
