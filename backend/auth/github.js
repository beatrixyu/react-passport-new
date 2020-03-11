
const Options  = {};
const AuthOptions  = {};

const Strategy = require('passport-github').Strategy;

const GetProfile = (profile) => ({
  authId:       profile.id + '@github.com',
  email:        profile.username + '@github.com',
  name:         profile.username,
  profileImage: profile._json.avatar_url
});

module.exports = {
  GetProfile,
  Strategy,
  Options,
  AuthOptions
}
