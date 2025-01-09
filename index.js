const express = require("express");
const cors = require("cors");
//const dotenv = require("dotenv");
const { default: axios } = require("axios");
require("dotenv").config({ path: ".env" });
const { setSecureCookie } = require("./services/index");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: "*",
  credentials: true,
  openSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`<h1>Welcome to OAuth API Server.</h1>`);
});

// Github Routes
app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;

  console.log("Github auth URL", githubAuthUrl);
  res.redirect(githubAuthUrl);
});

app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Authorization code not provided");

  console.log("temporary code: ", code);
  console.log("Github client id: ", process.env.GITHUB_CLIENT_ID);
  console.log("Github client secret: ", process.env.GITHUB_CLIENT_SECRET);

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    console.log("Access Token: ", accessToken);

    //res.cookie("accessToken", accessToken);
    setSecureCookie(res, accessToken);

    console.log("Frontend url: ", process.env.FRONTEND_URL);

    return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/github`);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Google Routes
app.get("/auth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${PORT}/auth/google/callback&response_type=code&scope=profile email`;

  res.redirect(googleAuthUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Authorization code not provided");

  let accessToken;

  try {
    const tokenResponse = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:${PORT}/auth/google/callback`,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    accessToken = tokenResponse?.data?.access_token;
    setSecureCookie(res, accessToken);
    //res.cookie("access_token", accessToken);
    return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google`);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}`)
);
