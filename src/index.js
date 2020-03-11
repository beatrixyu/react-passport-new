import * as serviceWorker from "./serviceWorker";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import { Auth, authReducer } from "./lib/auth";
import { createStore, combineReducers } from "redux";
import App from "./App";

const store = createStore(
  combineReducers({
    auth: authReducer
  })
);
function AuthSuccess(props) {
  window.token = props.match.params.token;
  props.history.push("/");
  return null;
}

ReactDOM.render(
  <BrowserRouter>
    <Auth />
    <App />
    <Route path="/success/:token" component={AuthSuccess} />
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.register();
