import React from "react"; //import components
import POST from "./post";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import PackageJSON from "../package.json";
import Config from "../config.json";

const appName = PackageJSON.name;
// const providers = Object.keys(Config.auth);
const providers = PackageJSON.authProviders;

//from the application state persepective
//the auth state will be in {auth:{...here...}} because we will be using [combineReducers] in index.js

const defaults = {
  verified: false, //suppose to tell the server the token is ok or not, the auth token was confirmed valid by the srever
  progress: false, //check the token if signedin or signup, the current auth-action
  user: false, // the user information we got from the
  token: false //the JWT token
};

//save and load functions for localStorage, this time we dont wnt to store the whole state, but instead pick the important values
//just save the token and user
const save = state =>
  localStorage.setItem(
    `${appName}-auth`, //github uses the same domain name. so the app name needs to be specific
    JSON.stringify({
      token: state.token,
      user: state.user
    })
  );

//tjs loads out auth state from localstorage
//if localstorage has a record, this will be JSON.parsed
//if not,, "{}" will return an empty object
//for the return the order of ... splashses is important

const load = () => {
  const loaded = JSON.parse(localStorage.getItem(`${appName}-auth`) || "{}");
  return { ...defaults, ...loaded }; //loaded can be empty
};

//
const preloadedState = load();

//the reducer handles all the stateful changes of authentication
//-for auth: login it does the redirect to the backend, this can be done in the action as well
export const authReducer = function(state = preloadedState, action) {
  switch (
    action.type //reducer is a globle action
  ) {
    case "auth:login":
      window.location = `${PackageJSON.backend}:3001/auth/${action.provider}`; //to the router
      break;
    case "auth:logout":
      state = { ...state, user: false, token: false, verified: false };
      break; //to check the user and token when they are failed
    case "auth:check":
      state = { ...state, progress: "checking" };
      break; //progress is to check login or logout
    case "auth:ok":
      state = {
        ...state,
        progress: false,
        token: action.token,
        verified: true
      };
      POST.token = action.token;
      break; //token is the session in the backend to lead the router to the application, when it is successful , it iwll store somewhere in the session
    case "auth:fail":
      state = {
        ...state,
        user: false,
        token: false,
        error: action.error,
        prgress: false,
        verified: false
      };
      POST.token = false;
      break;
    default:
  }
  save(state);
  return state;
};

export const authActions = function(dispatch) {
  return {
    auth: {
      login: async function(provider) {
        dispatch({ ytpe: "auth:login", provider });
      },
      check: async function(token) {
        dispatch({ type: "auth:check", token });
        POST.token = token;
        const result = await POST("/auth/check");
        if (result.success) {
          dispatch({ type: "auth:ok", token });
        } else {
          dispatch({ type: "auth:fail", error: result.message });
        }
      },
      logout: async function() {
        dispatch({ type: "auth:logout" });
      },
      ok: async function(token) {
        dispatch({ type: "auth:ok", token });
      },
      fail: async function(error) {
        dispatch({ type: "auth:fail", error });
      }
    }
  };
};

const AuthSuccess = connect(
  null,
  authActions
)(function AuthSuccess(props) {
  const { auth } = props;
  const token = props.match.params.token;
  auth.ok(token);
  props.history.push("/"); //redirect to the front page
  return null;
});

const checkedForTokenAlready = false;
const AuthCheck = connect(
  null,
  authActions
)(function AuthCheck({ auth }) {
  if (checkedForTokenAlready) return null;
  if (preloadedState.token) auth.check(preloadedState.token);
  checkedForTokenAlready = true;
  return null;
});

export function Auth() {
  return (
    <>
      <AuthCheck></AuthCheck>
      {/* to check if we have token */}
      <Route path="/success/:token" component={AuthSuccess} />
    </>
  );
}

export function AuthLinks() {
  return providers.map(provider => (
    <div>
      <a href={`${PackageJSON.backend}/auth/${provider}`}>
        Login with {provider}
      </a>
    </div>
  ));
}
