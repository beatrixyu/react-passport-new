
const Options  = {};
const AuthOptions  = {scope:['profile','email','openid']};

const Strategy = require('passport-google-oauth20').Strategy;

const GetProfile = (profile) => ({
  authId:       profile._json.email,
  name:         profile.displayName,
  email:        profile._json.email,
  profileImage: profile._json.picture
});

module.exports = {
  GetProfile,
  Strategy,
  Options,
  AuthOptions
}
