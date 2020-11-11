const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { urlDatabase, users } = require("./database");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let uid = generateRandomString();
  users[uid] = { id: uid, ...req.body}
  res.cookie('user_id', uid);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  if (!long.includes('http://')) {
    long = "http://" + long;
  }
  urlDatabase[short] = long;  // Log the POST request body to the console
  res.redirect(`/urls/${short}`);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const templateVars = { 
    shortURL: short,
    longURL: urlDatabase[short], 
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  let long = req.body.longURL;
  if (!long.includes('http://')) {
    long = "http://" + long;
  }
  urlDatabase[short] = long;  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

function generateRandomString() {
  let randomString = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++ ) {
     randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

