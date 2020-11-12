const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { urlDatabase, users, getUserWithEmail } = require("./database");
const { generateRandomString } = require("./generateRandomString");
const PORT = 8080; // default port 8080

const app = express();
app.set("view engine", "ejs");

// --- MIDDLEWARE ---

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// --- GET ROUTES ---

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const templateVars = { 
    shortURL: short,
    longURL: urlDatabase[short].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// --- POST ROUTES ---

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("status 400: please enter an email and password");
  }

  if (getUserWithEmail(email, users)) {
    return res.status(400).send("status 400: email already registered");
  }

  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = getUserWithEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("status 403: no user with that email found");
  }
  if (req.body.password !== user.password) {
    return res.status(403).send("status 403: authentication failed");
  }
  res.cookie('user_id', user.id)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  let longURL = req.body.longURL;
  if (!longURL.includes('http://')) {
    longURL = "http://" + longURL;
  }
  urlDatabase[short] = {
    longURL,  // Log the POST request body to the console
    uid: req.cookies["user_id"],
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  let longURL = req.body.longURL;
  if (!longURL.includes('http://')) {
    longURL = "http://" + longURL;
  }
  urlDatabase[short].longURL = longURL;  // Log the POST request body to the console
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
