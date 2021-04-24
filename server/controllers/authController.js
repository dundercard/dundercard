const fetch = require('node-fetch');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:8080/login/route/'; // development
// const redirect_uri = 'http://localhost:3001/login/route/'; // production
const authController = {};

authController.spotifyLogin = (req, res, next) => {
  console.log('spotifyLogin fired...');
  var scopes = 'playlist-modify-public playlist-modify-private';

  return res.redirect(
    'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' +
      client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' +
      encodeURIComponent(redirect_uri)
  );
};

authController.setAuthCookie = (req, res, next) => {
  console.log('setAuthCookie fired...');
  // CHANGE TO SITE VERIFIED COOKIE
  res.cookie('9HWmQ0ME', req.query.code, {
    maxAge: 30 * 60 * 1000, // 30 Minutes
  });
  res.locals.auth = req.query.code;
  return next();
};

authController.setAccessCookies = (req, res, next) => {
  console.log('setAccessCookies fired...');
  // WE NEED TO SAVE THESE IN DB
  res.cookie('WHxyM9l1', res.locals.access, {
    maxAge: 30 * 60 * 1000, // 30 Minutes
  });
  // WE NEED TO SAVE THESE IN DB
  res.cookie('CH43aEwg', res.locals.refresh, {
    maxAge: 30 * 60 * 1000, // 30 Minutes
  });

  return next();
};

authController.getToken = (req, res, next) => {
  console.log('getToken fired...');

  // formatting fetch request to spotify authorization
  const payload = {
    grant_type: 'authorization_code',
    code: res.locals.auth,
    redirect_uri,
  };

  let formBody = [];
  for (let property in payload) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(payload[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');

  const clientCreds = Buffer.from(`${client_id}:${client_secret}`).toString(
    'base64'
  );
  // end of formatting

  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Basic ${clientCreds}`,
    },
    body: formBody,
  })
    .then((res) => {
      if (res.status >= 400)
        return next({
          log: `Error in getToken middleware: ${res.status}: ${res.statusText}`,
          message: { err: 'An error occurred' },
        });
      return res.json();
    })
    .then((data) => {
      res.locals.access = data.access_token; // TOKENS TO SAVE
      res.locals.refresh = data.refresh_token; // TOKENS TO SAVE
      return next();
    })
    .catch((err) => {
      return next({
        log: `Error in getToken:fetch middleware: ${err}`,
        message: { err: 'An error occurred' },
      });
    });
};

/*
  //Login:
    //Check for cookie userId
      //If userId doesn't exist
        //Redirect to OAuth
        //Receive authentication code and save to res.locals
        //Trade auth code for access token & refresh token -> save to res.locals
        //Query the spotify API for spotify's userID -> save to res.locals
          //checks if spotUserId is in DB
            //true- 
              // upsert auth token and refresh token
              // save spotUserId to cookie - 30 days
              // redirect /
            //false-
              // INSERT an entry() in DB users
                  1. Save spotUserId 
                  2. Save the access token 
                  3. Save the refresh token
                  
              // set spotUserId to cookie - 30 days
              // redirect /

      // If spotUserId does exist on cookie
        // send refresh token
        // update access token in db
*/

module.exports = authController;
