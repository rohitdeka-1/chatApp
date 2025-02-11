import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";

const getTokenFromCookies = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

const socket = io("https://chat-rhd-89a61bcf5e5a.herokuapp.com/", {
  auth: { token: getTokenFromCookies() },
});

function Chat() {
  const [roomID, setRoomID] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  const systemMessage = {
    sender: "System",
    message: "Welcome! Your chats are secure and encrypted. Happy chatting!",
  };

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    axios
      .get("/api/auth")
      .then((res) => setUser(res.data.username))
      .catch((err) => console.error("Error fetching user:", err));

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

      axios
        .get(`https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/messages/${roomID}`)
        .then((res) => {
          const updatedMessages =
            res.data.length > 0 && res.data[0].message === systemMessage.message
              ? res.data
              : [systemMessage, ...res.data];

          setMessages(updatedMessages);
          setTimeout(scrollToBottom, 100);
        })
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [roomID, scrollToBottom]);

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (newMessage && roomID) {
        const messageData = { room: roomID, sender: user, message: newMessage };
        socket.emit("message", messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");
        setTimeout(scrollToBottom, 100);

        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }
    },
    [newMessage, roomID, user, scrollToBottom]
  );

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
          {/* Room Info */}
          <div className="p-4 text-white font-bold bg-gray-800 border-b border-gray-700">
            SERVER: {roomID}
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === user ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-lg ${
                    msg.sender === user ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.sender}</p>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="fixed bottom-0 w-full bg-gray-800 p-4 flex gap-2">
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="p-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Chat;
