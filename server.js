const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { Issuer, Strategy } = require("openid-client");
const fs = require("fs");
const { ExpressPeerServer } = require("peer");
const path = require("path");
const socketConn = require("./src/libs/socket");
const ChatControllers = require("./src/controllers/ChatControllers");
const RoomControllers = require("./src/controllers/RoomControllers");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);

app.set("view engine", "ejs");

const io = require("socket.io")(server);

const opinions = {
  debug: true,
  port: 3030,
};

const isLoggedIn = (req, res, next) => {
  // console.log(req.session);

  if (!req.user) {
    res.redirect("/");
    return;
  }

  next();
};

// app.use("/peer", ExpressPeerServer(server, opinions));
app.use(express.static("public"));
app.use(express.json({ limit: "100mb" }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

//Helmet midddleware
// app.use(helmet());

//Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

Issuer.discover("http://localhost:4000/oidc").then(function (oidcIssuer) {
  var client = new oidcIssuer.Client({
    client_id: "PlGg3ioi1Talwr5-u_wSD",
    client_secret: "k0jBEDVPwKjP7zVWtmcuNJXSBnzK9_cLzHNzYVTtmIoO1ta3119IsKR8z3ntYgxFUgIx_RA4ebVGh3bf-i04_w",
    grant_types: ["refresh_token", "authorization_code"],
    redirect_uris: ["http://localhost:3030/login/callback"],
    response_types: ["code"],
    post_logout_redirect_uris: ["http://localhost:3030"],
  });

  passport.use(
    "oidc",
    new Strategy({ client, passReqToCallback: true }, (req, tokenSet, userinfo, done) => {
      // console.log("tokenSet", tokenSet);
      // console.log("userinfo", userinfo);

      const result = {
        tokenSet: tokenSet,
        userinfo: userinfo,
        rahasia: client,
      };
      req.session.tokenSet = tokenSet;
      req.session.userinfo = userinfo;
      req.session.rahasia = client;

      return done(null, result);
    })
  );
});

app.get("/login/callback", (req, res, next) => {
  passport.authenticate("oidc", {
    successRedirect: `/home`,
    failureRedirect: "/",
  })(req, res, next);
});

app.get(
  "/",
  (req, res, next) => {
    next();
  },
  passport.authenticate("oidc", { scope: "openid" })
);

app.get("/home", isLoggedIn, (req, res) => {
  // console.log(req.user.userinfo.sub);
  res.render("home", {
    user: req.user.userinfo.sub,
    token: req.user.tokenSet.id_token,
    post_logout: req.user.rahasia.post_logout_redirect_uris,
    allowed: true,
  });
});

app.get("/video/:room", isLoggedIn, (req, res) => {
  // console.log(req.user.userinfo.sub);
  res.render("videoconference", {
    roomId: req.params.room,
    user: req.user.userinfo.sub,
    token: req.user.tokenSet.id_token,
    post_logout: req.user.rahasia.post_logout_redirect_uris,
  });
});

app.get("/walkie-talkie/:room", isLoggedIn, (req, res) => {
  // console.log(req.user.userinfo.sub);
  res.render("walkie-talkie", {
    roomId: req.params.room,
    user: req.user.userinfo.sub,
    token: req.user.tokenSet.id_token,
    post_logout: req.user.rahasia.post_logout_redirect_uris,
  });
});

app.get("/chat/:room", isLoggedIn, (req, res) => {
  // console.log(req.user.userinfo.sub);
  res.render("Chat", {
    roomId: req.params.room,
    user: req.user.userinfo.sub,
    token: req.user.tokenSet.id_token,
    post_logout: req.user.rahasia.post_logout_redirect_uris,
  });
});

// io.set({
//   transports: ["websocket"],
// });

io.on("connection", (socket) => {
  // socketConn(socket, io, fs, path);

  socket.on("sendMessage", (data) => {
    console.log(data);
  });

  socket.emit("test", "halo client");
  console.log("client connected");
});

app.use("/api", ChatControllers);
app.use("/api", RoomControllers);

server.listen(3030, () => {
  console.log("running on port 3030");
});
