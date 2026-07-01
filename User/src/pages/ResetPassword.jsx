import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    const savedOtp = localStorage.getItem("otp");
    if (savedOtp) setOtp(savedOtp);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      showError("Passwords do not match ");
      return;
    }

    if (!otp) {
      showError("Please enter the OTP sent to your email ");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://sarathi-furniture.onrender.com/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess("Password reset successful ");

        localStorage.removeItem("otp");
        localStorage.removeItem("resetEmail");

        setTimeout(() => navigate("/login"), 2000);
      } else {
        showError(data.message || "Error resetting password ");
      }
    } catch (err) {
      showError("Server error ");
    }

    setLoading(false);
  };

  return (
    <div className="authContainer">
     

      <form className="authBox" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;