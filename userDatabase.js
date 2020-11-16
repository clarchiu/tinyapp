const { generateRandomString } = require("./helpers");

const userDatabase = {
  users: {
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
  },
  /**
   * Returns the user with the given uid
   * @param {*} uid 
   */
  getUserById: function(uid) {
    return this.users[uid];
  },
  /**
   * Returns the user with the passed in email or null if no such user exists
   * @param {*} email
   * @param {*} users
   */
  getUserByEmail: function(email) {
    for (const [_, user] of Object.entries(this.users)) {
      if (email === user.email) {
        return user;
      }
    }
    return undefined;
  },
  /**
   * Returns a generated id for a new user
   * Side effect: creates a new user with the new id and given email and password
   * @param {*} email 
   * @param {*} password 
   */
  createNewUser: function(email, password) {
    const id = generateRandomString();
    this.users[id] = {
      id,
      email,
      password,
    };
    return id;
  }
}; 

module.exports = userDatabase;


