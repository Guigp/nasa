const express = require("express");
const path = require("path");
const cors = require("cors");

const morgan = require("morgan");

const api = require("./routes/api");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

////////////////AUTENTICAÇÂO POR TOKEN///////////////////
const config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/v1/auth/google/callback",
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
};

//função que no fim recebe o token do google
function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log(profile, accessToken);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

////////////////FIM AUTENTICAÇÂO POR TOKEN///////////////////

//////////////// AUTENTICAÇÂO POR COOKIE SESSION///////////////////

//salva a session no cookie para enviar pro client
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//a cada req le o cookie e armazena em req
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

////////////////FIM AUTENTICAÇÂO POR COOKIE SESSION///////////////////

app.use(passport.initialize());
app.use(passport.session()); //passport entende o cookie-session
//app.use(morgan("combined"));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", api);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
