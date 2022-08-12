const express = require("express");

const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");
require("dotenv").config();
const passport = require("passport");

const api = express.Router();

function checkLoggedIn(req, res, next) {
  console.log(`Current user is:${req.user}`);
  const isLogged = req.isAuthenticaded(); //vem do passport
  if (!isLogged) {
    return res.status(401).json({
      error: "You must be log in@!",
    });
  }
  next();
}

api.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);
//aqui o passport usa o codigo que o google enviou para mandar outra req pro /token do google e assim recebe de volta o token
api.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true, //para usar cookies
  }),
  (req, res) => {
    console.log("Google called us back!");
  }
);

api.get("/failure", (req, res) => {
  return res.send("Falied to log in!");
});
api.get("/auth/logout", (req, res) => {
  req.logOut(); //vem do passport
  return res.redirect("/");
});
api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
