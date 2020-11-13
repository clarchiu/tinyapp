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
/**
 * Calls onFalse or onTrue depending on if user is logged in
 * @param {*} req 
 * @param {*} onFalse 
 * @param {*} onTrue 
 */
const executeIfLoggedIn = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req)
  if (!uid) {
    onFalse(uid);
    return;
  }
  onTrue(uid);
}

/**
 * Calls onFalse or onTrue depending on if user owns the url from req
 * @param {*} req 
 * @param {*} onFalse 
 * @param {*} onTrue 
 */
const executeIfUserOwnsURL = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req);
  const user = users[uid];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  if (!checkUserOwnsURL(uid, url)) {
    onFalse(shortURL, url, uid, user)
    return;
  } 
  onTrue(shortURL, url, uid, user);
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
    (uid) => {                                     //logged in
      const templateVars = {
        urls: getUrlsForUser(uid, urlDatabase),
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
  executeIfUserOwnsURL(req, 
    (_, __, _0, user) => res.render("no_access", { user }), //does not own url
    (shortURL, url, _, user) => {                           //owns url
      const templateVars = { 
        user,
        shortURL, 
        longURL: url.longURL, 
      };
      res.render("urls_show", templateVars);
    });
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL]

  if (!url) { // (MINOR) return html instead
    return res.status(404).send("status 404: shortURL url does not exist");
  }
  res.redirect(url.longURL);
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
  users[id] = { 
    id, 
    email, 
    password: bcrypt.hashSync(password, 10) 
  };
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
    (uid) => {                   //logged in
      const shortURL = generateRandomString();
      const longURL = appendHttpToURL(req.body.longURL);
      urlDatabase[shortURL] = { longURL, uid };
      res.redirect(`/urls/${shortURL}`);
    });
});

app.post("/urls/:shortURL", (req, res) => {
  executeIfUserOwnsURL(req, 
    (shortURL) => res.redirect(`/urls/${shortURL}`), //does not own url
    (shortURL, url) => {                             //owns url
      url.longURL = appendHttpToURL(req.body.longURL);
      res.redirect(`/urls/${shortURL}`);
    });
});

app.post("/urls/:shortURL/delete", (req, res) => {
  executeIfUserOwnsURL(req, 
    (shortURL) => res.redirect(`/urls/${shortURL}`), //does not own url
    (shortURL) => {                                  //owns url
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

