import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Shirt,
  MapPin,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";
import "./Chat.css";
import API from "../api";

function Chat() {
  const { swapRequestId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [swap, setSwap] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("clothswapToken");
  const currentUser = JSON.parse(
    localStorage.getItem("clothswapUser") || "null"
  );

  useEffect(() => {
    if (!token || !currentUser) {
      navigate("/login");
      return;
    }

    loadChat();
  }, [swapRequestId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError("");

      // Load messages
      const messageResponse = await fetch(
        `${API}/messages/${swapRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const messageData = await messageResponse.json();

      if (!messageResponse.ok) {
        throw new Error(messageData.message);
      }

      setMessages(messageData.messages);

      const readResponse = await fetch(
        `${API}/messages/${swapRequestId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!readResponse.ok) {
        console.error("Unable to mark messages as read");
      }

      // Load swap request
      const swapResponse = await fetch(
        `${API}/swap-requests/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const swapData = await swapResponse.json();

      if (!swapResponse.ok) {
        throw new Error(swapData.message);
      }

      const currentSwap = swapData.requests.find(
        (request) => request._id === swapRequestId
      );

      if (!currentSwap) {
        throw new Error("Swap request not found");
      }

      setSwap(currentSwap);
    } catch (error) {
      console.error("Load chat error:", error);
      setError(error.message || "Unable to load chat.");
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = () => {
    if (!swap || !currentUser) return null;

    if (swap.requester._id === currentUser.id) {
      return swap.receiver;
    }

    return swap.requester;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || sending || !swap) return;

    const otherUser = getOtherUser();

    if (!otherUser) return;

    try {
      setSending(true);

      const response = await fetch(
        `${API}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiver: otherUser._id,
            swapRequest: swapRequestId,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setMessages((current) => [...current, data.data]);
      setMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      alert("Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <Loader2 className="loading-icon" size={32} />
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <div className="error-card">
          <h2>Unable to open chat</h2>
          <p>{error}</p>

          <Link to="/dashboard" className="back-dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <Link to="/dashboard" className="chat-back">
          <ArrowLeft size={19} />
          Dashboard
        </Link>

        <Link to="/marketplace" className="chat-brand">
          <div className="chat-brand-icon">
            <Shirt size={19} />
          </div>

          <span>ClothSwap</span>
        </Link>

        <div className="chat-header-space"></div>
      </header>

      {/* Main */}
      <main className="chat-container">
        {/* Swap information */}
        <section className="swap-chat-card">
          <div className="swap-chat-heading">
            <div>
              <span className="small-label">SWAP NEGOTIATION</span>

              <h1>Chat with {otherUser?.name}</h1>

              <div className="user-location">
                <MapPin size={15} />
                {otherUser?.location || "Location not provided"}
              </div>
            </div>

            <div
              className={`chat-status ${
                swap.status === "accepted"
                  ? "chat-status-accepted"
                  : "chat-status-pending"
              }`}
            >
              {swap.status === "accepted" ? (
                <CheckCircle2 size={15} />
              ) : (
                <Clock3 size={15} />
              )}

              {swap.status}
            </div>
          </div>

          <div className="swap-preview">
            <div className="swap-preview-item">
              <div className="preview-image">
                {swap.offeredItem?.images?.[0] ? (
                  <img
                    src={swap.offeredItem.images[0]}
                    alt={swap.offeredItem.title}
                  />
                ) : (
                  <Shirt size={30} />
                )}
              </div>

              <div>
                <span>You offer</span>
                <strong>{swap.offeredItem?.title}</strong>
                <small>
                  {swap.offeredItem?.brand || "No brand"} ·{" "}
                  {swap.offeredItem?.size}
                </small>
              </div>
            </div>

            <div className="swap-arrow">⇄</div>

            <div className="swap-preview-item">
              <div className="preview-image">
                {swap.requestedItem?.images?.[0] ? (
                  <img
                    src={swap.requestedItem.images[0]}
                    alt={swap.requestedItem.title}
                  />
                ) : (
                  <Shirt size={30} />
                )}
              </div>

              <div>
                <span>You want</span>
                <strong>{swap.requestedItem?.title}</strong>
                <small>
                  {swap.requestedItem?.brand || "No brand"} ·{" "}
                  {swap.requestedItem?.size}
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* Chat */}
        <section className="chat-card">
          <div className="conversation-header">
            <div className="conversation-avatar">
              {otherUser?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{otherUser?.name}</h2>
              <p>Swap conversation</p>
            </div>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">
                  <Send size={22} />
                </div>

                <h3>Start the conversation</h3>

                <p>
                  Discuss the swap, ask questions, and agree on
                  the exchange details.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine =
                  msg.sender?._id === currentUser.id;

                return (
                  <div
                    key={msg._id}
                    className={`message-row ${
                      isMine ? "message-mine" : "message-theirs"
                    }`}
                  >
                    <div className="message-bubble">
                      <p>{msg.message}</p>

                      <span>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={`Message ${otherUser?.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
            />

            <button
              type="submit"
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <Loader2 className="send-loading" size={19} />
              ) : (
                <Send size={19} />
              )}

              <span>Send</span>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Chat;