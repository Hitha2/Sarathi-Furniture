import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";
import { FaTimes } from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { showSuccess, showError } from "../utils/toast";

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ready, setReady] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const isMobile = window.innerWidth <= 768;

  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    min: "",
    max: "",
    discount: "",
    search:""
  });

  const [loading, setLoading] = useState(false);


 useEffect(() => {
  if (!isMobile) {
    setCurrentPage(1);
  }
}, [products]);

  // ================= CATEGORY =================
  useEffect(() => {
    axios.get("http://localhost:5000/api/category")
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  }, []);

  // ================= SUBCATEGORY =================
  useEffect(() => {
    if (filters.category) {
      axios
        .get(`http://localhost:5000/api/subcategory/${filters.category}`)
        .then(res => setSubcategories(res.data))
        .catch(err => console.log(err));
    } else {
      setSubcategories([]);
    }
  }, [filters.category]);

  // ================= READ FROM URL (FIXED LOOP PREVENTION) =================
useEffect(() => {
  const params = new URLSearchParams(location.search);

  const newFilters = {
    category: params.get("category") || "",
    subcategory: params.get("subcategory") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    discount: params.get("discount") || "",
    search: params.get("search") || ""
  };

  setFilters(newFilters);

  setReady(true); // ✅ IMPORTANT
}, [location.search]);

  // ================= FETCH + URL SYNC (FIXED SINGLE FLOW) =================
useEffect(() => {
  if (!ready) return;

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== "")
  );

  const query = new URLSearchParams(cleanFilters).toString();

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/product?${query}`
      );

      setProducts(res.data); // ✅ no pagination response anymore
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  fetchProducts();
}, [filters, ready]); // ✅ FIXED

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  useEffect(() => {
  const fetchWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // store only productIds
      const ids = data.map(
        (item) => item.productId?._id || item.productId
      );

      setWishlist(ids);
    } catch (err) {
      console.log(err);
    }
  };

  fetchWishlist();
}, [token]);

const toggleWishlist = async (product) => {
  if (!token) {
    showError("Please login first");
    navigate("/login");
    return;
  }

  try {
    const isLiked = wishlist.includes(product._id);

    if (isLiked) {
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
        setWishlist((prev) =>
          prev.filter((id) => id !== product._id)
        );

       showError("Removed from Wishlist ❤️");
      }
    } else {
      // ✅ ADD
      const res = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
          }),
        }
      );

      if (res.ok) {
        setWishlist((prev) => [...prev, product._id]);
        showSuccess("Added to Wishlist ❤️");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

const currentProducts = isMobile
  ? products
  : products.slice(indexOfFirstProduct, indexOfLastProduct);

const totalPages = isMobile
  ? 1
  : Math.ceil(products.length / productsPerPage);


  return (

    <>
   
    <div className="products-container">

      <div className="filter-panel desktop-filter">

        <div className="filter-header">
          <h3>Filters</h3>
          <span
            onClick={() =>
              setFilters({
                category: "",
                subcategory: "",
                min: "",
                max: "",
                discount: ""
              })
            }
          >
            CLEAR ALL
          </span>
        </div>

        <div className="selected-filters">

          {filters.category && (
            <div className="filter-chip">
              Category
              <span onClick={() => removeFilter("category")}>
                <IoClose />
              </span>
            </div>
          )}

          {filters.subcategory && (
            <div className="filter-chip">
              Subcategory
              <span onClick={() => removeFilter("subcategory")}>
                <IoClose />
              </span>
            </div>
          )}

          {(filters.min || filters.max) && (
            <div className="filter-chip">
              ₹{filters.min || 0} - ₹{filters.max || "∞"}
              <span onClick={() => {
                removeFilter("min");
                removeFilter("max");
              }}>
                <FaTimes />
              </span>
            </div>
          )}

          {filters.discount && (
            <div className="filter-chip">
              {filters.discount}%+
              <span onClick={() => removeFilter("discount")}>
                <IoClose />
              </span>
            </div>
          )}

        </div>

        <hr />

        <div className="filter-section">
          <h4>CATEGORY</h4>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category: e.target.value,
                subcategory: ""
              }))
            }
          >
            <option value="">All</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h4>SUBCATEGORY</h4>

          <select
            value={filters.subcategory}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                subcategory: e.target.value
              }))
            }
          >
            <option value="">All</option>

            {subcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h4>PRICE</h4>

          <div className="price-row">
            <select
              value={filters.min}
              onChange={(e) =>
                setFilters((f) => ({ ...f, min: e.target.value }))
              }
            >
              <option value="">Min</option>
              <option value="500">₹500</option>
              <option value="1000">₹1000</option>
              <option value="2000">₹2000</option>
            </select>

            <span className="dash">-</span>

            <select
              value={filters.max}
              onChange={(e) =>
                setFilters((f) => ({ ...f, max: e.target.value }))
              }
            >
              <option value="">Max</option>
              <option value="1000">₹1000</option>
              <option value="2000">₹2000</option>
              <option value="5000">₹5000</option>
              <option value="10000">₹10000+</option>
            </select>
          </div>
        </div>

        <div className="filter-section">
          <h4>DISCOUNT</h4>

          {[70, 60, 50, 40, 20].map((d) => (
            <label key={d} className="checkbox">
              <input
                type="checkbox"
                checked={filters.discount == d}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    discount: e.target.checked ? d : ""
                  }))
                }
              />
              {d}% or more
            </label>
          ))}
        </div>

      </div>

      {/* ================= FILTER SHEET (MOBILE) ================= */}
      {showFilters && (
        <div
          className="filter-overlay"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="filter-sheet"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="filter-header">
              <h3>Filters</h3>
              <FaTimes onClick={() => setShowFilters(false)} />
            </div>

            <div className="filter-header">
              <span
                onClick={() =>
                  setFilters({
                    category: "",
                    subcategory: "",
                    min: "",
                    max: "",
                    discount: "",
                    search:"",
                  })
                }
              >
                CLEAR ALL
              </span>
            </div>

            <div className="filter-body">

              <div className="filter-section">
                <h4>CATEGORY</h4>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      category: e.target.value,
                      subcategory: ""
                    }))
                  }
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <h4>SUBCATEGORY</h4>
                <select
                  value={filters.subcategory}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      subcategory: e.target.value
                    }))
                  }
                >
                  <option value="">All</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <h4>PRICE</h4>

                <div className="price-row">
                  <select
                    value={filters.min}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, min: e.target.value }))
                    }
                  >
                    <option value="">Min</option>
                    <option value="500">₹500</option>
                    <option value="1000">₹1000</option>
                    <option value="2000">₹2000</option>
                  </select>

                  <span>-</span>

                  <select
                    value={filters.max}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, max: e.target.value }))
                    }
                  >
                    <option value="">Max</option>
                    <option value="1000">₹1000</option>
                    <option value="2000">₹2000</option>
                    <option value="5000">₹5000</option>
                    <option value="10000">₹10000+</option>
                  </select>
                </div>
              </div>

              <div className="filter-section">
                <h4>DISCOUNT</h4>

                {[70, 60, 50, 40, 20].map((d) => (
                  <label key={d}>
                    <input
                      type="checkbox"
                      checked={filters.discount == d}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          discount: e.target.checked ? d : ""
                        }))
                      }
                    />
                    {d}% or more
                  </label>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      <div className="right-section">

        <button className="filterBtn" onClick={() => setShowFilters(true)}>
          Filter
        </button>

        <div className="products-wrapper">

          <div className="products-grid">
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p className="noProducts">No products found</p>
            ) : (
              currentProducts.map((p) => (
                <div
                  key={p._id}
                  className={`product-card ${p.stock === 0 ? "out" : ""}`}
                  onClick={() => p.stock > 0 && navigate(`/product/${p._id}`)}
                >

                  <div className="image-box">
                    <div className="wishlist-icon"
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ VERY IMPORTANT
                        toggleWishlist(p);
                      }}
                    >
                      {wishlist.includes(p._id) ? (
                        <FaHeart color="red" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </div>
                    <img src={`http://localhost:5000/uploads/${p.image}`} alt="" />

                    {/* ✅ STOCK BADGE */}
                    {p.stock === 0 && (
                      <span className="stock-badge out">Out of Stock</span>
                    )}

                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="stock-badge low">Only {p.stock} left</span>
                    )}
                  </div>

                  <h4 className="product-name">{p.name}</h4>
                  <p className="subname">{p.subcategoryId?.name}</p>
                  <p>₹{p.price}</p>
                </div>
              ))
            )}
          </div>

          <div className="pagination">
  <button
    disabled={currentPage === 1}
    onClick={() => !isMobile && setCurrentPage((prev) => prev - 1)}
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
    onClick={() => !isMobile && setCurrentPage((prev) => prev + 1)}
  >
    Next
  </button>
</div>
      </div>
    </div>
</div>
</>
  );
};

export default ProductsPage;