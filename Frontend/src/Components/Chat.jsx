import { useState, useEffect, useRef, useCallback } from "react"
import io from "socket.io-client"
import axios from "axios"

const socket = io("https://chat-rhd-89a61bcf5e5a.herokuapp.com/")

function Chat() {
  const [roomID, setRoomID] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState("")
  const [inRoom, setInRoom] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const chatContainerRef = useRef(null)
  const messageInputRef = useRef(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // System message
  const systemMessage = {
    sender: "System",
    message:
      "Looking for a secure and reliable chat application? Look no further! My chat app is designed to provide a seamless and private chatting experience. With an intuitive user interface and smooth real-time messaging powered by Socket.io, you can connect with your friends and join chat rooms effortlessly.\n\nSecurity is a top priority! Your passwords are hashed using a one-way hashing technique, ensuring that your sensitive information remains protected. Even if someone gains access to the database, they won’t be able to retrieve your original password. This makes my chat app not only fun but also safe and secure.\n\nInvite your friends to join and experience a modern, privacy-focused chatting platform. Start chatting now and enjoy the convenience of secure communication!",
  }

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const storedUsername = localStorage.getItem("username")
      setUser(storedUsername)
    }

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
      if (shouldAutoScroll) setTimeout(scrollToBottom, 100)
    })

    return () => {
      socket.off("receive_message")
    }
  }, [shouldAutoScroll, scrollToBottom])

  const joinRoom = useCallback(() => {
    if (roomID) {
      socket.emit("join_room", roomID)
      setInRoom(true)

      axios
        .get(`https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/messages/${roomID}`)
        .then((res) => {
          const updatedMessages =
            res.data.length > 0 && res.data[0].message === systemMessage.message
              ? res.data
              : [systemMessage, ...res.data]

          setMessages(updatedMessages)
          setTimeout(scrollToBottom, 100)
        })
        .catch((err) => console.error("Error fetching messages:", err))
    }
  }, [roomID, scrollToBottom, systemMessage])

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault()
      if (newMessage && roomID) {
        const messageData = { room: roomID, sender: user, message: newMessage }
        socket.emit("message", messageData)
        setNewMessage("")
        setShouldAutoScroll(true)

        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }
    },
    [newMessage, roomID, user],
  )

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
          <div className="p-4 text-white font-bold bg-gray-800 border-b border-gray-700">SERVER: {roomID}</div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ paddingBottom: isKeyboardOpen ? "120px" : "80px" }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === user ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-lg ${
                    msg.sender === user ? "bg-blue-500 text-white self-end" : "bg-gray-700 text-gray-200 self-start"
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
                <span className="text-xs mt-1 text-gray-400">{msg.sender}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className={`fixed bottom-0 w-full bg-gray-800 p-4 flex gap-2`}>
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
              className="p-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-green-700 transition-colors"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default Chat