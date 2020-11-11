const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") 

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;  // Log the POST request body to the console
  res.redirect(`/urls/${short}`);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const long = urlDatabase[short];
  const templateVars = { shortURL: short, longURL: long, };
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

