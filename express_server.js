const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const urlDB = require("./urlDatabase");
const userDB = require("./userDatabase");

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
 * Returns the session cookie from the request object
 * @param {*} req request object
 */
const getUserIdFromCookie = (req) => {
  return req.session.userId;
};

/**
 * Calls onFalse or onTrue depending on if user is logged in
 * @param {*} req     request object
 * @param {*} onFalse callback to execute if user is not logged in
 * @param {*} onTrue  callback to execute if user is logged in
 */
const checkUserLoggedIn = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req);
  const user = userDB.getUserById(uid);
  if (!uid || !user) {
    onFalse(uid, user);
    return;
  }
  onTrue(uid, user);
};

/**
 * Calls onFalse or onTrue depending on if user owns the url from req
 * @param {*} req     request object
 * @param {*} onFalse callback to execute if user does not own URL
 * @param {*} onTrue  callback to execute if user owns URL
 */
const checkUserOwnsURL = (req, onFalse, onTrue) => {
  const uid = getUserIdFromCookie(req);
  const user = userDB.getUserById(uid);
  const shortURL = req.params.shortURL;
  const url = urlDB.getURL(shortURL);

  if (!uid || !user || !url || url.uid !== uid) {
    onFalse(shortURL, url, user, uid);
    return;
  }
  onTrue(shortURL, url, user, uid);
};

// --- GET ROUTES ---
app.get("/", (req, res) => {
  checkUserLoggedIn(req,
    () => res.redirect("/login"), //not logged in
    () => res.redirect("/urls")); //logged in
});

app.get("/register", (req, res) => {
  checkUserLoggedIn(req,
    () => res.render("register"), //not logged in
    () => res.redirect("/urls")); //logged in
});

app.get("/login", (req, res) => {
  checkUserLoggedIn(req,
    () => res.render("login"), //not logged in
    () => res.redirect("/urls")); //logged in
});

// (STRETCH) the date created, number of visits, number of unique visits
app.get("/urls", (req, res) => {
  checkUserLoggedIn(req,
    (_, user) => res.render("no_access", { user }), //not logged in
    (uid, user) => {                         //logged in
      const urls = urlDB.getURLsForUser(uid);
      res.render("urls_index", { user, urls });
    });
});

app.get("/urls/new", (req, res) => {
  checkUserLoggedIn(req,
    () => res.redirect("/login"), //not logged in
    (_, user) => res.render("urls_new", { user })); //logged in
});

app.get("/urls/:shortURL", (req, res) => {
  checkUserOwnsURL(req,
    (_, __, user) => res.render("no_access", { user }), //does not own url
    (shortURL, url, user) => {
      const longURL = url.longURL;
      res.render("urls_show", { user, shortURL, longURL })
    });
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDB.getURL(req.params.shortURL);

  if (!url) { // (MINOR) return html instead
    return res.status(404).send("status 404: shortURL url does not exist");
  }
  res.redirect(url.longURL);
});

// --- POST ROUTES ---
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) { // (MINOR) return html instead
    return res.status(400).send("status 400: please enter an email and password");
  }
  try {
    const id = userDB.createNewUser(email, bcrypt.hashSync(password, 10));
    req.session.userId = id;  // set session cookie
    res.redirect("/urls");
  } catch (error) {
    return res.status(400).send("status 400: email already registered");
  }
});

app.post("/login", (req, res) => {
  const user = userDB.getUserByEmail(req.body.email);
  
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) { // (MINOR) return html instead
    return res.status(403).send("status 403: authentication failed");
  }
  req.session.userId = user.id; // set session cookie
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  checkUserLoggedIn(req,
    () => res.redirect('/urls'), //not logged in
    (uid) => {                   //logged in
      const shortURL = urlDB.createNewURL(uid, req.body.longURL);
      res.redirect(`/urls/${shortURL}`);
    });
});

app.post("/urls/:shortURL", (req, res) => {
  checkUserOwnsURL(req,
    (shortURL) => res.redirect(`/urls/${shortURL}`), //does not own url
    (shortURL) => {    //owns url
      urlDB.editURL(shortURL, req.body.longURL);                        
      res.redirect(`/urls/${shortURL}`);
    });
});

app.post("/urls/:shortURL/delete", (req, res) => {
  checkUserOwnsURL(req,
    (shortURL) => res.redirect(`/urls/${shortURL}`), //does not own url
    (shortURL) => {                                  //owns url
      urlDB.deleteURL(shortURL);
      res.redirect("/urls");
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

