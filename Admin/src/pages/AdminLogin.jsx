import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { FiRefreshCw } from "react-icons/fi";
import { showSuccess, showError } from "../utils/toast";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ CAPTCHA validation FIRST
  if (userCaptcha.toLowerCase() !== captcha.toLowerCase()) {
    setError("Invalid CAPTCHA");
    generateCaptcha();
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      showSuccess("Admin Login Successful ");

      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/");
    } else {
      showSuccess(data.message);
      generateCaptcha(); // refresh CAPTCHA on failure
    }

  } catch (err) {
    showError("Server Error");
    generateCaptcha();
  }
};

  const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let newCaptcha = "";

  for (let i = 0; i < 5; i++) {
    newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  setCaptcha(newCaptcha);
  setUserCaptcha("");
};
//auto load captch
useEffect(() => {
  generateCaptcha();
}, []);

  return (
    <div className="authContainer">
      <form className="authBox" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Admin Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <div className="captchaBox">
        <span className="captchaText">{captcha}</span>

        <button type="button" className="refreshBtn" onClick={generateCaptcha}>
            <FiRefreshCw />
        </button>
        </div>

            <input
            type="text"
            placeholder="Enter CAPTCHA"
            value={userCaptcha}
            onChange={(e) => {
                setUserCaptcha(e.target.value);
                setError("");
            }}
            required
            />

            {error && <p className="errorText">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;