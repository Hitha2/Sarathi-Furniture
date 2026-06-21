import React, { useEffect, useState } from "react";
import "../styles/ShippingSettings.css";
import { showSuccess } from "../utils/toast";

const ShippingSettings = ({ isOpen, onClose }) => {
  const [ratePerKm, setRatePerKm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setRatePerKm(data.shippingRatePerKm || 0);
      })
      .catch((err) => console.log(err));
  }, []);

  const saveRate = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shippingRatePerKm: Number(ratePerKm),
          }),
        }
      );

      if (res.ok) {
        showSuccess("Shipping charge updated");
        onClose();
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shippingOverlay">
      <div className="shippingModal">

        <div className="modalHeader">
          <h2>Shipping Settings</h2>

          <button
            className="closeBtn"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <p className="shippingSubTitle">
          Set delivery charge per kilometer
        </p>

        <div className="inputGroup">
          <label>1 KM Charge (₹)</label>

          <input
            type="number"
            value={ratePerKm}
            onChange={(e) => setRatePerKm(e.target.value)}
            placeholder="Eg: 10"
          />
        </div>

        <button
          className="saveBtn"
          onClick={saveRate}
        >
          Save Settings
        </button>

      </div>
    </div>
  );
};

export default ShippingSettings;