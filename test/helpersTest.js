const { assert } = require('chai');
const { getUserByEmail, getUrlsForUser } = require("../database");

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
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    uid: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    uid: "user2RandomID"    
  },
  "abcdef": {
    longURL: "http://www.tsn.ca",
    uid: "userRandomID"
  },
  "ghijkl": {
    longURL: "http://www.youtube.com",
    uid: "userRandomID"
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedOutput);
  });

  it('should return the user object with the email', function() {
    const user = getUserByEmail("user2@example.com", users)
    const expectedOutput = {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined for an invalid email', function() {
    const user = getUserByEmail("user3@example.com", users)
    assert.isUndefined(user);
  });
});

describe('getUrlsForUser', function() {
  it('should return a list of matching urls for the user', function() {
    const urls = getUrlsForUser('userRandomID', urlDatabase);
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        uid: "userRandomID"
      },
      "abcdef": {
        longURL: "http://www.tsn.ca",
        uid: "userRandomID"
      },
      "ghijkl": {
        longURL: "http://www.youtube.com",
        uid: "userRandomID"
      },
    };
    assert.deepEqual(urls, expected);
  });
  
  it('should return an empty list for nonexistent user', function() {
    const urls = getUrlsForUser('user3RandomID', urlDatabase);
    assert.deepEqual(urls, {});
  })
});