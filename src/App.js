import './App.css';

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, orderBy, query, addDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

import { useAuthState } from "react-firebase-hooks/auth"
import { useCollectionData } from "react-firebase-hooks/firestore"

import config from './config';
import { useEffect, useRef, useState } from 'react';

const app = initializeApp(config.firebase)

const auth = getAuth(app)
const firestore = getFirestore(app)

function App() {

  const [user] = useAuthState(auth)


  return (
    <div className="App">
      <header>
        <h1>Reyact Chatroom</h1>
        <Logout />
      </header>
      <section> { user ? <Room /> : <Login /> }  </section>
    </div>
  );
}

function Login() {
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
  }

  return (
    <>
      <button onClick={googleSignIn}>Sign in with Google</button>
    </>
  )
}

function Logout() {
  return (
    auth.currentUser &&
    <>
      <button onClick={() => { signOut(auth) }}>Logout</button>
    </>
  )
}

function Room() {
  const msgCollection = collection(firestore, "messages")
  const q = query(msgCollection, orderBy("date"))

  const [messages] = useCollectionData(q) 
  const [myMessage, setMyMessage] = useState("")

  const scrollAnchor = useRef()

  useEffect(() => {
    scrollAnchor.current.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()

    const currentUser = auth.currentUser

    addDoc(msgCollection, {
      text: myMessage,
      date: Date.now(),
      userId: currentUser.uid,
      id: +Date.now()
    })

    setMyMessage("")
  }

  return (
    <>
    <main class="chatroom">
      {messages && messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      <span ref={scrollAnchor}></span>
    </main>

    <form onSubmit={sendMessage}>
      <input 
        value={myMessage} 
        onChange={(e) => setMyMessage(e.target.value)} 
        placeholder='Say hi!'/>
      
      <button type="submit" disabled={!myMessage}>Send!</button>
    </form>
    </>
  )
}

function Message(props) {
  const { text, date, id, userId, avatar } = props.message

  const msgClass = userId === auth.currentUser.uid ? "message--sent" : "message--received"

  return (
    <>
    <div className={`message ${msgClass}`}>
      <img alt="avatar" src={ avatar || "https://avatars.dicebear.com/4.5/api/human/reyact-chat.svg?w=96&h=96" } />
      <p>
        {text}
      </p>
    </div>
    </>
  )
}

export default App;
