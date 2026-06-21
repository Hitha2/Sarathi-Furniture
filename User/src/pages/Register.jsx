import React, { useState } from "react";
import "../styles/Auth.css";
import { showSuccess, showError } from "../utils/toast";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ phone only digits and max 10
    if (name === "phone") {
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length <= 10) {
        setForm({ ...form, phone: onlyNums });
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NAME VALIDATION
   // ✅ PASSWORD VALIDATION
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(form.password)) {
      showError("Password must contain minimum 6 characters, one capital letter and one number");
      return;
    }

    // ✅ EMAIL VALIDATION
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      showError("Enter valid email address");
      return;
    }

    // ✅ PASSWORD LENGTH
    if (form.password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    // ✅ PASSWORD MATCH
    if (form.password !== form.confirmPassword) {
      showError("Passwords do not match ");
      return;
    }

    // ✅ PHONE VALIDATION
    if (!/^[0-9]{10}$/.test(form.phone)) {
      showError("Phone number must be exactly 10 digits");
      return;
    }

    // ✅ ADDRESS VALIDATION
    if (form.address.trim().length < 5) {
      showError("Address is too short");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess(data.message || "Registered Successfully ");

        // localStorage.setItem(
        //   "user",
        //   JSON.stringify({
        //     name: form.name,
        //     email: form.email,
        //     phone: form.phone,
        //   })
        // );

        window.location.href = "/login";
      } else {
        showError(data.message || "Registration Failed");
      }
    } catch (err) {
      showError("Server Error");
    }
  };

  return (
    <div className="authContainer">
      <form className="authBox" onSubmit={handleSubmit}>
        <h2 style={{ fontWeight: "bold" }}>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Enter 10 Digit Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <textarea
          name="address"
          placeholder="Enter Address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;