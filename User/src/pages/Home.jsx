import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import img1 from "../assets/images/carocel1.jpg";
import img2 from "../assets/images/carocel2.jpg";
import { Link } from "react-router-dom";

const Home = () => {

  const [categories, setCategories] = useState([]);

  // FIXED ONLY THIS API URL
  useEffect(() => {
    fetch("http://localhost:5000/api/category")   
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <>
    <div className="homeContainer">
      {/*  HERO SECTION */}
      <div className="hero-section">

        <h1 className="hero-title">
          Designed To Fit Your <span>Home</span>
        </h1>

        <p className="hero-subtitle">
          Discover stylish and comfortable furniture crafted for modern living.
        </p>

        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">

          <div className="carousel-indicators">
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          </div>

          <div className="carousel-inner">

            <div className="carousel-item active">
              <img src={img2} className="d-block w-100 carousel-img" alt="Furniture" />
              <div className=" custom-caption">
                <p className="paragraph"><span style={{ background: "rgb(254, 174, 94)",fontWeight:"bold" ,}}>New</span> Arrival</p>
                <h1>
                  Choose Our Top Pick <span style={{ color: "rgb(241, 137, 34)" }}>Furniture</span>
                </h1>
                <p className="paragraph">
                  Experience comfort like never before with our <br/>
                  stylish and durable furniture.
                </p>
                <Link to="/productpage" className="btn btn-dark">
                  Buy Now
                </Link>
              </div>
            </div>

            <div className="carousel-item">
              <img src={img1} className="d-block w-100 carousel-img" alt="Sofa" />
              <div className="custom-caption" id="sofa">
                <h1>
                  Comfort <span style={{ color: "rgb(241, 137, 34)" }}>Sofa</span>
                </h1>
                <p>
                  Experience ultimate comfort with our<br/> 
                  premium quality sofas.
                </p>
                <Link to="/productpage" className="btn btn-dark">
                  shop Now
                </Link>
              </div>
            </div>

          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>

          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>

        </div>
      </div><br/><br/>
      


      {/*  CATEGORY SECTION */}
      <div className="category-section">

        <h2 className="category-title">
          Shop By <span>Categories</span>
        </h2>

        <div className="category-grid">

         {categories.map((cat) => (
          <Link 
            to={`/productpage?category=${cat._id}`}  // ✅ FIXED
            key={cat._id} 
            className="category-card"
          >
            <img 
              src={`http://localhost:5000/uploads/${cat.image}`} 
              alt={cat.name} 
            />
            <p>{cat.name}</p>
          </Link>
        ))}

        </div>

      </div>

      


      {/* FEATURES SECTION */}
      <div className="features-section">

        <h2 className="features-title">
          Why Choose <span>Us</span>
        </h2>

        <div className="features-container">

          <div className="feature-box">
            <div className="icon">🛋️</div>
            <h4>Modern Design</h4>
            <p>Stylish and trendy furniture crafted for modern homes.</p>
          </div>

          <div className="feature-box">
            <div className="icon">🎨</div>
            <h4>Creative Design</h4>
            <p>Unique and elegant designs to match your lifestyle.</p>
          </div>

          <div className="feature-box">
            <div className="icon">🎧</div>
            <h4>24/7 Support</h4>
            <p>We are always available to assist you anytime.</p>
          </div>

          <div className="feature-box">
            <div className="icon">💎</div>
            <h4>Premium Quality</h4>
            <p>High-quality materials ensuring durability and comfort.</p>
          </div>

          <div className="feature-box">
            <div className="icon">📦</div>
            <h4>Safe Delivery</h4>
            <p>Secure packaging and fast delivery to your doorstep.</p>
          </div>

          <div className="feature-box">
            <div className="icon">💰</div>
            <h4>Affordable Price</h4>
            <p>Best furniture at competitive and budget-friendly prices.</p>
          </div>

          <div className="feature-box">
            <div className="icon">🪵</div>
            <h4>Eco-Friendly Materials</h4>
            <p>Sustainable wood and materials for a better environment.</p>
          </div>

          <div className="feature-box">
            <div className="icon">🚚</div>
            <h4>Fast Shipping</h4>
            <p>Quick and reliable delivery service across all locations.</p>
          </div>

        </div>

      </div>
      </div>
    </>
  );
};

export default Home;