import "./App.css";
import config from "./config";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp(config);

const authentication = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(authentication);

  return (
    <div className="App">
      <header></header>
      <section> {user ? <Room /> : <LogIn />} </section>
    </div>
  );
}

function LogIn() {
  const googleLogIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    authentication.signInWithPopup(provider);
  };

  return (
    <>
      <button className="log-in" onClick={googleLogIn}>
        Sign in using Google
      </button>
    </>
  );
}

function Room() {}

export default App;
