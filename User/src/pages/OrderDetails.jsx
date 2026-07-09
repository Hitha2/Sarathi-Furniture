import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/OrderDetails.css";
import jsPDF from "jspdf";

import TestMap from "../components/TestMap";
import { FaStar } from "react-icons/fa";
import logo from "../assets/images/logo.jpg";
import { showError, showSuccess } from "../utils/toast";

const OrderDetails = () => {
  const { orderId, productId } = useParams();
  const [order, setOrder] = useState(null);
  const [selectedItemStock, setSelectedItemStock] = useState(0);

  // ✅ NEW STATES (ONLY ADDITION)
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({});
  const [showBill, setShowBill] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const formatPrice = (value) => {
    return Math.round(value || 0);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(
        `https://sarathi-furniture.onrender.com/api/orders/${orderId}`
      );
      const data = await res.json();
      setOrder(data);
      setAddress(data.deliveryAddress || {});

      const existingReview = data.items.find(
        (item) =>
          String(item.productId?._id || item.productId) === String(productId)
      );
      // ✅ FETCH LATEST PRODUCT STOCK
      if (existingReview) {
        const pid =
          existingReview.productId?._id ||
          existingReview.productId;

        const stockRes = await fetch(
          `https://sarathi-furniture.onrender.com/api/product/${pid}`
        );

        const stockData = await stockRes.json();

        setSelectedItemStock(stockData.stock || 0);
      }

      if (existingReview?.rating) {
        setRating(existingReview.rating);
        setReview(existingReview.review || "");
        setAlreadyReviewed(true);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <p>Loading...</p>;

const selectedItem = order.items.find(
  (item) =>
    String(item.productId?._id || item.productId) === String(productId)
);

// remove cancelled items
// ✅ ONLY SELECTED PRODUCT

const itemSubtotal =
  (selectedItem?.price || 0) *
  (selectedItem?.quantity || 1);

const itemGST = itemSubtotal * 0.18;

const activeItems = order.items.filter(
  (item) => item.status !== "Cancelled"
);

const firstActiveProductId =
  activeItems[0]?.productId?._id ||
  activeItems[0]?.productId;

const itemShipping =
  String(firstActiveProductId) === String(productId)
    ? order.shippingCharge || 0
    : 0;

const productDiscount =
  selectedItem?.discount
    ? ((selectedItem.originalPrice || selectedItem.price) *
        selectedItem.quantity *
        selectedItem.discount) /
      100
    : 0;

const grandTotal =
  itemSubtotal -
  productDiscount +
  itemGST +
  itemShipping;

  // STATUS LOGIC
  // ✅ USE ITEM STATUS INSTEAD OF ORDER STATUS
const currentStatus =
  selectedItem?.status ||
  order.status ||
  "Pending";

const isPending = currentStatus === "Pending";

const isProcessing =
  currentStatus === "Processing";

const isShipped =
  currentStatus === "Shipped" ||
  currentStatus === "Delivered";

const isDelivered =
  currentStatus === "Delivered";

const isCancelled =
  currentStatus === "Cancelled";

  // ✅ ✅ ONLY FIX ADDED HERE
  // const createdDate = new Date(order.createdAt);
  // const deliveryDate = new Date(
  //   createdDate.getTime() + 10 * 24 * 60 * 60 * 1000
  // );
  const createdDate = order.createdAt
  ? new Date(order.createdAt)
  : new Date(); // fallback if missing

const deliveryDate = new Date(createdDate);
deliveryDate.setDate(createdDate.getDate() + 8); // ✅ 8 days later


const downloadInvoice = () => {
  const doc = new jsPDF();

  // ================= COLORS =================
  const primary = [47, 93, 91];
  const dark = [40, 40, 40];
  const gray = [120, 120, 120];

  // ================= HEADER BG =================
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 20, "F");

  // ================= LOGO =================
  doc.addImage(logo, "jpg", 10, 6, 18, 10);

  // ================= COMPANY =================
  doc.setTextColor(255, 255, 255);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Sarathi Furniture", 40, 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(
    "Premium Furniture & Home Decor",
    40,
    17
  );

  // ================= INVOICE TITLE =================
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  // doc.text("INVOICE", 160, 20);

  // ================= MAIN BOX =================
  doc.setDrawColor(220);
  doc.setFillColor(250, 250, 250);

  doc.roundedRect(12, 42, 186, 58, 3, 3, "FD");

  // ================= LEFT → INVOICE DETAILS =================
  doc.setTextColor(...dark);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", 18, 54);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);

  doc.text(
    `Invoice No : INV-${order._id.slice(-6)}`,
    18,
    65
  );

  doc.text(
    `Order Date : ${new Date(
      order.createdAt
    ).toLocaleDateString()}`,
    18,
    74
  );

  doc.text(
    `Payment : ${
      order.paymentMethod === "online"
        ? "Online Payment"
        : "Cash on Delivery"
    }`,
    18,
    83
  );

  doc.text(
    `Status : ${currentStatus}`,
    18,
    92
  );

  // ================= CENTER DIVIDER =================
  doc.setDrawColor(220);
  doc.line(105, 50, 105, 92);

  // ================= RIGHT → CUSTOMER DETAILS =================
  doc.setTextColor(...dark);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details", 115, 54);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);

  doc.text(
    `${order.deliveryAddress?.fullName || ""}`,
    115,
    65
  );

  doc.text(
    `${order.deliveryAddress?.locality || ""}`,
    115,
    74
  );

  doc.text(
    `${order.deliveryAddress?.village || ""}`,
    115,
    82
  );

 doc.text(
    `${order.deliveryAddress?.city || ""}, ${
      order.deliveryAddress?.state || ""
    }`,
    115,
    90
  );

  doc.text(
    `PIN : ${
      order.deliveryAddress?.pincode || ""
    }`,
    115,
    98
  );

  // ================= PRODUCT TABLE =================
  let y = 115;

  // TABLE HEADER
  doc.setFillColor(...primary);
  doc.rect(14, y, 180, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  doc.text("Product", 18, y + 7);
  doc.text("Qty", 110, y + 7);
  doc.text("Price", 140, y + 7);
  doc.text("Total", 170, y + 7);

  y += 15;

  // TABLE ROWS
  doc.setFont("helvetica", "normal");

  [selectedItem].forEach((item) => {

   const price = item.originalPrice || item.price;
    const discount = item.discount || 0;

    const finalPrice = price - (price * discount) / 100;
    const total = finalPrice * item.quantity;

    doc.setTextColor(...dark);

    doc.text(
      item.name || "Product",
      18,
      y
    );

    doc.text(
      String(item.quantity),
      112,
      y
    );

    doc.text(
      `Rs.${formatPrice(item.price)}`,
      140,
      y
    );

    doc.text(
      `Rs.${formatPrice(total)}`,
      170,
      y
    );

    // row line
    doc.setDrawColor(235);
    doc.line(14, y + 4, 194, y + 4);

    y += 12;
  });

  // ================= TOTAL SECTION =================
  y += 10;

  doc.setFillColor(248, 248, 248);

  doc.roundedRect(
    120,
    y,
    74,
    42,
    2,
    2,
    "FD"
  );

  y += 10;

  doc.setTextColor(...gray);
  doc.setFontSize(11);

  doc.text(
  `Rs.${formatPrice(
    itemSubtotal - productDiscount
  )}`,
  170,
  y
);

  y += 8;

  doc.text("Discount", 126, y);
  doc.text(
    `- Rs.${formatPrice(
      productDiscount
    )}`,
    170,
    y
  );

  y += 8;

  doc.text(
  `Rs.${formatPrice(
    itemShipping
  )}`,
  170,
  y
);

  y += 8;

  doc.text("GST (18%)", 126, y);
  doc.text(`Rs.${formatPrice(itemGST)}`,
    170,
    y
  );

  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);

  doc.text("Grand Total", 126, y);

  doc.text(
    `Rs.${formatPrice(
      grandTotal
    )}`,
    170,
    y
  );

  // ================= PAYMENT STATUS =================
  y += 20;

  if (order.paymentMethod === "online") {

    doc.setTextColor(0, 128, 0);

    doc.text(
      "Payment Status : PAID",
      14,
      y
    );

  } else {

    doc.setTextColor(255, 140, 0);

    doc.text(
      "Payment Status : CASH ON DELIVERY",
      14,
      y
    );
  }

  // ================= FOOTER =================
  y += 20;

  doc.setDrawColor(220);
  doc.line(14, y, 194, y);

  y += 10;

  doc.setTextColor(...gray);

  doc.setFontSize(10);

  doc.text(
    "Thank you for shopping with Sarathi Furniture",
    14,
    y
  );

  doc.text(
    "support@sarathifurniture.com",
    14,
    y + 7
  );

  doc.text(
    "+91 9876543210",
    150,
    y + 7
  );

  // ================= SAVE =================
  doc.save(`Invoice_${order._id}.pdf`);
};


const confirmCancelOrder = async () => {

  try {

    const res = await fetch(
      `https://sarathi-furniture.onrender.com/api/orders/${order._id}/items/${productId}/cancel`,
      {
        method: "PUT",
      }
    );

    if (res.ok) {

      setShowCancelConfirm(false);

      showSuccess("Product cancelled successfully ");

     setOrder((prev) => ({
  ...prev,

  items: prev.items.map((item) => {

    if (
      String(item.productId?._id || item.productId) ===
      String(productId)
    ) {
      return {
        ...item,
        status: "Cancelled",
      };
    }

    return item;
  }),
}));

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } else {
      showError("Failed to cancel product");
    }

  } catch (err) {
    showError("Server error");
  }
};


const getDiscountedPrice = (item) => {
  const price = item.originalPrice || item.price;
  const discount = item.discount || 0;

  return price - (price * discount) / 100;
};


  return (
    <>
    

      <div className="order-details">

        <h2 className="title">Order Details</h2>

        {/* PRODUCT */}
       {/* PRODUCTS */}
        <div className="product-box">

       <img
          src={selectedItem?.productId?.image || selectedItem?.image}
          alt={selectedItem?.name || "Product"}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300";
          }}
        />
        <div>
          <h4>Order #{order._id.slice(-8)}</h4>

          <p>
            {selectedItem?.productId?.name || selectedItem?.name}
          </p>

          <p className="light">
            Qty: {selectedItem?.quantity}
          </p>

          <div className="payment-type">
            {/* {selectedItemStock <= 0 && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Currently Out of Stock
              </p>
            )} */}

            {order.paymentMethod === "online"
              ? `Prepaid ₹${formatPrice(grandTotal)}`
              : `Cash ₹${formatPrice(grandTotal)}`}
          </div>
        </div>

      </div>

        {/* STATUS */}
        <div className="status-box">
         <h3 className="green">
          {isCancelled
            ? "Cancelled"
            : isDelivered
            ? "Delivered"
            : isShipped
            ? "Arriving Soon"
            : isProcessing
            ? "Processing"
            : "Order Placed"}
        </h3>

          {/* ✅ FIXED LINE ONLY */}
          <p>Delivery by {deliveryDate.toDateString()}</p>

        </div>

        {/* TIMELINE */}
        <div className="timeline">
          <div className="step active">
            <div className="circle">✓</div>
            <p>Ordered</p>
          </div>

          <div className={`line ${isProcessing || isShipped || isDelivered ? "active" : ""}`}></div>

            <div className={`step ${isProcessing || isShipped || isDelivered ? "active" : ""}`}>
              <div className="circle">⚙️</div>
              <p>Processing</p>
            </div>

          <div className={`line ${isShipped ? "active" : ""}`}></div>

          <div className={`step ${isShipped ? "active" : ""}`}>
            <div className="circle">✓</div>
            <p>Shipped</p>
          </div>

          <div className={`line ${isDelivered ? "active" : ""}`}></div>

          <div className={`step ${isDelivered ? "active" : ""}`}>
            <div className="circle">🚚</div>
            <p>Out for Delivery</p>
          </div>

          <div className={`line ${isDelivered ? "active" : ""}`}></div>

          <div className={`step ${isDelivered ? "active" : ""}`}>
            <div className="circle">✓</div>
            <p>Delivered</p>
          </div>
        </div>

        {/* ADDRESS BOX */}
        <div className="address-box">
          <div className="address-header">
            <h4>Delivery Address</h4>

            {isPending && !isEditingAddress && (
              <span
                className="change-btn-text"
                onClick={() => setIsEditingAddress(true)}
              >
                CHANGE
              </span>
            )}
          </div>

          {isEditingAddress ? (
            <div className="address-container">

              <input
                value={address.fullName || ""}
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
                placeholder="Full Name"
              />

              <input
                value={address.phone || ""}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                placeholder="Phone"
              />

              <input
                value={address.pincode || ""}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                placeholder="Pincode"
              />

              <input
                value={address.locality || ""}
                onChange={(e) =>
                  setAddress({ ...address, locality: e.target.value })
                }
                placeholder="House No, Area, Street, Landmark"
              />

              <input
                value={address.village || ""}
                onChange={(e) =>
                  setAddress({ ...address, village: e.target.value })
                }
                placeholder="Village"
              />

              <textarea
                value={address.city || ""}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="City"
              />

              <input
                value={address.state || ""}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                placeholder="State"
              />

              <div className="address-buttons">
                <button
                  className="save-btn"
                  onClick={async () => {
                    const res = await fetch(
                      `https://sarathi-furniture.onrender.com/api/orders/${order._id}/address`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          deliveryAddress: address,
                        }),
                      }
                    );

                    if (res.ok) {
                      showSuccess("Address Updated");
                      setIsEditingAddress(false);
                      window.location.reload();
                    }
                  }}
                >
                  SAVE
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setIsEditingAddress(false)}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              <p><b>{order.deliveryAddress?.fullName || "No Name"}</b></p>
              <p>{order.deliveryAddress?.locality || ""}</p>
                <p>{order.deliveryAddress?.village || ""}</p>
                <p>
                  {order.deliveryAddress?.city || ""},{" "}
                  {order.deliveryAddress?.state || ""} -{" "}
                  {order.deliveryAddress?.pincode || ""}
                </p>
                <p>📞 {order.deliveryAddress?.phone || ""}</p>
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div className="order-actions">

          {(isPending || isProcessing )&& (
            <div className="cancel-row">
              <p>Cancellation available till shipping!</p>

              <button
              className="cancel-outline-btn"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Order
            </button>
            </div>
          )}

          {currentStatus === "Shipped" && (
            <>
              <div className="info-row">
                <p>Order shipped, cancel unavailable.</p>

                <span
                  className="know-more"
                  onClick={() =>
                    showSuccess(
                      "This order has already been shipped and handed over to our delivery partner. Cancellation is no longer available once shipment begins."
                    )
                  }
                >
                  KNOW MORE
                </span>
              </div>

              <div className="info-row">
                <p>Address change unavailable!</p>

                <span
                  className="know-more"
                  onClick={() =>
                   showSuccess(
                      "Delivery address cannot be modified after shipment because the package is already in transit."
                    )
                  }
                >
                  KNOW MORE
                </span>
              </div>
            </>
          )}

          {currentStatus === "Delivered" && (
            <div className="disabled-msg">
              <p>✅ Order delivered</p>
              <p>❌ Cannot cancel or change address</p>
            </div>
          )}

          {currentStatus === "Cancelled" && (
            <div className="disabled-msg">
              <p>❌ Order cancelled</p>
            </div>
          )}
        </div>
          
       {!isCancelled && (
          <div className="bill-toggle-box">
            <div className="bill-top" onClick={() => setShowBill(!showBill)}>
              <h4>Total Amount: Rs.{formatPrice(grandTotal)}</h4>
              <span className="view-bill-btn">
                {showBill ? "Hide Bill " : "View Bill "}
              </span>
            </div>

            {showBill && (
              <div className="bill-details-dropdown">

                {order.productSavings > 0 && (
                  <div className="save-banner">
                    🎉 You saved ₹{formatPrice(order.productSavings)} on this order
                  </div>
                )}

                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>
                    Rs.{formatPrice(itemSubtotal - productDiscount)}
                  </span>
                </div>

                <div className="bill-row">
                  <span>Product Discount</span>
                  <span>- Rs.{formatPrice(order.productSavings)}</span>
                </div>

                <div className="bill-row">
                  <span>Shipping Charge</span>
                 <span>Rs.{formatPrice(itemShipping)}</span>
                </div>

                <div className="bill-row">
                  <span>GST (18%)</span>
                  <span>Rs.{formatPrice(itemGST)}</span>
                </div>

                <hr />

                <div className="bill-row grand-bill">
                  <span>Grand Total</span>
                  <span>Rs.{formatPrice(grandTotal)}</span>
                </div>



                {/* DOWNLOAD BUTTON */}
                <button
                  className="downloadInvoiceBtn"
                  onClick={downloadInvoice}
                >
                  Download Invoice
                </button>

              </div>
            )}
          </div>
        )}

        {/* PRODUCT REVIEW */}
        {currentStatus === "Delivered" && (
          <div className="rating-box">

            <h3>Rate This Product</h3>

            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={28}
                  className={
                    star <= (hover || rating)
                      ? "star active-star"
                      : "star"
                  }
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="review-textarea"
              disabled={alreadyReviewed}
            />

            {!alreadyReviewed ? (
              <button
                className="submit-review-btn"
                onClick={async () => {

                  if (rating === 0) {
                    showError("Please select rating");
                    return;
                  }

                  try {

                    const res = await fetch(
                      `https://sarathi-furniture.onrender.com/api/orders/${order._id}/review`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          productId:
                            selectedItem?.productId?._id ||
                            selectedItem?.productId,
                          rating,
                          review,
                        }),
                      }
                    );

                    if (res.ok) {
                      showSuccess("Review submitted ");
                      setAlreadyReviewed(true);
                    } else {
                      showError("Failed to submit review");
                    }

                  } catch (error) {
                    console.log(error);
                    showError("Something went wrong");
                  }
                }}
              >
                Submit Review
              </button>
            ) : (
              <p className="review-done">
                ✅ Review already submitted
              </p>
            )}
          </div>
        )}


        {showCancelConfirm && (
  <div className="overlay">

    <div className="confirm-box">

      <p>
        Are you sure you want to cancel this order?
      </p>

      <div className="confirm-actions">

        <button
          className="btn-yes"
          onClick={confirmCancelOrder}
        >
          Yes
        </button>

        <button
          className="btn-no"
          onClick={() => {
            setShowCancelConfirm(false);
            showSuccess("Order not cancelled");
          }}
        >
          No
        </button>

      </div>

    </div>

  </div>
)}

      </div>
    </>
  );
};

export default OrderDetails;