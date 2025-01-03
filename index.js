const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { default: axios } = require("axios");
dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send(`<h1>Welcome to OAuth API Server.</h1>`);
});

app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;

  res.redirect(githubAuthUrl);
});

app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  console.log(code);
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret_key: process.env.GITHUB_CLIENT_SECRET,
        code,
      }
    );

    const accessToken = tokenResponse.data.access_token;

    res.cookie("accessToken", accessToken);
    return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/github`);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(PORT, () => console.log("Server started at PORT", PORT));
