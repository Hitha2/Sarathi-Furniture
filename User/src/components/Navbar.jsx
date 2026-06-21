import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {  FiHome,FiUser, FiShoppingCart } from "react-icons/fi";
// import { BiCategory } from "react-icons/bi";
import { FaSearch, FaBars, FaTimes, FaBox, FaHeart } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/Navbar.css";
import axios from "axios";

function Navbar({setCategory, cart }) {

  const [searchText, setSearchText] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [user, setUser] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [cartData, setCartData] = useState([]);


  const navigate = useNavigate();
  const location = useLocation();


  // ================= CLICK OUTSIDE =================
  useEffect(() => {
  const handleClickOutside = (event) => {
    // ✅ include sideDrawer also
    if (
      !event.target.closest(".categoryRow") &&
      !event.target.closest(".sideDrawer")
    ) {
      setActiveCategory(null);
    }

    if (!event.target.closest(".profileWrapper")) {
      setShowLoginDropdown(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () =>
    document.removeEventListener("click", handleClickOutside);
}, []);

  // ================= USER =================
useEffect(() => {
  const syncUser = () => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  syncUser();

  window.addEventListener("userChanged", syncUser);

  return () => {
    window.removeEventListener("userChanged", syncUser);
  };
}, [location.pathname]); // 🔥 IMPORTANT FIX
  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ================= CATEGORY CLICK =================
  const handleCategoryClick = async (cat) => {
  const catId = cat._id;

  setActiveCategory(catId); // always open

  if (subcategories[catId]) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/subcategory/${catId}`
    );

    setSubcategories(prev => ({
      ...prev,
      [catId]: res.data || [],
    }));
  } catch (err) {
    console.log(err);
  }
};
  // ================= SEARCH =================
const handleSearch = () => {
  if (!searchText.trim()) return;

  navigate(
    `/productpage?search=${encodeURIComponent(searchText.trim())}`,
    { replace: true }
  );
};

const handleLogoutClick = () => {
  setShowLogoutModal(true);
};
const confirmLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("userId");

  setUser(null);
  setCartData([]);

  // 🔥 FORCE CLEAR + SYNC ALL COMPONENTS
  window.dispatchEvent(new Event("userChanged"));
  window.dispatchEvent(new Event("cartUpdated"));

  toast.success("Logged out successfully 👋");

  setShowLogoutModal(false);

  setTimeout(() => {
    navigate("/login", { replace: true });
  }, 500);
};

const cancelLogout = () => {
  setShowLogoutModal(false);
};

const handleCartClick = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    // toast.error("Please login to access cart 🔒");

    setTimeout(() => {
      navigate("/login");
    }, 800);
  } else {
    navigate("/cart");
  }
};

const handleProtectedNavigation = (path) => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) {
    navigate("/login");
  } else {
    navigate(path);
  }
};

useEffect(() => {
  const syncCart = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setCartData([]);
      return;
    }

    const storedCart =
      JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

    setCartData(storedCart);
  };

  syncCart();

  window.addEventListener("cartUpdated", syncCart);
  window.addEventListener("userChanged", syncCart);

  return () => {
    window.removeEventListener("cartUpdated", syncCart);
    window.removeEventListener("userChanged", syncCart);
  };
}, []);

const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);

const filteredCategories = categories.filter((cat) =>
  cat.name.toLowerCase().includes(categorySearch.toLowerCase())
);
  return (
    <>
    
      {/* ================= TOP NAV ================= */}
      <div className="desktopOnly">
      <nav className="nav">

        <div className="leftSection">
          <div className="menuIcon" onClick={() => setMenuOpen(true)}>
            <FaBars />
          </div>
         <h2
  className="logo"
  onClick={() => {
    navigate("/");
    window.location.reload();
  }}
> Sarathi <span>Furniture</span>
 
</h2>
        </div>

        <div className="mobileRightIcons">

          {/* Wishlist */}
          <div
            className="iconBtn"
            onClick={() => handleProtectedNavigation("/wishlist")}
          >
            <FaHeart />
          </div>

          {/* Cart */}
          <div
            className="iconBtn cartIcon"
            onClick={handleCartClick}
          >
            <FiShoppingCart />

            {totalItems > 0 && (
              <span className="cartBadge">{totalItems}</span>
            )}
          </div>

        </div>

    <div className={`search-box ${location.pathname === "/" ? "homeSearch" : ""}`}>
  <input
    type="text"
    placeholder="Search..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    }}
  />

  <FaSearch onClick={handleSearch} />
</div>
    


        {/* MENU */}
        <div className="desktopMenu">
        <div className={`linksContainer ${menuOpen ? "active" : ""}`}>
          <div className="closeBtn" onClick={() => setMenuOpen(false)}>
            <FaTimes />
          </div>

          {/* <Link to="/" className="link">
            <FiHome />
          </Link>

          <span
            className="link"
            onClick={() => setShowCategories(!showCategories)}
          >
            <BiCategory />
          </span> */}

         <div
            className="link cartIconWrapper"
            onClick={handleCartClick}
          >
            <FiShoppingCart />

            {totalItems > 0 && (
              <span className="cartBadge">{totalItems}</span>
            )}
          </div>

          {/* PROFILE */}
          <div className="profileWrapper">
            {user ? (
              <div
                className="link"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLoginDropdown(!showLoginDropdown);
                }}
              >
                <FiUser /> {user.name || user.email}
              </div>
            ) : (
              <div className="link" onClick={() => navigate("/login")}>
                <FiUser />
              </div>
            )}

            {user && showLoginDropdown && (
              <div className="dropdownMenu">
                <div className="dropdownItem" onClick={() => handleProtectedNavigation("/profile")}>
                  <FiUser  style={{ color: "blue" }}/> Profile
                </div>

                <div className="dropdownItem" onClick={() => handleProtectedNavigation("/orders")}>
                  <FaBox style={{ color: "brown" }}/> Orders
                </div>

                <div className="dropdownItem" onClick={() => handleProtectedNavigation("/wishlist")}>
                  <FaHeart style={{ color: "red" }}/> Wishlist
                </div>
                <div
                  className="dropdownItem"
                  onClick={handleLogoutClick}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </nav>
      </div>

     
{/* ================= FIXED CATEGORY BAR ================= */}

{location.pathname === "/" && (
  <div className="fixedCategoryBar">

    {/* LEFT SIDE CATEGORIES */}
  

     <div className="categoryLeft">

  {(window.innerWidth <= 768
    ? (
        activeCategory
          ? filteredCategories.filter(
              (cat) => cat._id === activeCategory
            )
          : filteredCategories
      )
    : filteredCategories
  ).map((cat) => (

    <div
      key={cat._id}
      className="categoryBtnWrapper"
    >
<button
  className="categoryBtn"
  onMouseEnter={() => {
    if (window.innerWidth > 768) {
      handleCategoryClick(cat);
    }
  }}
  onClick={(e) => {
    e.stopPropagation();

    if (window.innerWidth <= 768) {
      if (activeCategory === cat._id) {
        setActiveCategory(null);
      } else {
        handleCategoryClick(cat);
      }
    }
  }}
>
  <>
    {cat.name}
    <FaChevronDown size={10} />
  </>
</button>

      {/* SUBCATEGORY */}
      {activeCategory === cat._id && (
        <div
          className="subcategoryDropdown"
          onMouseLeave={() => {
            if (window.innerWidth > 768) {
              setActiveCategory(null);
            }
          }}
        >

          {subcategories[cat._id]?.length > 0 ? (
            subcategories[cat._id].map((sub) => (
              <button
                key={sub._id}
                className="subcategoryBtn"
                onClick={() => {
                  navigate(
                    `/productpage?category=${cat._id}&subcategory=${sub._id}`
                  );

                  setActiveCategory(null);
                }}
              >
                {sub.name}
              </button>
            ))
          ) : (
            <div className="empty">
              No subcategories
            </div>
          )}

        </div>
      )}

    </div>
  ))}


    </div>

{/* RIGHT SIDE SEARCH */}
<div className="categorySearchRight">
  <input
    type="text"
    placeholder="Search products..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    }}
  />

  <FaSearch onClick={handleSearch} />
</div>

  </div>
)}

          {/* ================= MOBILE DRAWER ================= */}
          {menuOpen && (
            <>
              <div className="overlay" onClick={() => setMenuOpen(false)} />

              <div className="sideDrawer">
                <div className="drawerHeader">
                  <h3>Categories</h3>
                  <FaTimes onClick={() => setMenuOpen(false)} />
                </div>

                {categories.map((cat) => (
                  <div key={cat._id}>
                    <div
                      className="drawerCategory"
                      onClick={(e) => {  e.stopPropagation(); handleCategoryClick(cat)}}
                    >
                      {cat.name}
                    </div>

                    {activeCategory === cat._id && (
                      <div className="drawerSub">
                        {subcategories[cat._id]?.length > 0 ? (
                          subcategories[cat._id].map((sub) => (
                            <div
                              key={sub._id}
                              onClick={() => {
                                navigate(`/productpage?category=${cat._id}&subcategory=${sub._id}`);
                                setMenuOpen(false);
                              }}
                            >
                              {sub.name}
                            </div>
                          ))
                        ):(
                          <div style={{ padding: "8px", color: "#888" }}>
                            No subcategories
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            </>
          )}

      

      {/* ================= BOTTOM NAV (MOBILE) ================= */}
      <div className="bottomNav">
         <Link
          to="/"
          className={`bottomItem ${
            location.pathname === "/" ? "active" : ""
          }`}
        >
          <FiHome />
          <span>Home</span>
        </Link> 

        {/* <div
          className="bottomItem"
          onClick={() => setMenuOpen(true)}
        >
          <BiCategory />
          <span>Categories</span>
        </div> */}

        <div
          className={`bottomItem ${
            location.pathname === "/orders" ? "active" : ""
          }`}
          onClick={() => handleProtectedNavigation("/orders")}
        >
          <FaBox />
          <span>Orders</span>
        </div>

        {/* <Link
          to="/cart"
          className={`bottomItem ${
            location.pathname === "/cart" ? "active" : ""
          }`}
        >
          <FiShoppingCart />
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="bottomBadge">{totalItems}</span>
          )}
        </Link> */}

        {user ? (
          <Link
            to="/profile"
            className={`bottomItem ${
              location.pathname === "/profile" ? "active" : ""
            }`}
          >
            <FiUser />
            <span>Account</span>
          </Link>
        ) : (
          <Link to="/login" className="bottomItem">
            <FiUser />
            <span>Login</span>
          </Link>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar
      />

    {showLogoutModal && (
      <div className="confirm-overlay">
        <div className="confirm-box">
          <p>Are you sure you want to logout?</p>

          <div className="confirm-actions">
            <button className="btn-yes" onClick={confirmLogout}>
              Yes
            </button>

            <button className="btn-no" onClick={cancelLogout}>
              No
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Navbar;
