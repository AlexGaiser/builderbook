import { Express, Request, Response } from "express";
import Profile from "./models/Profile.model";
import User from "./models/User.model";

const passport = require("passport");
const Strategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("./models/User");

function auth(ROOT_URL: string, server: Express) {
  const verify = async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    verified: Function
  ) => {
    let email;
    let avatarUrl;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace("sz=50", "sz=128");
    }
    try {
      const user: User = await User.signInOrSignUp({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        avatarUrl
      });
      // an example of name not indicating value
      verified(null, user);
    } catch (err) {
      verified(err);
      console.log(err); // eslint-disable-line
    }
  };
  passport.use(
    new Strategy(
      {
        clientID: process.env.Google_clientID,
        clientSecret: process.env.Google_clientSecret,
        callbackURL: `${ROOT_URL}/oauth2callback`
      },
      verify
    )
  );

  passport.serializeUser((user: User, done: Function) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done: Function) => {
    User.findById(id, User.publicFields(), (err, user: User) => {
      done(err, user);
      // eslint-disable-next-line no-console
      console.log("deserializeUser", id);
    });
  });

  server.use(passport.initialize());
  server.use(passport.session());

  server.get("/auth/google", (req: Request, res, next) => {
    const options = {
      scope: ["profile", "email"],
      prompt: "select_account"
    };

    if (
      req.query &&
      req.query.redirectUrl &&
      req.query.redirectUrl.startsWith("/")
    ) {
      req.session.finalUrl = req.query.redirectUrl;
    } else {
      req.session.finalUrl = null;
    }

    passport.authenticate("google", options)(req, res, next);
  });

  server.get(
    "/oauth2callback",
    passport.authenticate("google", {
      failureRedirect: "/login"
    }),
    (req: Request, res) => {
      if (req.user && req.user.isAdmin) {
        res.redirect("/admin");
      } else if (req.session.finalUrl) {
        res.redirect(req.session.finalUrl);
      } else {
        res.redirect("/my-books");
      }
    }
  );

  server.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
  });
}

module.exports = auth;
