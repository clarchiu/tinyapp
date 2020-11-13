const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { urlDatabase, users, getUserByEmail, getUrlsForUser } = require("./database");
const { generateRandomString, getUserIdFromCookie, checkUserOwnsURL, appendHttpToURL } = require("./helpers");

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

// --- COMMON PATTERNS REFACTORED OUT ---
const executeIfLoggedIn = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req)
  if (!uid) {
    onFalse(uid);
    return;
  }
  onTrue(uid);
}

const executeIfUserOwnsURL = (req, res, onTrue) => {
  const uid = getUserIdFromCookie(req);
  const short = req.params.shortURL;
  const url = urlDatabase[short];

  if (checkUserOwnsURL(uid, url)) {
    onTrue(short, url, uid);
  } else {
    res.redirect(`/urls/${short}`);
  }
}

// --- GET ROUTES ---
app.get("/", (req, res) => {
  executeIfLoggedIn(req,
    () => res.redirect("/login"), //not logged in
    () => res.redirect("/urls")); //logged in
});

app.get("/register", (req, res) => {
  executeIfLoggedIn(req,
    () => res.render("register"), //not logged in
    () => res.redirect("/urls")); //logged in
});

app.get("/login", (req, res) => {
  executeIfLoggedIn(req,
    () => res.render("login"), //not logged in
    () => res.redirect("/urls")); //logged in
});

// (STRETCH) the date created, number of visits, number of unique visits
app.get("/urls", (req, res) => {
  executeIfLoggedIn(req,
    () => res.render("no_access", { user: null }), //not logged in
    (uid) => { //logged in
      const templateVars = {
        urls: getUrlsForUser(uid),
        user: users[uid],
      };
      res.render("urls_index", templateVars);
    });
});

app.get("/urls/new", (req, res) => {
  executeIfLoggedIn(req,
    () => res.redirect("/login"), //not logged in
    (uid) => res.render("urls_new", { user: users[uid] })); //logged in
});

app.get("/urls/:shortURL", (req, res) => {
  const uid = getUserIdFromCookie(req);
  const user = users[uid];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  
  if (!uid || !checkUserOwnsURL(uid, url)) {
    return res.render("no_access", { user });
  }
  const templateVars = { 
    user,
    shortURL, 
    longURL: url.longURL, 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL]

  if (!url) { // (MINOR) return html instead
    return res.status(404).send("status 404: short url does not exist");
  }
  const longURL = url.longURL;
  res.redirect(longURL);
});

// --- POST ROUTES ---
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("status 400: please enter an email and password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("status 400: email already registered");
  }
  const id = generateRandomString();
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
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
  executeIfLoggedIn(req,
    () => res.redirect('/urls'), //not logged in
    (uid) => { //logged in
      const short = generateRandomString();
      const longURL = appendHttpToURL(req.body.longURL);
      urlDatabase[short] = { longURL, uid };
      res.redirect(`/urls/${short}`);
    });
});

app.post("/urls/:shortURL", (req, res) => {
  executeIfUserOwnsURL(req, res, (short, url) => {
    url.longURL = appendHttpToURL(req.body.longURL);
    res.redirect(`/urls/${short}`);
  });
});

app.post("/urls/:shortURL/delete", (req, res) => {
  executeIfUserOwnsURL(req, res, (short) => {
    delete urlDatabase[short];
    res.redirect("/urls");
  })
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

