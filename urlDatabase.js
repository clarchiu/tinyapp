const { generateRandomString, prependHttpToURL } = require("./helpers");

const urlDatabase = {
  urls: {
    "b2xVn2": {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      uid: "userRandomID"
    },
    "9sm5xK": {
      shortURL: "9sm5xK",
      longURL: "http://www.google.com",
      uid: "user2RandomID"    
    },
  },
  /**
   * Returns the URL object from urlDatabase with given shortURL
   * @param {*} shortURL id of the url object to return
   */
  getURL: function(shortURL) {
    return this.urls[shortURL];
  },
  /**
   * Returns a generated shortURL
   * Side Effect: creates a new URL object in urlDatabase with shortURL mapped to newURL
   * @param {*} uid id of user who created the URL
   * @param {*} newURL the long URL to create a short URL for
   */
  createNewURL: function(uid, newURL) {
    const shortURL = generateRandomString();
    const longURL = prependHttpToURL(newURL);
    this.urls[shortURL] = { shortURL, longURL, uid };
    return shortURL;
  },
  /**
   * Maps short URL to the new longURL 
   * @param {*} shortURL the short URL to edit
   * @param {*} longURL the new long URL to map to
   */
  editURL: function(shortURL, longURL) {
    this.urls[shortURL].longURL = prependHttpToURL(longURL);
  },
  /**
   * Deletes shortURL from urlDatabase
   * @param {*} shortURL the URL to delete
   */
  deleteURL: function(shortURL) {
    delete this.urls[shortURL];
  },
  /**
    * Returns the urls that the user created
    * @param {*} uid user ID
    * @param {*} urlDB  the url database to search
  */
  getURLsForUser: function(uid) {
    let toReturn = {};
    console.log(this.urls);
    for (const [shortURL, url] of Object.entries(this.urls)) {
      if (uid === url.uid) {
        toReturn[shortURL] = url;
      }
    }
    return toReturn;
  },
};

module.exports = urlDatabase;