import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://chat-rhd-89a61bcf5e5a.herokuapp.com/");

function Chat() {
  const [roomID, setRoomID] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUsername = localStorage.getItem("username");
      setUser(storedUsername);
    }

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="min-h-screen background flex justify-center items-center p-6">
      <div className="flex flex-col bg-gray-800 w-full max-w-lg h-[600px] rounded-xl shadow-lg">
        <h2 className="text-lg w-full p-4 border-b-2 text-gray-200 font-semibold">Chat Room</h2>
        {!inRoom ? (
          <div className="flex flex-col gap-4 p-6">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={joinRoom}
              className="w-full p-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            <div
              id="chat-container"
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900 rounded-lg shadow-inner"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === user ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg shadow-lg ${
                      msg.sender === user
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-700 text-gray-200 self-start"
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-xs mt-1 text-gray-400">
                    {msg.sender}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-4 bg-gray-800">
              <input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="p-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
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