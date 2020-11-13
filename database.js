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

/**
 * Returns the user with the passed in email or null if no such user exists
 * @param {*} email 
 * @param {*} users 
 */
const getUserByEmail = (email, users) => {
  for (const [_, user] of Object.entries(users)) {
    if (email === user.email) {
      return user;
    }
  }
  return undefined;
} 

/**
 * Returns the urls that the user created
 * @param {*} uid 
 */
const getUrlsForUser = (uid, db) => {
  let toReturn = {};
  for (const [short, url] of Object.entries(db)) {
    if (uid === url.uid) {
      toReturn[short] = url;
    }
  }
  return toReturn;
}

module.exports = { urlDatabase, users, getUserByEmail, getUrlsForUser };