const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    uid: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    uid: "user2RandomID"    
  },
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
}

const getUserWithEmail = (email, users) => {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return null;
} 

module.exports = { urlDatabase, users, getUserWithEmail };