import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://sarathi-furniture.onrender.com/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("resetEmail", email);

        showSuccess("OTP sent successfully! Check your email 📩");

        setTimeout(() => {
          navigate("/verify-otp");
        }, 2000);
      } else {
        showError(data.message || "Failed to send OTP ❌");
      }
    } catch (err) {
      showError("Server error ❌");
    }
  };

  return (
    <div className="authContainer">
     

      <form className="authBox" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send OTP</button>
      </form>
    </div>
  );
};

export default ForgotPassword;