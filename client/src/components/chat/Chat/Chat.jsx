import { useEffect, useState, useRef } from "react";
import { messageAPI } from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import "./Chat.css";

const Chat = ({ orderId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await messageAPI.getMessages(orderId);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [orderId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await messageAPI.sendMessage(orderId, text);
      setMessages([...messages, res.data]);
      setText("");
    } catch (err) {
      alert("Не удалось отправить сообщение");
    }
  };

  return (
    <div className="chat">
      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message-item ${msg.senderId?._id === user?.id ? "my-message" : ""}`}
          >
            <div className="message-sender">
              {msg.senderId?.name || "Удаленный пользователь"}
            </div>
            <div className="message-text">{msg.text}</div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default Chat;
