import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/ProductDetails.css";

import { showError, showSuccess } from "../utils/toast";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);

  const [relatedPage, setRelatedPage] = useState(1);
  const relatedPerPage = 10;

  const formatPrice = (price) => {
    return Math.round(price).toLocaleString("en-IN");
  };

  const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  return token && token !== "null" && token !== "undefined";
};
  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/product/${id}`
      );

      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchProduct();
}, [id]);

  // ✅ FETCH PRODUCT + CHECK WISHLIST
useEffect(() => {
  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");

    setLiked(false);
    setLikedMap({}); // IMPORTANT RESET

    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data)) return;

      const map = {};
      let isCurrentLiked = false;

      data.forEach((item) => {
        const pid = String(item.productId?._id || item.productId);

        map[pid] = true;

        if (pid === String(id)) {
          isCurrentLiked = true;
        }
      });

      setLikedMap(map);
      setLiked(isCurrentLiked); // ❤️ IMPORTANT FIX
    } catch (err) {
      console.log(err);
    }
  };

  fetchWishlist();
}, [id]);

  // ✅ RELATED PRODUCTS
 useEffect(() => {
  if (!product) return;

  const categoryId =
    typeof product.categoryId === "object"
      ? product.categoryId._id
      : product.categoryId;

  fetch(`http://localhost:5000/api/product?category=${categoryId}`)
    .then((res) => res.json())
    .then((data) => {
      const products = Array.isArray(data) ? data : [];

      const filtered = products.filter(
        (item) => item._id !== product._id
      );

      setRelated(filtered);
    })
    .catch((err) => console.log(err));
}, [product]);


  // ✅ ADD TO WISHLIST (BACKEND)
 const handleWishlist = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login"); // 🔥 force login
    return;
  }

  try {
    if (liked) {
      // ❌ REMOVE
      const res = await fetch(
        `http://localhost:5000/api/wishlist/${product._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setLiked(false);
       showError("Removed from Wishlist ");
      }
    } else {
      // ✅ ADD
      const res = await fetch("http://localhost:5000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (res.ok) {
        setLiked(true);
        showSuccess("Added to Wishlist ❤️");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

  if (!product) return <p>Loading...</p>;

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;


  const totalRelatedPages = Math.ceil(
    related.length / relatedPerPage
  );

  const relatedStartIndex =
    (relatedPage - 1) * relatedPerPage;

  const currentRelatedProducts = related.slice(
    relatedStartIndex,
    relatedStartIndex + relatedPerPage
  );

  return (
    <>

      {/* ================= MAIN PRODUCT ================= */}
      <div className="product-details-container">

        {/* LEFT IMAGE */}
        <div className="image-section">
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt=""
          />

          {/* ❤️ HEART ICON */}
          <div className="heart-icon" onClick={handleWishlist}>
            {liked ? <FaHeart /> : <FaRegHeart />}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="details-section">
          <h2 className="product-title">{product.name}</h2>
          <h2 style={{fontSize:"14px",color:"#777"}}>{product.subcategoryId?.name}</h2>

          <p className="price">
            ₹{formatPrice(discountedPrice)}
            {product.discount > 0 && (
              <span className="original-price">
               ₹{formatPrice(product.price)}
              </span>
            )}
          </p>

          {product.discount > 0 && (
            <p className="discount">{product.discount}% OFF</p>
          )}

          <p className="description">{product.description}</p>

          {/* BUTTONS */}
          <div className="buttons">
            <button
              className="cart"
              onClick={() => {
                if (!isLoggedIn()) {
                  navigate("/login", { replace: true });
                  return;
                }

                const userId = localStorage.getItem("userId");

                const existing =
                  JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

                const already = existing.find((item) => item._id === product._id);

                let updated;

                if (already) {
                  if (already.quantity >= product.stock) {
                    showError("Stock limit reached! ");
                    return;
                  }

                  updated = existing.map((item) =>
                    item._id === product._id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  );
                } else {
                  if (product.stock <= 0) {
                    showError("Product is out of stock ");
                    return;
                  }

                  updated = [
                    ...existing,
                    {
                      _id: product._id,
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      discount: product.discount,
                      image: product.image,
                      stock: product.stock,
                      quantity: 1,
                    },
                  ];
                }

                localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
                window.dispatchEvent(new Event("cartUpdated"));

                showSuccess("Added to Cart 🛒");
              }}
            >
              🛒 Add to Cart
            </button>

            <button
              className="buy"
              onClick={() => {
                if (!isLoggedIn()) {
                  showError("Please login first 🔐");
                  setTimeout(() => navigate("/login"), 1500);
                  return;
                }

               const userId = localStorage.getItem("userId");
               const existing =JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

                const already = existing.find((item) => item._id === product._id);

                let updated;

                if (already) {
                  // ✅ STOCK LIMIT CHECK
                  if (already.quantity >= product.stock) {
                    showError("Stock limit reached! Cannot buy more ");
                    return;
                  }

                  updated = existing.map((item) =>
                    item._id === product._id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  );
                } else {
                  if (product.stock <= 0) {
                    showError("Product is out of stock ");
                    return;
                  }

                  updated = [
                      ...existing,
                      {
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        discount: product.discount,
                        image: product.image,
                        stock: product.stock,   // ✅ VERY IMPORTANT
                        quantity: 1
                      }
                    ];
                }

                localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
                window.dispatchEvent(new Event("cartUpdated"));

                navigate("/cart");
              }}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ================= RELATED PRODUCTS ================= */}
      <div className="related-section">
        <h3>Related Products</h3>

        <div className="related-grid">
          {related.length === 0 ? (
            <p>No related products</p>
          ) : (
            currentRelatedProducts.map((item) => (
              <div
                key={item._id}
                className={`related-card ${item.stock <= 0 ? "disabled" : ""}`}
                onClick={() => {
                  if (item.stock <= 0) return; // 🚫 block navigation
                  navigate(`/product/${item._id}`);
                }}
              >

                {/* IMAGE WRAPPER (IMPORTANT) */}
                <div className="img-wrapper">
                  <div
                    className="related-heart"
                    onClick={async (e) => {
                      e.stopPropagation();

                      const token = localStorage.getItem("token");

                      if (!token) {
                        navigate("/login");
                        return;
                      }

                      try {
                       const isLiked = likedMap[item._id];

                       const res = await fetch(
                        "http://localhost:5000/api/wishlist",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            productId: item._id,
                          }),
                        }
                      );

                      if (res.ok) {
                       setLikedMap((prev) => {
                          const updated = { ...prev };

                          if (updated[item._id]) {
                            delete updated[item._id];
                          } else {
                            updated[item._id] = true;
                          }

                          return updated;
                        });

                        showSuccess(
                          isLiked ? "Removed from Wishlist " : "Added to Wishlist ❤️"
                        );
                      }
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {likedMap[item._id] ? <FaHeart /> : <FaRegHeart />}
                  </div>
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt=""
                  />

                  {/* ✅ STOCK BADGE */}
                  {item.stock <= 0 ? (
                    <span className="badge out">Out of Stock</span>
                  ) : item.stock <= 5 ? (
                    <span className="badge low">Only {item.stock} left</span>
                  ) : null}
                </div>

                <h4>{item.subcategoryId?.name}</h4>
                <h4 className="related-name">{item.name}</h4>
                <p>₹{formatPrice(item.price)}</p>
              </div>
              ))
          )}
        </div>

        {totalRelatedPages > 1 && (
          <div className="related-pagination">

            <button
              disabled={relatedPage === 1}
              onClick={() =>
                setRelatedPage(relatedPage - 1)
              }
            >
              Prev
            </button>

            {[...Array(totalRelatedPages)].map((_, index) => (
              <button
                key={index}
                className={
                  relatedPage === index + 1
                    ? "active-page"
                    : ""
                }
                onClick={() =>
                  setRelatedPage(index + 1)
                }
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={relatedPage === totalRelatedPages}
              onClick={() =>
                setRelatedPage(relatedPage + 1)
              }
            >
              Next
            </button>

          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;