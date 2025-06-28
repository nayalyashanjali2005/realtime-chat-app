import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socketIo from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../images/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";

let socket;
const ENDPOINT = "http://localhost:5000"; // Change this to your backend server if deployed

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || "Anonymous";

  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);

  const send = () => {
    const message = document.getElementById("chatInput").value;
    if (message.trim() !== "") {
      socket.emit("message", { message });
      document.getElementById("chatInput").value = "";
    }
  };

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });

    socket.on("connect", () => {
      setId(socket.id);
      socket.emit("joined", { user });
    });

    socket.on("welcome", (data) => setMessages((prev) => [...prev, data]));
    socket.on("userJoined", (data) => setMessages((prev) => [...prev, data]));
    socket.on("leave", (data) => setMessages((prev) => [...prev, data]));
    socket.on("sendMessage", (data) => setMessages((prev) => [...prev, data]));

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [user]);

  return (
    <div className="chatPage">
      <div className="chatContainer">
        <div className="header">
          <h2>C CHAT</h2>
          <button onClick={() => navigate("/")}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        <ReactScrollToBottom className="chatBox">
          {messages.map((item, i) => (
            <Message
              key={i}
              user={item.id === id ? '' : item.user}
              message={item.message}
              classs={item.id === id ? 'right' : 'left'}
            />
          ))}
        </ReactScrollToBottom>

        <div className="inputBox">
          <input
            type="text"
            id="chatInput"
            onKeyPress={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
          />
          <button onClick={send} className="sendBtn">
            <img src={sendLogo} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
