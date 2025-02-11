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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

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
    // Detect keyboard open/close
    const handleResize = () => {
      setIsKeyboardOpen(window.innerHeight < screen.height * 0.75);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Scroll to the latest message only if the user is at the bottom
    if (isUserAtBottom && latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setIsUserAtBottom(isAtBottom);
    }
  };

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
    <div className="flex flex-col h-screen w-full bg-gray-900">
      {!inRoom ? (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h2 className="text-xl text-white font-semibold mb-4">Enter Chat Room</h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            className="w-64 p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            onClick={joinRoom}
            className="w-64 mt-4 p-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-500 transition-colors"
          >
            Join Room
          </button>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="p-4 text-white font-bold bg-gray-800 border-b border-gray-700">
            SERVER: {roomID}
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className={`flex-1 overflow-y-auto p-4 space-y-3 ${isKeyboardOpen ? "pb-16" : ""}`}
            onScroll={handleScroll}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === user ? "items-end" : "items-start"}`}
                ref={index === messages.length - 1 ? latestMessageRef : null} // Latest message reference
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
                <span className="text-xs mt-1 text-gray-400">{msg.sender}</span>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <div
            className={`fixed bottom-0 w-full bg-gray-800 p-4 flex gap-2 transition-all ${
              isKeyboardOpen ? "pb-2" : ""
            }`}
          >
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              onClick={sendMessage}
              className="p-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-green-700 transition-colors"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;