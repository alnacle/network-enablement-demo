const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

require('dotenv').config()

// Auth URIs
const oidc_auth_uri = 'https://oidc.idp.vonage.com/oauth2/auth';
const camara_auth_uri = 'https://api-eu-3.vonage.com/oauth2/token';

// Number Verification API
const nv_uri = 'https://api-eu.vonage.com/camara/number-verification/v031/verify';

// Network Enablement API
const ne_uri = 'https://api-eu.vonage.com/v0.1/network-enablement'

// load config from .env file
const jwt = process.env.JWT;
const redirect_uri = process.env.REDIRECT_URI;

let phoneNumber ='';

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var app = express();

app.use(cors());

app.get('/login', async function(req, res) {
  phoneNumber = req.query.phone || null;

  const data = {
    phone_number: phoneNumber,
    scopes: ["dpv:FraudPreventionAndDetection#number-verification-verify-read"],
    state: generateRandomString(20) 
  }

  const headers = {
    'Authorization': 'Bearer ' + jwt,
    'Content-Type': 'application/json'
  }

  try {
    const response = await axios.post(ne_uri, JSON.stringify(data), { headers: headers });
    res.json(response.data)
  } catch (error) {
    console.error(error);
    return;
  }

})

app.get('/callback', async function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (!code || state === null) {
    const error = req.query.error_description || null;
    res.render('error', {error: error});
  } else {

    try {
      const data = {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + jwt
      }

      const response = await axios.post(camara_auth_uri, data, { headers: headers });
      access_token = response.data.access_token;

    } catch (error) {
      console.error(error);
      return;
    }

    // Number Verification API call
    try {
      const data = JSON.stringify({ phoneNumber: phoneNumber });

      const headers = { 
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + access_token 
      }

      const response = await axios.post(nv_uri, data, { headers: headers });
      res.json(response.data);

    } catch (error) {
      console.error(error);
    }

  }
});

console.log('Listening on 3000');
app.listen(3000);
