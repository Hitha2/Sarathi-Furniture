import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const handleVerify = async (e) => {
  e.preventDefault();
  if (!email) return setMessage("Email missing ❌");

  try {
    const res = await fetch("http://localhost:5000/api/users/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("otp", otp); // save OTP for reset
      navigate("/reset-password");
    } else {
      setMessage(data.message);
    }
  } catch (err) {
    setMessage("Server error ❌");
  }
};

  return (
    <div className="authContainer">
      <form className="authBox" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default VerifyOtp;