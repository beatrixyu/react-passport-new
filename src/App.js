import React from 'react';

function App() {
  return (
  <div className="App">
    {window.token || 'not authenticated'}<br/>
    <a href="http://localhost:3001/auth/github">Login with github</a><br/>
    <a href="http://localhost:3001/auth/google">Login with google</a>
  </div> );
}

export default App;
