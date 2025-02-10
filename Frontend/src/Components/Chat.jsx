import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://chat-rhd-89a61bcf5e5a.herokuapp.com/");

function Chat() {
  const [roomID, setRoomID] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser("User" + Math.floor(Math.random() * 1000));
    }

    // Listen for new messages
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const joinRoom = () => {
    if (roomID) {
      socket.emit("join_room", roomID);
      setInRoom(true);

      axios
        .get(`https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/messages/${roomID}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => console.error("Error fetching messages:", err));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (newMessage && roomID) {
      const messageData = {
        room: roomID,
        sender: user,
        message: newMessage,
      };
      socket.emit("message", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen background flex justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col text-white font-bold text-xl bg-slate-600 w-full max-w-lg h-[550px] m-auto p-4 sm:p-6 rounded-xl">
        <h2 className="text-lg w-full border-b-2 mb-4">Chat Room</h2>
        {!inRoom ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="input input-bordered text-white p-2 rounded-lg"
            />
            <button
              onClick={joinRoom}
              className="btn btn-primary bg-blue-600 text-white p-3 rounded-lg"
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            <div
              id="chat-container"
              className="flex-1 overflow-y-auto mb-4 max-h-[400px] bg-gray-700 p-2 rounded-lg"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === user ? "text-right" : "text-left"
                  } flex flex-col`}
                >
                  <span
                    className={`text-sm p-2 leading-3 rounded-lg ${
                      msg.sender === user
                        ? "bg-[#7d59b6] text-white"
                        : "bg-[#3cf63c88] text-white"
                    }`}
                  >
                    {msg.message}
                  </span>
                  <span className="font-bold text-xs text-gray-300 mt-1">
                    {msg.sender}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input input-bordered flex-1 text-white p-2 rounded-lg"
              />
              <button
                onClick={sendMessage}
                className="btn btn-primary bg-blue-600 text-white p-3 rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
