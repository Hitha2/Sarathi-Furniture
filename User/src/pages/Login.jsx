import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import {FcGoogle} from "react-icons/fc";
import {FaGithub} from "react-icons/fa";
import { FaFacebook } from 'react-icons/fa';
import { FiRefreshCw } from "react-icons/fi";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { showSuccess, showError } from "../utils/toast";
import "../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form,setForm]=useState({
    login:"",
    password:""
  });

  const [captcha,setCaptcha]=useState("");
  const [userCaptcha,setUserCaptcha]=useState("");
  const [error, setError] = useState("");

  const generateCaptcha=()=>{
    const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newCaptcha="";
    for(let i=0;i<5;i++){
      newCaptcha+=chars.charAt(Math.floor(Math.random()*chars.length));
    }
    setCaptcha(newCaptcha);
  }

  useEffect(()=>{
    generateCaptcha();
  },[]);

 const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "login") {
    // if starts with number = phone mode
    if (/^\d/.test(value)) {
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length <= 10) {
        setForm({ ...form, login: onlyNums });
      }
      return;
    }
  }

  setForm({ ...form, [name]: value });
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  const loginValue = form.login.trim();

  // ✅ email or phone validation
  const isEmail = /^\S+@\S+\.\S+$/.test(loginValue);
  const isPhone = /^[0-9]{10}$/.test(loginValue);

  if (!isEmail && !isPhone) {
    showError("Enter valid email or 10 digit phone number");
    return;
  }

  // ✅ CAPTCHA validation
  if (userCaptcha !== captcha) {
    setError("Invalid CAPTCHA");
    generateCaptcha();
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: loginValue,
        password: form.password
      }),
    });

    const data = await res.json();

    if (res.ok) {
     showSuccess("Login Successful");

      if (!data.token) {
        showError("Server did not send token");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("userChanged"));

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } else {
      showError(data.message || "Login Failed");
    }
  } catch (err) {
    showError("Server Error ❌ Please try again");
  }
};
  
  const [message, setMessage] = useState("");

  const handleForgotPassword = () => {
  navigate("/forgot-password");
};

  const handleGoogleLogin = () => {
  window.location.href = "http://localhost:5000/api/auth/google";
};



  return (
    <>
    
    <div className='authContainer'>
      <form className='authBox' onSubmit={handleSubmit}>
        <h2 style={{fontWeight:"bold"}}>Login</h2>

       <input
          type="text"
          name="login"
          placeholder="Enter Email or Phone Number"
          value={form.login}
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

        <p className="forgotText" onClick={handleForgotPassword}>
          Forgot Password?
        </p>

        {message && <p className="infoText">{message}</p>}

        <div className='captchaBox'>
          <span className='captchaText'>{captcha}</span>

          <button
            type="button"
            className="refreshBtn"
            onClick={generateCaptcha}
          >
            <FiRefreshCw />
          </button>
        </div>
         <input
          type="text"
          placeholder="Enter CAPTCHA"
          value={userCaptcha}
          onChange={(e) =>{ setUserCaptcha(e.target.value);setError("");}}
          className="captchaInput"
          required
        />
        {error && <p className="errorText">{error}</p>}

        <button type="submit">Login</button>

        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>

        <div className='divider'>
        <span>OR Sign in with</span>
        </div>
        <div className="socialLogin">
          
          <button type="button" className="socialBtn googleBtn" onClick={handleGoogleLogin}>
            <FcGoogle style={{fontSize:"24px"}} />
          </button>

          {/* <button type="button" className="socialBtn githubBtn" onClick={handleGithubLogin}>
            <FaGithub style={{fontSize:"24px"}} />
          </button> */}

          {/* <button type="button" className="socialBtn facebookBtn" onClick={handleFacebookLogin}>
            <FaFacebook style={{fontSize:"24px"}}/>
          </button> */}
        </div>
      </form>
    </div>
    </>
  )
}

export default Login