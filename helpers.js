const getUserLoginCookie = (request) => {
  return request.cookies["user_id"];
};
exports.getUserLoginCookie = getUserLoginCookie;

const appendHttpToURL = (url) => {
  if (!url.includes('http://')) {
    return "http://" + url;
  }
  return url;
};
exports.appendHttpToURL = appendHttpToURL;

function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}
exports.generateRandomString = generateRandomString;