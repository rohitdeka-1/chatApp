const messageSchema = mongoose.Schema(
  {
    sender: { type: String, required: true }, 
    message: { type: String, trim: true, required: true },
    room: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;