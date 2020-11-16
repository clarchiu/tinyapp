/**
 * Prepends the 'http://' protocol to url if it doesn't already start with it
 * @param {*} url 
 */
const prependHttpToURL = (url) => {
  const httpPrefix = 'http://';
  const httpsPrefix = 'https://';
  if (
    url.substr(0, httpPrefix.length).toLowerCase() !== httpPrefix
    || url.substr(0, httpsPrefix.length).toLowerCase() !== httpsPrefix)
  {
    return httpPrefix + url;
  }
  return url;
};

/**
 * Returns a random string of 6 characters
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
  prependHttpToURL, 
  generateRandomString
};