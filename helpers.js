const getUserIdFromCookie = (request) => {
  return request.session.user_id;
};

const checkUserOwnsURL = (uid, url) => {
  return url && url.uid === uid;
}

const appendHttpToURL = (url) => {
  if (!url.includes('http://')) {
    return "http://" + url;
  }
  return url;
};

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