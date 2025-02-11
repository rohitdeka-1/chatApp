"use client"

import { useState, useEffect, useRef } from "react"
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
  const latestMessageRef = useRef(null)
  const messageInputRef = useRef(null)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const storedUsername = localStorage.getItem("username")
      setUser(storedUsername)
    }

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    // Detect keyboard visibility using visual viewport
    const handleVisualViewportResize = () => {
      const isKeyboard = window.visualViewport.height < window.innerHeight * 0.8
      setIsKeyboardOpen(isKeyboard)

      if (isKeyboard && latestMessageRef.current) {
        // Add a small delay to ensure proper scrolling after keyboard opens
        setTimeout(() => {
          latestMessageRef.current.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    }

    window.visualViewport.addEventListener("resize", handleVisualViewportResize)

    return () => {
      socket.off("receive_message")
      window.visualViewport.removeEventListener("resize", handleVisualViewportResize)
    }
  }, [])

  useEffect(() => {
    if (isUserAtBottom && latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isUserAtBottom, latestMessageRef]) // Removed unnecessary dependency: messages

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
      setIsUserAtBottom(isAtBottom)
    }
  }

  const joinRoom = () => {
    if (roomID) {
      socket.emit("join_room", roomID)
      setInRoom(true)

      axios
        .get(`https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/messages/${roomID}`)
        .then((res) => {
          setMessages(res.data)
        })
        .catch((err) => console.error("Error fetching messages:", err))
    }
  }

  const sendMessage = (e) => {
    e.preventDefault() // Prevent form submission
    if (newMessage && roomID) {
      const messageData = {
        room: roomID,
        sender: user,
        message: newMessage,
      }
      socket.emit("message", messageData)
      setNewMessage("")

      // Keep focus on input after sending
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    }
  }

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
            onScroll={handleScroll}
            style={{
              paddingBottom: isKeyboardOpen ? "120px" : "80px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === user ? "items-end" : "items-start"}`}
                ref={index === messages.length - 1 ? latestMessageRef : null}
              >
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

