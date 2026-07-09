import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Orders.css";

import { showSuccess, showError } from "../utils/toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (value) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const res = await fetch(
          `https://sarathi-furniture.onrender.com/api/orders/user/${userId}`
        );

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.log(err);
        showError("Failed to load orders ");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="loading">Loading orders...</p>;

  return (
    <div className="orders-page">

      {/* HEADER */}
      <div className="orders-header">
        <h2 className="title">My Orders</h2>

        <button
          className="help-btn"
          onClick={() => setShowHelp(true)}
        >
          📞 Help
        </button>
      </div>

      {/* HELP POPUP */}
      {showHelp && (
        <div className="help-popup" onClick={() => setShowHelp(false)}>
          <div className="help-box" onClick={(e) => e.stopPropagation()}>
            <h3>Need Help?</h3>
            <p>📞 +91 9876543210</p>

            <div className="help-actions">
              <a href="tel:+919876543210">
                {/* <button>Call Now</button> */}
              </a>

              <button onClick={() => setShowHelp(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="empty">No orders found 🛒</p>
      ) : (
        <div className="orders-list">

          {[...orders].reverse().map((order) => (
            <div key={order._id} className="order-card">

              {/* ORDER HEADER */}
              <div className="order-header">
                <p>Order #{order._id.slice(-6)}</p>
              </div>

              {/* ORDER ITEMS */}
              {order.items?.map((item, index) => {
                const baseDate = order.createdAt
                  ? new Date(order.createdAt)
                  : new Date();

                const deliveryDate = new Date(baseDate);
                deliveryDate.setDate(baseDate.getDate() + 8);

                return (
                  <div
                    key={index}
                    className="order-row"
                    onClick={() => {
                     showSuccess("Opening Order Details 📦");

                      setTimeout(() => {
                        navigate(
                          `/orders/${order._id}/${
                            item.productId?._id || item.productId
                          }`
                        );
                      }, 500);
                    }}
                  >

                    {/* IMAGE */}
                    <img
                        src={item.image || item.productId?.image}
                        alt={item.name || item.productId?.name}
                        className="order-img"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />

                    {/* INFO */}
                    <div className="order-info">

                      <p className="name">
                        {item.name || item.productId?.name}
                      </p>

                      <span
                        className={`status ${
                          item.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {item.status ?? "Pending"}
                      </span>

                      <p className="delivery">
                        Delivery by{" "}
                        {deliveryDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      <p className="meta">
                        Qty: {item.quantity}
                      </p>

                    </div>

                    <div className="order-right">
                      <span className="arrow">›</span>
                    </div>

                  </div>
                );
              })}

              {/* ✅ FINAL TOTAL (CORRECT) */}
             {/* ✅ TOTAL WITHOUT CANCELLED PRODUCTS */}
                <div className="order-footer">

                  {/* ✅ HIDE TOTAL IF ALL PRODUCTS CANCELLED */}
                {(() => {

                  const activeItems = order.items.filter(
                    (item) => item.status !== "Cancelled"
                  );

                  // ✅ if all cancelled → hide total
                  if (activeItems.length === 0) {
                    return null;
                  }

                  const subtotal = activeItems.reduce((sum, item) => {
                    return sum + (item.price || 0) * item.quantity;
                  }, 0);

                  const gst = subtotal * 0.18;

                  const shipping = order.shippingCharge || 0;

                  const finalTotal =
                    subtotal + gst + shipping;

                  return (
                    <div className="order-footer">
                      Total: ₹{formatPrice(finalTotal)}
                    </div>
                  );

                })()}

                </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Orders;