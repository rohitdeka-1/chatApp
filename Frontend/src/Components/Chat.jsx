import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";

const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

const socket = io("https://chat-rhd-89a61bcf5e5a.herokuapp.com/", {
  auth: { token },
});

function Chat() {
  const [roomID, setRoomID] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    axios.get("/api/auth").then((res) => setUser(res.data.username));

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [scrollToBottom]);

  const joinRoom = useCallback(() => {
    if (roomID) {
      socket.emit("join_room", roomID);
      setInRoom(true);

      axios.get(`/api/messages/${roomID}`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [roomID]);

  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (newMessage && roomID) {
      socket.emit("message", { room: roomID, message: newMessage });
      setNewMessage("");
    }
  }, [newMessage, roomID]);

  return (
    <div className="chat-container">
      {!inRoom ? (
        <div>
          <input type="text" placeholder="Enter Room ID" value={roomID} onChange={(e) => setRoomID(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <div>{roomID}</div>
          <div ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === user ? "my-message" : "other-message"}>
                <span>{msg.sender}: {msg.message}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
}

export default Chat;