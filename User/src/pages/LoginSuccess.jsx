import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const userId = params.get("userId");
    const name = params.get("name");
    const email = params.get("email");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: userId,
          name: name ? name.trim() : "",
          email: email ? email.trim() : "",
        })
      );

      window.dispatchEvent(new Event("userChanged"));

      navigate("/");
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>Logging in...</div>;
};

export default LoginSuccess;