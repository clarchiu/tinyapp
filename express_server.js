const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { urlDatabase, users, getUserWithEmail, getUrlsForUser } = require("./database");
const { generateRandomString, getUserLoginCookie, appendHttpToURL } = require("./helpers");

const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs");

// --- MIDDLEWARE ---
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['abc', 'def'],
}));

// --- GET ROUTES ---
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (getUserLoginCookie(req)) {
    return res.redirect("/urls");
  }
  res.render("register");
});

app.get("/login", (req, res) => {
  if (getUserLoginCookie(req)) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.get("/urls", (req, res) => {
  const loginCookie = getUserLoginCookie(req);
  const templateVars = {
    urls: getUrlsForUser(loginCookie),
    user: users[loginCookie],
  };
  if (!loginCookie) {
    return res.render("no_access", templateVars);
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const loginCookie = getUserLoginCookie(req);
  if (!loginCookie) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[loginCookie],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const loginCookie = getUserLoginCookie(req);
  const short = req.params.shortURL;
  const templateVars = {
    shortURL: short,
    longURL: urlDatabase[short].longURL,
    user: users[loginCookie],
  };
  if (!loginCookie || urlDatabase[short].uid !== loginCookie) {
    return res.render("no_access", templateVars);
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// --- POST ROUTES ---
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res.status(400).send("status 400: please enter an email and password");
  }

  if (getUserWithEmail(email, users)) {
    return res.status(400).send("status 400: email already registered");
  }

  const id = generateRandomString();
  users[id] = { id, email, password };
  console.log(users);
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = getUserWithEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("status 403: no user with that email found");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("status 403: authentication failed");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  const longURL = appendHttpToURL(req.body.longURL);
  urlDatabase[short] = {
    longURL,
    uid: getUserLoginCookie(req),
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const url = urlDatabase[short];
  if (url && url.uid === getUserLoginCookie(req)) {
    const longURL = appendHttpToURL(req.body.longURL);
    url.longURL = longURL;
  }
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const short = req.params.shortURL;
  const url = urlDatabase[short];
  if (!url || url.uid !== getUserLoginCookie(req)) {
    return res.redirect(`/urls/${short}`);
  }
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

