import "./App.css";
import config from "./config";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp(config.firebase);

const authentication = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(authentication);

  return (
    <div className="App">
      <header>
        <h1>Reyact Chatroom</h1>
        <LogOut />
      </header>
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

function LogOut() {
  return (
    authentication.currentUser && (
      <button className="log-out" onClick={() => authentication.signOut()}>
        Logout
      </button>
    )
  );
}

function Room() {
  const messagesCollection = firestore.collection("messages");
  const query = messagesCollection.orderBy("date").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [message, setMessage] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const currentUser = authentication.currentUser;

    await messagesCollection.add({
      text: message,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      userId: currentUser.uid,
    });

    setMessage("");
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say hi!"
        />

        <button type="submit" disabled={!message}>
          Send
        </button>
      </form>
    </>
  );
}

function Message(props) {
  const { text, userId } = props.message;

  const messageClass =
    userId === authentication.currentUser.uid
      ? "message--sent"
      : "message--received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
