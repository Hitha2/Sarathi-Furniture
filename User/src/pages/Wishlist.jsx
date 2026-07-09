import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setWishlist([]);
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          "https://sarathi-furniture.onrender.com/api/wishlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          setWishlist([]);
          navigate("/login");
          return;
        }

        const data = await res.json();

        // ✅ GET LATEST STOCK FOR EACH PRODUCT
        const updatedWishlist = await Promise.all(
          data.map(async (item) => {
            if (!item.productId?._id) return item;

            try {
              const productRes = await fetch(
                `https://sarathi-furniture.onrender.com/api/product/${item.productId._id}`
              );

              const latestProduct = await productRes.json();

              return {
                ...item,
                productId: latestProduct,
              };
            } catch {
              return item;
            }
          })
        );

        setWishlist(updatedWishlist);

      } catch (error) {
        console.log("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  if (loading) {
    return <p>Loading wishlist...</p>;
  }

  return (
    <div className="wishlist-container">
      <h2>My Wishlist ❤️</h2>

      {wishlist
      .filter((item) => item.productId)
      .map((item) => {
        const product = item.productId;

        const discountedPrice = product.discount
          ? product.price - (product.price * product.discount) / 100
          : product.price;

        const isOutOfStock = product.stock <= 0;

        return (
         <div
            key={item._id}
            className={`wishlist-item ${isOutOfStock ? "out-stock-card" : ""}`}
            onClick={() => {
            if (isOutOfStock) return;

            navigate(`/product/${product._id}`);
          }}
          >
           <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                console.log("Image URL:", product.image);
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div className="wishlist-info">

              <h4 className="wishlist-product-name">
                {product.name}
              </h4>

              <h4 style={{ fontSize: "12px", color: "#777" }}>
                {product.subcategoryId?.name || "Product"}
              </h4>

              <p className="wish-new-price">
                ₹{discountedPrice}

                {product.discount > 0 && (
                  <span className="wish-old-price">
                    ₹{product.price}
                  </span>
                )}
              </p>

              {product.discount > 0 && (
                <p className="wish-discount">
                  {product.discount}% OFF
                </p>
              )}

              {/* STOCK STATUS */}
                {isOutOfStock ? (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    Out of Stock
                  </p>
                ) : product.stock <= 5 ? (
                  <p style={{ color: "#ff9800", fontWeight: "bold" }}>
                    Only {product.stock} left
                  </p>
                ) : (
                  <p style={{ color: "green", fontWeight: "bold" }}>
                    In Stock
                  </p>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Wishlist;