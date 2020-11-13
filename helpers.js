/**
 * Returns the session cookie from the request object
 * @param {*} request 
 */
const getUserIdFromCookie = (request) => {
  return request.session.user_id;
};

/**
 * Returns true if the user with uid is the owner of url
 * @param {*} uid 
 * @param {*} url 
 */
const checkUserOwnsURL = (uid, url) => {
  return url && url.uid === uid;
}

/**
 * Prepends the 'http://' protocol to url if it doesn't already start with it
 * @param {*} url 
 */
const appendHttpToURL = (url) => {
  const protocol = 'http://';
  if (url.substr(0, protocol.length).toLowerCase() !== protocol)
  {
    return protocol + url;
  }
  return url;
};

/**
 * Generates a random string of 6 characters
 */
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

module.exports = { 
  getUserIdFromCookie, 
  checkUserOwnsURL, 
  appendHttpToURL, 
  generateRandomString
};