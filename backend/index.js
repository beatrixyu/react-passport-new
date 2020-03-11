
const config      = require("../config.json")
const packageJSON = require("../package.json")
const sanity      = require("./sanity.js")

/*
  Act 1: Setup the Database
*/

const mongoose = require("mongoose");
const { User } = require("./models/User");

const mongoURI =
     process.env.MONGODB_URI
  || config.db
  || "mongodb://localhost/react-passport";

mongoose.Promise = global.Promise; // Use nodejs Promises

mongoose.connect( mongoURI, { useNewUrlParser:true, useUnifiedTopology: true} )
.then( e => {
  console.log(`➤➤➤ 🌎 ${packageJSON.name} ➤➤➤ DB READY`);
  sanity.database();
});

/*
  Act 2: Setup Express
*/

const express     = require("express");
const bodyParser  = require("body-parser");

const app = express();

app.use(bodyParser.json());

/*
  Act 3: Setup Passport
*/

console.log(`➤➤➤ 🌎 ${packageJSON.name} ➤➤➤ PASSPORT`);

const passport = require("passport");
const jwt      = require('jsonwebtoken');

// This adds the passport middleware to express
const passportMiddlewareForExpress = passport.initialize();
app.use( passportMiddlewareForExpress );

// Now we need to feed passport modules for the individual
// authentication providers. We prepared files in the auth/
// directory that contain the things that are special for
// the module. Everything that is being repeated happens below
// inside a forEach loop.

// In [config.json].auth we have an object
// containing config for the auth providers
//   - by using Object.keys(config.auth)
//     => we get an Array ["github","google"]
//   - we can use this array to set up
//     all the auth providers and add them to
//     passport without repeating ourselves all
//     the time.
// DRY - DON'T REPEAT YOURSELF

Object.keys(config.auth)
.forEach( provider => {
  console.log(`  ➤➤➤ ${provider}`);

  // import the strategy
  const strategy = require(`./auth/${provider}`);

  // destructure our blank-fillers for the module
  const { GetProfile, Strategy, Options, AuthOptions } = strategy;

  // create auth middleware for passport.js
  //  - is called when a user was authenticated by the provider
  //  - is supposed to look for existing user or create one
  //  - then call the done function to give passport the user
  // with the modules we imported from  /auth/{provider}

  const middleware = async (accessToken, refreshToken, profile, done) => {

    // unify profile information with the GetProfile function
    profile = GetProfile(profile);

    // check if a User for this Account already exists, if yes we're done here
    const existingUser = await User.findOne({ authId: profile.authId });
    if ( existingUser ) return done( null, existingUser );

    // else create the new user inside our database
    let user = new User({
      accessToken,
      refreshToken,
      password:'$' + provider,
      ...profile
    });
    user = await user.save()
    done( null, user );
  }

  // tell passport to use this strategy
  passport.use(
    provider,
    new Strategy(
      { // configuration Object for the strategy
        //  - contains the clientID and clientSecret from config.auth[provider]
        ...Options,
        ...config.auth[provider],
        callbackURL:`http://localhost:3001/auth/${provider}/callback`
      },
      middleware // provide the middleware function we created above
  ));

  // This route is the starting point of authentication
  //   - when a user goes here he will be redirected to the auth form of the
  //     respective provider, maybe even have to give consent
  app.get( `/auth/${provider}`, passport.authenticate(provider,AuthOptions) );

  // This route is the endpoint of authentication,
  //   - after giving consent on the provider's login page he will be
  //     redirected to here
  //   - we can give him a jwt token and consider the user to be authenticated
  app.get(`/auth/${provider}/callback`,
    passport.authenticate(provider, { failureRedirect: "/login" }),
    (req, res) => {
      const { email, name, id } = req.user;
      const token = jwt.sign({name,email,sub:id}, config.jwtSecret);
      res.redirect(`/success/${token}`);
    }
  );
});

// So finally wen need to give passport a way to get and save users
//  for it's session management, these functions are
//    - serializeUser   - prepare a user to be save inside a session
//    - deserializeUser - read a user from db into session

passport.serializeUser( function (user, done) {
  return done(null, user.authId);
} );

passport.deserializeUser(function (id, done) {
  User.findOne({authId:id}, function (err, user) {
    done(err, user);
  });
});


//add auth/check route using the middleware in auth/check
const checkAuth = require("./auth/check")

/*
  Act 4: Start listening
*/

const PORT = process.env.PORT || config.backendPort || 3001;

app.listen(PORT, function() {
  console.log(`➤➤➤ 🌎 ${packageJSON.name} ➤➤➤ LISTENING ➤➤➤ ${PORT}`);
});
