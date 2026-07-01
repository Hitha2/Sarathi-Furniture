import React, { useEffect, useState } from "react";
import { showSuccess, showError } from "../utils/toast";
import "../styles/Cart.css";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import OSMLocationPicker from "../components/OSMLocationPicker";
import {
  STORE_LOCATION,
  calculateDistanceKm,
} from "../utils/shippingCalculator";

const Cart = () => {
  const [suggested, setSuggested] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddress, setShowAllAddress] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [addressMode, setAddressMode] = useState("saved");

  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingRate, setShippingRate] = useState(0);
  const [ratePerKm, setRatePerKm] = useState(0);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = isMobile ? suggested.length : 10;

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    locality: "",
    village: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const formatPrice = (price) => {
    return Math.round(price).toLocaleString("en-IN");
  };

useEffect(() => {
  const loadCart = () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setCart([]);
      setAddresses([]);
      setSelectedAddress(null);
      setShowAllAddress(false);
      setShippingCharge(0);
      setDistanceKm(0);
      return;
    }

    const data =
      JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

    setCart(data);
  };

  loadCart();

  window.addEventListener("userChanged", loadCart);
  window.addEventListener("cartUpdated", loadCart);

  return () => {
    window.removeEventListener("userChanged", loadCart);
    window.removeEventListener("cartUpdated", loadCart);
  };
}, []);

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

useEffect(() => {
  fetch("https://sarathi-furniture.onrender.com/api/product")
    .then((res) => res.json())
    .then((data) => {
      const products = Array.isArray(data) ? data : [];
      setSuggested(products);
    })
    .catch((err) => console.log(err));
}, []);
// shipping charge calculation
useEffect(() => {
  fetch("https://sarathi-furniture.onrender.com/api/settings")
    .then((res) => res.json())
    .then((data) => {
      setShippingRate(data.shippingRatePerKm || 0);
    })
    .catch((err) => console.log(err));
}, []);


useEffect(() => {
  fetch("https://sarathi-furniture.onrender.com/api/settings")
    .then((res) => res.json())
    .then((data) => {
      setRatePerKm(data.shippingRatePerKm || 0);
    })
    .catch((err) => console.log(err));
}, []);


useEffect(() => {
  const loadAddress = () => {
    const userId = localStorage.getItem("userId");

    setAddresses([]);
    setSelectedAddress(null);
    setShowAllAddress(false);
    setShippingCharge(0);
    setDistanceKm(0);

    if (!userId) {
      return;
    }

    fetch(`https://sarathi-furniture.onrender.com/api/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const addr = data.addresses || [];
        setAddresses(addr);

       if (addr.length > 0) {
          setSelectedAddress(addr[0]);
        } else {
          setSelectedAddress(null);
        }
      })
    .catch((err) => console.log(err));
  };

  loadAddress();

  window.addEventListener("userChanged", loadAddress);

  return () => {
    window.removeEventListener("userChanged", loadAddress);
  };
}, []);


useEffect(() => {
  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://sarathi-furniture.onrender.com/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Wishlist API error:", data);
        return;
      }

      const map = {};

      data.forEach((item) => {
        const id = String(item.productId?._id || item.productId);
        if (id) map[id] = true;
      });

      setLikedMap(map);
    } catch (err) {
      console.log(err);
    }
  };

  fetchWishlist();
}, []);

  // UPDATE QUANTITY WITH STOCK CHECK
  const updateQty = (id, change) => {
    const updated = cart.map((item) => {
      if (item._id === id) {
        const newQty = item.quantity + change;

        //  prevent going below 1
        if (newQty < 1) return item;

        // prevent exceeding stock
        if (newQty > item.stock) {
         showError("Stock limit reached!");
          return item;
        }

        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCart(updated);
    const userId = localStorage.getItem("userId");
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
     window.dispatchEvent(new Event("cartUpdated"));
  };

 const removeItem = (id) => {
  const updated = cart.filter((item) => item._id !== id);
  setCart(updated);
  const userId = localStorage.getItem("userId");
  localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
  window.dispatchEvent(new Event("cartUpdated"));
  showError("Item removed from cart ");
};

  // ================= SUBTOTAL AFTER PRODUCT DISCOUNT =================
const total = cart.reduce((sum, item) => {
  const discountedPrice =
    item.price - (item.price * item.discount) / 100;

  return sum + discountedPrice * item.quantity;
}, 0);

// ================= ORIGINAL TOTAL WITHOUT DISCOUNT =================
const originalTotal = cart.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);

// ================= PRODUCT SAVINGS =================
const productSavings = originalTotal - total;

// ================= GST =================
const gstPercent = 18;
const gstAmount = Math.round((total * gstPercent) / 100);

// ================= FINAL SAVINGS =================
const totalSavings = productSavings;

// ================= GRAND TOTAL =================
const grandTotal = total + shippingCharge + gstAmount;


 const handleAddressInput = (e) => {
  const updatedAddress = {
    ...newAddress,
    [e.target.name]: e.target.value,
  };

  setNewAddress(updatedAddress);

  // only when all fields entered
  if (
    addressMode === "new" &&
    updatedAddress.village &&
    updatedAddress.city &&
    updatedAddress.state &&
    updatedAddress.pincode
  ) {
    getLatLngFromAddress(updatedAddress);
  }
};

const updateShippingFromLocation = (lat, lng) => {

  const loc = { lat, lng };

  const distance = calculateDistanceKm(
    STORE_LOCATION,
    loc
  );

  const charge = Math.round(
    distance * ratePerKm
  );

  setDistanceKm(distance);

  setShippingCharge(charge);
};

const getLatLngFromAddress = async (address) => {
  try {
    const query = `${address.village} ${address.city} ${address.state} ${address.pincode}`;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      updateShippingFromLocation(lat, lng);
    } else {
      setShippingCharge(0);
      setDistanceKm(0);
    }
  } catch (err) {
    console.log(err);
  }
};

const handleMapLocationSelect = async (location) => {
  const lat = location.lat;
  const lng = location.lng;

  setSelectedMapLocation({ lat, lng });

  updateShippingFromLocation(lat, lng);
  setAddressMode("new");

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
    );

    const data = await res.json();
    const address = data.address || {};

    setNewAddress({
      fullName: "",

      locality:
        address.road ||
        address.hamlet ||
        address.neighbourhood ||
        "",

      village:
        address.suburb ||
        address.village ||
        address.city_district ||
        "",

      city:
        address.city ||
        address.town ||
        address.state_district ||
        "",

      state: address.state || "",
      pincode: address.postcode || "",
      phone: "",
    });

    showError("Address auto-filled from map");
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  const syncCartStock = async () => {
    const userId = localStorage.getItem("userId");
    const cart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

    const updatedCart = await Promise.all(
      cart.map(async (item) => {
        const res = await fetch(`https://sarathi-furniture.onrender.com/api/product/${item._id}`);
        const product = await res.json();

        return {
          ...item,
          stock: product.stock, // ✅ latest stock from DB
        };
      })
    );

    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  syncCartStock();
}, []);

useEffect(() => {
  if (addressMode === "saved" && selectedAddress) {
    if (selectedAddress.lat && selectedAddress.lng) {
      updateShippingFromLocation(
        parseFloat(selectedAddress.lat),
        parseFloat(selectedAddress.lng)
      );
    } else {
      getLatLngFromAddress(selectedAddress);
    }
  }
}, [selectedAddress, addressMode]);

// useEffect(() => {
//   if (
//     addressMode === "new" &&
//     newAddress.village &&
//     newAddress.city &&
//     newAddress.state &&
//     newAddress.pincode
//   ) {
//     getLatLngFromAddress(newAddress);
//   }
// }, [newAddress]);


const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

const totalPages = Math.ceil(suggested.length / productsPerPage);

const startIndex = (currentPage - 1) * productsPerPage;

const currentProducts = suggested.slice(
  startIndex,
  startIndex + productsPerPage
);

const hasOutOfStockItem = cart.some(
  (item) => item.stock <= 0 || item.quantity > item.stock
);

// ================= ADDRESS VALIDATION =================
const validateNewAddress = () => {
  // Full Name
  if (!newAddress.fullName.trim()) {
    showError("Full name is required");
    return false;
  }

  if (newAddress.fullName.trim().length < 3) {
    showError("Full name must be minimum 3 characters");
    return false;
  }
  if (!newAddress.locality.trim()) {
    showError("Locality is required");
    return false;
  }

  // Village
  if (!newAddress.village.trim()) {
    showError("Village / Area is required");
    return false;
  }

  // City
  if (!newAddress.city.trim()) {
    showError("City is required");
    return false;
  }

  // State
  if (!newAddress.state.trim()) {
    showError("State is required");
    return false;
  }

  // Pincode
  if (!newAddress.pincode.trim()) {
    showError("Pincode is required");
    return false;
  }

  if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
    showError("Pincode must be 6 digits");
    return false;
  }

  // Phone
  if (!newAddress.phone.trim()) {
    showError("Phone number is required");
    return false;
  }

  if (!/^[6-9][0-9]{9}$/.test(newAddress.phone)) {
    showError("Enter valid 10 digit phone number");
    return false;
  }

  // Map Location
  if (!selectedMapLocation) {
    showError("Please select location on map");
    return false;
  }

  return true;
};
  return (
    <>


      {/* ================= CART ================= */}
      <div className="cart-container">

        {/* LEFT SIDE */}
        <div className="cart-left">
          <h3>My Cart ({cart.length})</h3>

          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              
              <img
                src={`https://sarathi-furniture.onrender.com/uploads/${item.image}`}
                alt=""
              />

              <div className="cart-info">
                <h4>{item.name}</h4>
                 <p className="desc">
                  {isMobile
                    ? item.description?.substring(0, 60) + "..."
                    : item.description}
                </p>

                  <div className="priceBox">
                    {(() => {
                      const discountedPrice =
                        item.price - (item.price * item.discount) / 100;

                      return (
                        <>
                          <span style={{ fontWeight: "bold" }}>
                            ₹{formatPrice(discountedPrice)}
                          </span>

                          <span style={{ textDecoration: "line-through", color: "gray" }}>
                            ₹{formatPrice(item.price)}
                          </span>

                          <span className="discount">
                            {item.discount}% OFF
                          </span>
                        </>
                      );
                    })()}
                  </div>
                {/* SHOW STOCK */}
                {item.stock <= 0 && (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    Out of Stock
                  </p>
                )}

                <div className="qty">
                  <button
                    disabled={item.stock <= 0}
                    onClick={() => updateQty(item._id, -1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    disabled={item.stock <= 0 || item.quantity >= item.stock}
                    onClick={() => updateQty(item._id, 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove"
                  onClick={() => removeItem(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="cart-right">
          <h3>Price Details</h3>

           <h4>Delivery Address</h4>
           <div className="delivery-choice">

            <label className="check-line">
              <input
                type="checkbox"
                checked={addressMode === "saved"}
                onChange={() => {
                  setAddressMode("saved");
                  if (selectedAddress) {
                    getLatLngFromAddress(selectedAddress);
                  }
                }}
              />
              Delivery address same as selected address
            </label>

            <label className="check-line">
              <input
                type="checkbox"
                checked={addressMode === "new"}
                onChange={() => setAddressMode("new")}
              />
              Enter New Delivery Address
            </label>

        </div>

            {/*  SHOW SELECTED ADDRESS */}
           {addressMode === "saved" && !showAllAddress && selectedAddress && (
            <div
              className={`address-option ${addressMode === "saved" ? "selected" : ""}`}
              onClick={() => setAddressMode("saved")}
            >
             <div className="address-box">
              <p className="name">{selectedAddress.fullName}</p>

              {/* ADDRESS */}
             <p>{selectedAddress.locality}</p>

             <p>
              {selectedAddress.village}, {selectedAddress.city}
             </p>

              <p>
                {selectedAddress.state} - {selectedAddress.pincode}
              </p>

              <p className="phone">
                <FaPhoneAlt /> {selectedAddress.phone}
              </p>
            </div>

              <button
                className="change-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllAddress(true);
                }}
              >
                Change
              </button>
            </div>
          )}

            {/*  SHOW ALL ADDRESSES */}
           {addressMode === "saved" && showAllAddress && (
              <div>
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`address-option ${
                      selectedAddress?._id === addr._id && addressMode === "saved"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowAllAddress(false);
                      setAddressMode("saved");

                      if (addr.lat && addr.lng) {
                        updateShippingFromLocation(parseFloat(addr.lat), parseFloat(addr.lng));
                      } else {
                        getLatLngFromAddress(addr);
                      }
                    }}
                  >
                    <div className="address-box">
                      <p className="name">{addr.fullName}</p>
                      <p>{addr.locality}</p>

                      <p>
                        {addr.village}, {addr.city}
                      </p>

                      <p>
                        {addr.state} - {addr.pincode}
                      </p>
                      <p className="phone"><FaPhoneAlt /> {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NEW ADDRESS FORM */}
            {addressMode === "new" && (
              <>
                <div style={{ marginTop: "15px" }}>
                  <h4>Select Delivery Location on Map</h4>

                  <OSMLocationPicker onLocationSelect={handleMapLocationSelect} />
                  {!selectedMapLocation && (
                    <p style={{ color: "red", marginTop: "10px" }}>
                      Please click on map to select delivery location
                    </p>
                  )}

                  {distanceKm > 0 && (
                    <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>
                      Distance: {distanceKm.toFixed(2)} KM
                    </p>
                  )}
                </div>
  
              <div className="new-address-form">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={newAddress.fullName}
                  onChange={handleAddressInput}
                />

                <input
                  type="text"
                  name="locality"
                  placeholder="House No, Area, Street, Landmark"
                  value={newAddress.locality}
                  onChange={handleAddressInput}
                />
                <input
                  type="text"
                  name="village"
                  placeholder="Village / Area"
                  value={newAddress.village}
                  onChange={handleAddressInput}
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={handleAddressInput}
                />

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={handleAddressInput}
                />

                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  maxLength={6}
                  value={newAddress.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setNewAddress({ ...newAddress, pincode: value });
                  }}
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  maxLength={10}
                  value={newAddress.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setNewAddress({ ...newAddress, phone: value });
                  }}
                />
              </div>
              </>
            )}
         <div className="bill-line">
          <span>Total Items</span>
          <span>{totalCartItems}</span>
        </div>

        <div className="bill-line">
          <span>Subtotal</span>
          <span>₹{formatPrice(total)}</span>
        </div>

        <div className="bill-line">
          <span>Product Discount</span>
          <span>- ₹{formatPrice(productSavings)}</span>
        </div>

        <div className="bill-line">
          <span>Shipping Charge</span>
          <span>₹{formatPrice(shippingCharge)}</span>
        </div>

        <div className="bill-line">
          <span>GST ({gstPercent}%)</span>
          <span>₹{formatPrice(gstAmount)}</span>
        </div>

        <hr />

        <div className="bill-line grand">
          <span>Grand Total</span>
          <span>₹{formatPrice(grandTotal)}</span>
        </div>

        <p className="saved-money">
          You saved ₹{formatPrice(totalSavings)} on this order 🎉
        </p>

          <button
            className="order-btn" disabled={hasOutOfStockItem }
            
          onClick={async () => {
            const userId = localStorage.getItem("userId");
            const cart =
              JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

            if (!userId) {
              showError("Please login first");
              return;
            }

            if (cart.length === 0) {
              showError("Cart is empty");
              return;
            }

            // ✅ LIVE STOCK CHECK
            for (const item of cart) {
              try {
                const res = await fetch(
                  `https://sarathi-furniture.onrender.com/api/product/${item._id}`
                );

                const product = await res.json();

                // ❌ OUT OF STOCK
               // ❌ OUT OF STOCK
                if (product.stock <= 0) {
                  showError(`${item.name} is out of stock`);
                  return;
                }

                // ❌ QUANTITY EXCEEDS STOCK
                if (item.quantity > product.stock) {
                  showError(
                    `${item.name} only ${product.stock} left`
                  );

                  return;
                }

              } catch (err) {
                console.log(err);
                showError("Stock validation failed");
                return;
              }
            }

            // ✅ ADDRESS CHECK
            if (addressMode === "saved" && !selectedAddress) {
              showError("Please select address");
              return;
            }

            if (addressMode === "new") {
              const isValid = validateNewAddress();

              if (!isValid) {
                return;
              }
            }

            // ================= BILLING =================
            const subtotal = cart.reduce((sum, item) => {
              const discountedPrice =
                item.price - (item.price * item.discount) / 100;

              return sum + discountedPrice * item.quantity;
            }, 0);

            const originalTotal = cart.reduce((sum, item) => {
              return sum + item.price * item.quantity;
            }, 0);

            const productSavings = originalTotal - subtotal;

            const gstPercent = 18;

            const gstAmount = Math.round(
              (subtotal * gstPercent) / 100
            );

            const grandTotal =
              subtotal + shippingCharge + gstAmount;

            const items = cart.map((item) => {
              const discountedPrice =
                item.price - (item.price * item.discount) / 100;

              return {
  productId: item._id,
  name: item.name,

  // ✅ save original price
  originalPrice: item.price,

  // ✅ save discount %
  discount: item.discount,

  // ✅ save final discounted price
  price: Math.round(discountedPrice),

  quantity: item.quantity,
  image: item.image,

  categoryName:
    item.categoryId?.name || item.categoryName || "",

  subcategoryName:
    item.subcategoryId?.name || item.subcategoryName || "",
};
            });

            const orderData = {
              userId,
              items,
              subtotal,
              productSavings,
              shippingCharge,
              gstPercent,
              gstAmount,
              totalSavings,
              totalAmount: grandTotal,
              deliveryAddress:
                addressMode === "new"
                  ? newAddress
                  : selectedAddress,
            };

            localStorage.setItem(
              "orderData",
              JSON.stringify(orderData)
            );

            navigate("/payment");
          }}
            >
              {hasOutOfStockItem
                ? "Out of Stock Item in Cart"
                : "Continue"}
            </button>
          </div>

        </div>

      {/* ================= SUGGESTED ================= */}
      <div className="suggested-section">
        <h3>Suggested for You</h3>
        <p className="sub-text">Based on your activity</p>

        <div className="suggested-row">
          {currentProducts.map((item) => (
            <div
              key={item._id}
              className={`suggested-card ${item.stock < 1 ? "disabled-card" : ""}`}
              onClick={() => {
                if (item.stock < 1) return;
                navigate(`/product/${item._id}`);
              }}
            >

              {/* LOW STOCK BADGE */}
              {item.stock <= 5 && (
                <div className="lowStockBadge">
                  {item.stock > 0 ? `Only ${item.stock} left` : "Out of Stock"}
                </div>
              )}

              <div
                className="suggested-heart"
                onClick={async (e) => {
                  e.stopPropagation();

                  const token = localStorage.getItem("token");

                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  try {
                    const token = localStorage.getItem("token");

                      if (!token) {
                        navigate("/login");
                        return;
                      }

                      const isLiked = likedMap[item._id];

                        const url = isLiked
                          ? `https://sarathi-furniture.onrender.com/api/wishlist/${item._id}`
                          : `https://sarathi-furniture.onrender.com/api/wishlist`;

                        const res = await fetch(url, {
                          method: isLiked ? "DELETE" : "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: isLiked ? null : JSON.stringify({ productId: item._id }),
                        });

                      if (res.ok) {
                        setLikedMap((prev) => ({
                          ...prev,
                          [item._id]: !isLiked,
                        }));

                        showSuccess(
                          isLiked ? "Removed from Wishlist 💔" : "Added to Wishlist ❤️"
                        );
                      } else {
                        showError("Something went wrong");
                      }
                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                {likedMap[item._id] ? (
                  <FaHeart className="wish-filled" />
                ) : (
                  <FaRegHeart className="wish-outline" />
                )}
              </div>
              <img
                src={`https://sarathi-furniture.onrender.com/uploads/${item.image}`}
                alt=""
              />
              <p className="suggested-name">{item.name}</p>
              <p className="name">{item.subcategoryId?.name}</p>
              <p className="price">₹{formatPrice(item.price)}</p>

              <button
                disabled={item.stock < 1}
                onClick={(e) => {
                  e.stopPropagation();

                  const userId = localStorage.getItem("userId");

                  if (!userId) {
                    showError("Please login first");
                    return;
                  }

                  const existing =
                    JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

                  const already = existing.find((i) => i._id === item._id);

                  let updated;

                  if (already) {
                    if (already.quantity >= item.stock) {
                      showError("Stock limit reached!");
                      return;
                    }

                    updated = existing.map((i) =>
                      i._id === item._id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                    );
                  } else {
                    if (item.stock < 1) {
                      showError("Out of stock!");
                      return;
                    }

                    updated = [
                      ...existing,
                      {
                        _id: item._id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        discount: item.discount,
                        image: item.image,
                        stock: item.stock,
                        quantity: 1,
                      },
                    ];
                  }

                  localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
                  setCart(updated);
                  window.dispatchEvent(new Event("cartUpdated"));

                  showSuccess("Added to Cart 🛒");
                }}
              >
                {item.stock > 0 ? "Add to cart" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Pagination Only */}
          {!isMobile && totalPages > 1 && (
            <div className="pagination">
              
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active-page" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>

            </div>
          )}
      </div>
    </>
  );
};

export default Cart;