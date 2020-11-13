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
  appendHttpToURL, 
  generateRandomString
};