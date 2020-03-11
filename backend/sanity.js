
/*
  Include some runtime tests to ensure our backend is properly working.
   - This is best practice, especially in regard to Continuous Integration
*/

async function database(){
  // Insert a dummy User and remove it again
  const { User } = require('./models/User');
  const u = new User({
    authId: '@dummyUser1234',
    name: 'test',
    email: 'saldjoj',
    password: 'heya1234'
  });
  await User.findOneAndDelete({
    authId:'@dummyUser1234'
  },{ useFindAndModify:false });
  await u.save()
  await User.findOne({authId:'@dummyUser1234'});
  await User.findOneAndDelete({
    authId:'@dummyUser1234'
  },{ useFindAndModify:false });
}

module.exports = {
  database
}
