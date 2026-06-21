import React, { useState, useEffect } from "react";
import "../styles/Payment.css";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ ADDED
import { showSuccess, showError } from "../utils/toast";

const Payment = () => {
  const [method, setMethod] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const orderData = JSON.parse(localStorage.getItem("orderData"));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!orderData) return <h3>No order data</h3>;

  const totalAmount = orderData.totalAmount;

  const formatPrice = (price) => {
    return Math.round(price).toLocaleString("en-IN");
  };

  // ✅ SAVE ORDER TO DATABASE
  const placeOrderAPI = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await axios.post("http://localhost:5000/api/orders", {
      userId: localStorage.getItem("userId"),
      paymentMethod: method, // ✅ ADD THIS

      items: orderData.items,
      subtotal: orderData.subtotal,
      productSavings: orderData.productSavings,
      shippingCharge: orderData.shippingCharge,
      gstPercent: orderData.gstPercent,
      gstAmount: orderData.gstAmount,
      totalSavings: orderData.totalSavings,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
    });

      console.log("Order Saved:", res.data);

    } catch (err) {
      console.error("Order Failed:", err.response?.data || err.message);
    }
  };

  // ✅ SUCCESS FUNCTION
 const showSuccess = async () => {
  await placeOrderAPI();

  const userId = localStorage.getItem("userId");

  // ✅ FIX: correct key
  localStorage.removeItem(`cart_${userId}`);
  window.dispatchEvent(new Event("cartUpdated"));

  setSuccess(true);

  setTimeout(() => {
    navigate("/orders");
  }, 3000);
};

  // ✅ PLACE ORDER
 const handlePlaceOrder = () => {
  if (!method) {
    showError("Please select a payment method");
    return;
  }

  if (method === "cod") {
    showSuccess();
  }

  if (method === "online") {
    handleRazorpay();
  }
};

  // ✅ RAZORPAY
const handleRazorpay = async () => {
  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/payment/create-order",
      {
        amount: Math.round(totalAmount * 100),
      }
    );

    const orderId = data.id; // ✅ STORE HERE

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: "INR",
      name: "Sarathi Furniture",
      description: "Order Payment",

      order_id: orderId, // ✅ FIXED

      handler: async function (response) {
        try {

          // ✅ VERIFY PAYMENT
          await axios.post("http://localhost:5000/api/payment/verify", {
            razorpay_order_id: orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // ✅ SAVE ORDER
          await axios.post("http://localhost:5000/api/orders", {
            userId: localStorage.getItem("userId"),
            paymentMethod: "online",

            items: orderData.items,
            subtotal: orderData.subtotal,
            productSavings: orderData.productSavings,
            shippingCharge: orderData.shippingCharge,
            gstPercent: orderData.gstPercent,
            gstAmount: orderData.gstAmount,
            totalSavings: orderData.totalSavings,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
          });

          // ✅ REMOVE CART
          const userId = localStorage.getItem("userId");

          localStorage.removeItem(`cart_${userId}`);

          // ✅ REMOVE ORDER DATA
          localStorage.removeItem("orderData");

          // ✅ UPDATE CART COUNT
          window.dispatchEvent(new Event("cartUpdated"));

          // ✅ SUCCESS SCREEN
          setSuccess(true);

          setTimeout(() => {
            navigate("/orders");
          }, 3000);

        } catch (err) {
          console.error(err);
          showError("Payment verification failed");
        }
      },
       theme: { 
        color: "#2f5d5b", 
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    showError("Payment failed to start");
  }
};

// ✅ SUCCESS SCREEN (Meesho style)
if (success) {
  return (
    <div className="pay-success-container">
      <div className="pay-success-card">

        {/* animated circle */}
        <div className="pay-success-icon">
          <div className="checkmark">✓</div>
        </div>

        <h2 className="pay-success-title">Order Placed Successfully</h2>

        <p className="pay-success-text">
          Thank you for shopping with Sarathi Furniture 🎉
        </p>

        <p className="pay-success-subtext">
          Your order will be delivered soon
        </p>

      </div>
    </div>
  );
}

return (
  <>
    <div className="pay-container">
      <div className="pay12-container">

        <h2 className="pay-heading">Select Payment Method</h2>

        {/* ================= DESKTOP ================= */}
        {!isMobile && (
          <>
            <div className="pay-main-card">

              <div
                className={`pay-option ${method === "cod" ? "pay-selected" : ""}`}
                onClick={() => setMethod("cod")}
              >
                <span>Cash on Delivery</span>
                <input type="radio" checked={method === "cod"} readOnly />
              </div>

              <div
                className={`pay-option ${method === "online" ? "pay-selected" : ""}`}
                onClick={() => setMethod("online")}
              >
                <span>Online Payment (UPI / Wallet / Card)</span>
                <input type="radio" checked={method === "online"} readOnly />
              </div>

            </div>

            <div className="pay-bottom">
              <div className="pay-amount-box">
                <p>Total Amount</p>
                <h3>₹{formatPrice(totalAmount)}</h3>
              </div>

              <button className="pay-place-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </>
        )}

        {/* ================= MOBILE ================= */}
        {isMobile && (
          <>
            <div className="pay-main-card">

              <div
                className={`pay-option ${method === "cod" ? "pay-selected" : ""}`}
                onClick={() => setMethod("cod")}
              >
                <span>Cash on Delivery</span>
                <input type="radio" checked={method === "cod"} readOnly />
              </div>

              <div
                className={`pay-option ${method === "online" ? "pay-selected" : ""}`}
                onClick={() => setMethod("online")}
              >
                <span>Online Payment (UPI / Wallet / Card)</span>
                <input type="radio" checked={method === "online"} readOnly />
              </div>

            </div>

            {/* MOBILE FOOTER */}
            <div className="pay-bottom">
              <div className="pay-amount-box">
                <p>Total</p>
                <h3>₹{formatPrice(totalAmount)}</h3>
              </div>

              <button className="pay-place-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  </>
);
};

export default Payment;