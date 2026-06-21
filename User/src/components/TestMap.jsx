import React from "react";

const TestMap = () => {
  return (
    <div className="tracking-map">
      <h3 className="tracking-title">Live Order Tracking</h3>

      <iframe
        title="Live Tracking"
        width="100%"
        height="250"
        style={{
          border: 0,
          borderRadius: "12px",
        }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Mangalore"
      ></iframe>

      <div className="tracking-live">
        🚚 Driver is near your location
      </div>
    </div>
  );
};

export default TestMap;