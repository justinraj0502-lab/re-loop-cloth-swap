import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import "./RequestSwap.css";

function RequestSwap() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requestedItem, setRequestedItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("clothswapToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Get requested clothing
        const itemResponse = await fetch(
          `http://localhost:5000/api/clothing/${id}`
        );

        const itemData = await itemResponse.json();

        if (!itemResponse.ok) {
          alert(itemData.message);
          navigate("/marketplace");
          return;
        }

        setRequestedItem(itemData.clothing);

        // Get all available clothing
        const clothingResponse = await fetch(
          "http://localhost:5000/api/clothing"
        );

        const clothingData = await clothingResponse.json();

        if (!clothingResponse.ok) {
          alert(clothingData.message);
          return;
        }

        const user = JSON.parse(
          localStorage.getItem("clothswapUser")
        );

        const ownItems = clothingData.clothing.filter(
          (item) =>
            item.owner._id === user.id &&
            item._id !== id &&
            item.status === "available"
        );

        setMyItems(ownItems);
      } catch (error) {
        console.error("Load swap data error:", error);
        alert("Unable to load swap information.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, token]);

  const selectedOffer = myItems.find(
  (item) => item._id === selectedItem
);

const requestedValue = requestedItem?.swapValue || 0;
const offeredValue = selectedOffer?.swapValue || 0;
const valueDifference = offeredValue - requestedValue;

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedItem) {
    alert("Please select a clothing item to offer.");
    return;
  }

  if (!requestedItem) {
    alert("Requested item is unavailable.");
    return;
  }

  if (requestedItem.status !== "available") {
    alert("Sorry, this clothing item is no longer available.");
    return;
  }

  const selectedOffer = myItems.find(
    (item) => item._id === selectedItem
  );

  if (!selectedOffer) {
    alert("The selected clothing item is no longer available.");
    return;
  }

  if (selectedOffer.status !== "available") {
    alert("Your selected clothing item is no longer available.");
    return;
  }

  if (selectedOffer._id === requestedItem._id) {
    alert("You cannot offer the same item you are requesting.");
    return;
  }

  setSending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/swap-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            offeredItem: selectedItem,
            requestedItem: id,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Swap request sent successfully! 🔄🎉");

      navigate("/dashboard");
    } catch (error) {
      console.error("Send swap request error:", error);
      alert("Unable to send swap request.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="swap-loading">
        <p>Loading swap options...</p>
      </div>
    );
  }

  if (!requestedItem) {
    return null;
  }

  return (
    <div className="swap-page">

      <header className="swap-header">
        <button
          className="swap-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="swap-brand">
          <span>♻</span>
          ClothSwap
        </div>
      </header>

      <main className="swap-container">

        <div className="swap-heading">
          <span>MAKE A SWAP</span>

          <h1>
            Trade your style.
            <br />
            <em>Discover theirs.</em>
          </h1>

          <p>
            Choose one of your available items to offer
            in exchange for this piece.
          </p>
        </div>

        <div className="swap-grid">

          {/* REQUESTED ITEM */}
          <section className="swap-card">

            <div className="swap-card-label">
              YOU WANT
            </div>

            <div className="swap-item-image">
              {requestedItem.images?.[0] ? (
                <img
                  src={requestedItem.images[0]}
                  alt={requestedItem.title}
                />
              ) : (
                <div className="no-image">♻</div>
              )}
            </div>

            <h2>{requestedItem.title}</h2>

            <p>
              {requestedItem.brand || "No brand"} ·{" "}
              {requestedItem.size}
            </p>

            <strong>
              ₹{requestedItem.swapValue || 0}
            </strong>
          </section>

          {/* SWAP FORM */}
          <section className="swap-form-card">

            <div className="swap-arrow">
              <ArrowRight size={28} />
            </div>

            <div className="swap-card-label">
              YOU OFFER
            </div>

            <form onSubmit={handleSubmit}>

              {myItems.length === 0 ? (
                <div className="no-items">
                  <h3>No available items</h3>
                  <p>
                    You need at least one available
                    clothing item to make a swap.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/create-listing")}
                  >
                    List a clothing item
                  </button>
                </div>
              ) : (
                <>
                  <div className="offer-items">

                    {myItems.map((item) => (
                      <label
                        key={item._id}
                        className={`offer-item ${
                          selectedItem === item._id
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="offeredItem"
                          value={item._id}
                          checked={selectedItem === item._id}
                          onChange={(e) =>
                            setSelectedItem(e.target.value)
                          }
                        />

                        <div className="offer-image">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                            />
                          ) : (
                            <span>♻</span>
                          )}
                        </div>

                        <div className="offer-info">
                          <h3>{item.title}</h3>
                          <p>
                            {item.brand || "No brand"} ·{" "}
                            {item.size}
                          </p>
                          <strong>
                            ₹{item.swapValue || 0}
                          </strong>
                        </div>
                      </label>
                    ))}

                  </div>

                  {selectedOffer && (
                    <div className="swap-value-comparison">
                      <div className="value-comparison-header">
                        <div>
                          <span>SWAP VALUE</span>
                          <strong>₹{offeredValue}</strong>
                        </div>

                        <ArrowRight size={18} />

                        <div>
                          <span>REQUESTED</span>
                          <strong>₹{requestedValue}</strong>
                        </div>
                      </div>

                      <div
                        className={`value-difference ${
                          valueDifference === 0
                            ? "balanced"
                            : valueDifference > 0
                            ? "higher"
                            : "lower"
                        }`}
                      >
                        {valueDifference === 0 ? (
                          <>
                            <CheckCircle2 size={15} />
                            Similar estimated value
                          </>
                        ) : valueDifference > 0 ? (
                          <>
                            <Sparkles size={15} />
                            Your offer is ₹{valueDifference} higher
                          </>
                        ) : (
                          <>
                            <Sparkles size={15} />
                            Your offer is ₹{Math.abs(valueDifference)} lower
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="message-group">
                    <label>Message to owner</label>

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      placeholder="Write a message about your swap..."
                      maxLength={500}
                    />
                  </div>

                  <button
                    type="submit"
                    className="send-swap-btn"
                    disabled={sending}
                  >
                    <Send size={18} />

                    {sending
                      ? "Sending..."
                      : "Send Swap Request"}
                  </button>
                </>
              )}

            </form>
          </section>

        </div>

        <div className="swap-note">
          🔒 Keep conversations respectful and never
          share sensitive personal information.
        </div>

      </main>
    </div>
  );
}

export default RequestSwap;