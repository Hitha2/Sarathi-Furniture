import React, { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaUserCircle,
  FaHome,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/AdminHeader.css";
import { useSearch } from "../context/SearchContext";
import logo from "../assets/images/logo.jpg";
import ShippingSettings from "../pages/ShippingSettings";

const socket = io("http://localhost:5000");

const AdminHeader = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef=useRef();
  const notificationRef=useRef();
  const { globalSearch, setGlobalSearch } = useSearch();
  const [openShipping, setOpenShipping] = useState(false);

  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    customers: []
  });
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

 const handleNotificationOpen = () => {

  setOpenNotification((prev) => !prev);

};
const clearAllNotifications = async () => {
  const confirmClear = window.confirm(
    "Are you sure you want to clear all notifications?"
  );

  if (!confirmClear) return;

  try {
    await axios.delete("http://localhost:5000/api/notifications/clear");
    setNotifications([]);
  } catch (err) {
    console.log(err);
  }
};
  // FETCH OLD NOTIFICATIONS ON PAGE LOAD
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 🔥 LIVE LISTEN FROM SOCKET
    socket.on("new_notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  useEffect(() => {

  const handleClickOutside = (event) => {

    // CLOSE PROFILE
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setOpenProfile(false);
    }

    // CLOSE NOTIFICATION
    // CLOSE NOTIFICATION
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {

      // CLOSE DROPDOWN
      setOpenNotification(false);

      // MARK ALL AS READ
      axios.put("http://localhost:5000/api/notifications/mark-read")
        .then(() => {

          setNotifications((prev) =>
            prev.map((item) => ({
              ...item,
              isRead: true,
            }))
          );

        })
        .catch((err) => console.log(err));
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);

const unreadCount = notifications.filter(
  (item) => item.isRead === false
).length;


  return (
    <header className="adminHeader">

  <div className="logo" onClick={() => window.location.reload()}>
  <h2>Sarathi <span>Furniture</span></h2>
  </div>

      <div className="searchBox">
       <input
        type="text"
        placeholder="Search customers name, order ID , products name..."
        value={globalSearch}
        onChange={async (e) => {
          const value = e.target.value;

          setGlobalSearch(value);

          if (!value.trim()) {
            setSearchResults({
              products: [],
              orders: [],
              customers: []
            });
            return;
          }

          try {
            const res = await axios.get(
              `http://localhost:5000/api/search?q=${encodeURIComponent(value)}`
            );

            setSearchResults(res.data);

          } catch (err) {
            console.log(err);
          }
        }}
      />
        <div className="searchDropdown">

          {/* PRODUCTS */}
          {searchResults.products.map((p) => (
            <div
              key={p._id}
              className="searchItem"
              onClick={() => {
                navigate(`/product?q=${p.name}`);

                setGlobalSearch("");

                setSearchResults({
                  products: [],
                  orders: [],
                  customers: []
                });
              }}
            >
              🛒 {p.name}
            </div>
          ))}

          {/* ORDERS */}
          {searchResults.orders.map((o) => (
            <div
              key={o._id}
              className="searchItem"
              onClick={() => {
                navigate(`/manageorders?q=${o._id}`);

                setGlobalSearch("");

                setSearchResults({
                  products: [],
                  orders: [],
                  customers: []
                });
              }}
            >
              📦 {o._id}
            </div>
          ))}

          {/* CUSTOMERS */}
          {searchResults.customers.map((c) => (
            <div
              key={c._id}
              className="searchItem"
              onClick={() => {
                navigate(`/customermanagement?q=${c.name}`);

                setGlobalSearch("");

                setSearchResults({
                  products: [],
                  orders: [],
                  customers: []
                });
              }}
            >
              👤 {c.name}
            </div>
          ))}

        </div>
      </div>

      <div className="navIcons">

        <div className="iconItem" onClick={() => navigate("/")}>
          <FaHome />
        </div>

       <div
        className="iconItem"
        onClick={() => setOpenShipping(true)}
      >
        <FaCog />
      </div>

        {/* NOTIFICATION */}
       <div
          className="iconItem notification"
          ref={notificationRef}
        >
          <FaBell onClick={handleNotificationOpen} />
          {unreadCount > 0 && (
            <span className="badge">
              {unreadCount > 10 ? "10+" : unreadCount}
            </span>
          )}

          {openNotification && (
           <div className="notificationMenu">
            <div className="notifTop">
              <h4>Notifications</h4>
              <button onClick={clearAllNotifications}>Clear All</button>
            </div>

              {notifications.length === 0 ? (
                <p className="emptyNotif">No Recent Activity</p>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`notifRow ${item.type} ${
                      item.isRead ? "read" : "unread"
                    }`}

                  >
                    <span className="notifIcon">
                      {item.type === "order" ? "🛒" : "📦"}
                    </span>
                    <div>
                      <p>{item.message}</p>
                      <small>
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="profileWrapper"ref={profileRef}>
          <FaUserCircle
            className="profileIcon"
            onClick={() => setOpenProfile(!openProfile)}
          />

          {openProfile && (
            <div className="dropdownMenu">
              <div className="dropdownItem" onClick={() => navigate("/")}>
                <FaHome />
                <span>Dashboard</span>
              </div>

              <div
                className="dropdownItem"
                onClick={() => setOpenShipping(true)}
              >
                <FaCog />
                <span>Settings</span>
              </div>

              <div className="dropdownItem logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>

      </div>

    <>
      {openShipping && (
        <ShippingSettings
          isOpen={openShipping}
          onClose={() => setOpenShipping(false)}
        />
      )}
    </>
    </header>
  );
};

export default AdminHeader;