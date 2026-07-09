import React, { useState, useEffect } from "react";
import "../styles/Manage_orders.css";
import { useLocation } from "react-router-dom";
import { showError, showSuccess } from "../utils/toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [editId, setEditId] = useState(null);
  const [statusValue, setStatusValue] = useState("");

  const [viewMode, setViewMode] = useState("table"); // table | grid
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const API = "https://sarathi-furniture.onrender.com/api/orders";

  const [currentPage, setCurrentPage] = useState(1);
  const gridPerPage = 8; // 👉 change size here
  const tablePerPage = 10; // 👉 change size here
  

  const itemsPerPage = viewMode === "grid" ? gridPerPage : tablePerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);
  /* ================= FETCH ================= */

  useEffect(() => {
    setSearch(query || "");
  }, [query]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  };

  /* ================= CLICK EDIT ================= */
  const handleEdit = (orderId, itemIndex, status) => {
    setEditId(`${orderId}-${itemIndex}`);
    setStatusValue(status);
  };

  const handleSave = (id, itemIndex, currentStatus) => {

    // STATUS FLOW ORDER
    const statusFlow = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    // current position
    const currentIndex = statusFlow.indexOf(currentStatus);

    // selected position
    const newIndex = statusFlow.indexOf(statusValue);

    // ❌ PREVENT GOING BACK
    if (
      newIndex < currentIndex &&
      statusValue !== "Cancelled"
    ) {
      showError("Cannot move order status backward ");
      return;
    }

    // ❌ DELIVERED CANNOT CHANGE
    if (currentStatus === "Delivered") {
      showError("Delivered order cannot be changed ");
      return;
    }

    // ❌ CANCELLED CANNOT CHANGE
    if (currentStatus === "Cancelled") {
      showError("Cancelled order cannot be changed ");
      return;
    }

    // ✅ UPDATE
    fetch(`${API}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: statusValue,itemIndex }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchOrders();
        setEditId(null);
        showSuccess("Order Status Updated ");
      })
      .catch((err) => console.log(err));
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    setEditId(null);
    setStatusValue("");
  };

  /* ================= FILTER ================= */
  const filteredOrders = orders.filter((order) => {

    // ✅ CHECK ITEM STATUS INSTEAD OF ORDER STATUS
    const matchesTab =
      activeTab === "All"
        ? true
        : order.items?.some(
            (item) =>
              item.status?.toLowerCase() ===
              activeTab.toLowerCase()
          );

    // ✅ SEARCH
    const searchText = (
      (order.userId?.name || "") +
      " " +
      order._id +
      " " +
      order.items
        ?.map(
          (i) =>
            `${i.name || ""} ${
              i.productId?.subcategoryId?.name || ""
            }`
        )
        .join(" ")
    ).toLowerCase();

    const finalSearch = (
      query || search || ""
    ).toLowerCase();

    const matchesSearch =
      searchText.includes(finalSearch);

    return matchesTab && matchesSearch;

  }).reverse();

   const allItems = filteredOrders.flatMap((order) =>
  order.items?.map((item, index) => ({
    orderId: order._id,
    customer: order.userId?.name,
    item,
    itemIndex: index,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    address: order.deliveryAddress,
    shippingCharge: order.shippingCharge || 0,
  })) || []
);

   const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = allItems.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(allItems.length / itemsPerPage);

 


  // const indexOfLast = currentPage * itemsPerPage;
  // const indexOfFirst = indexOfLast - itemsPerPage;

  // const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  // const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // const flattenedOrders = currentOrders.flatMap((order) =>
  //   order.items
  //     ?.filter((item) =>
  //       activeTab === "All"
  //         ? true
  //         : item.status?.toLowerCase() === activeTab.toLowerCase()
  //     )
  //     .map((item, index) => ({
  //       orderId: order._id,
  //       customer: order.userId?.name,
  //       item,
  //       itemIndex: index,
  //       totalAmount: order.totalAmount,
  //       paymentMethod: order.paymentMethod,
  //       address: order.deliveryAddress,
  //     }))
  // );

 
  return (
    <div className="ord-top-panel">

     <div className="ord-fixed-top">

      <div className="ord-top-row">
        <h2>Order Management</h2>

        {/* VIEW BUTTONS */}
        <div className="ord-view-toggle">
          <button
            className={viewMode === "table" ? "active" : ""}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>

          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>

          {/* <button
              className={viewMode === "card" ? "active" : ""}
              onClick={() => setViewMode("card")}
            >
              Grid
            </button> */}
        </div>

      </div>

      <div className="order-tabs">
        {["All","Pending","Processing","Shipped","Delivered","Cancelled"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active-tab" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="ord-search"
        placeholder="Search customer, order id, product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>

      {/* ================= MOBILE CARDS ================= */}
      {viewMode === "grid" && (
        <div className="ordersGrid">
          {currentItems.map((row) => (
            <div className="orderCard" key={row.orderId}>
              <h4>Order #{row.orderId.slice(-6)}</h4>

              <p><b>Customer:</b> {row.customer}</p>

              <div className="mobileProducts">
                <b>Product:</b>

                <div className="mobileProductBox">
                  <img
                    src={row.item.image || row.item.productId?.image}
                    alt=""
                    className="mobileProductImg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />

                  <div>
                    <p className="pname">
                      {row.item.name || row.item.productId?.name}
                    </p>

                    <p className="pcat">
                      {row.item.productId?.categoryId?.name}
                    </p>

                    <p className="psub">
                      {row.item.productId?.subcategoryId?.name}
                    </p>
                  </div>
                </div>
              </div>

            <p>
  <b>Total:</b> ₹{
    row.item.status === "Cancelled"
      ? 0
      : Math.round(
          (
            (row.item.price || 0) *
            (row.item.quantity || 1)
          ) +
          (
            (
              (row.item.price || 0) *
              (row.item.quantity || 1) *
              18
            ) / 100
          ) +
          (
            row.itemIndex === 0
              ? (row.shippingCharge || 0)
              : 0
          )
        )
  }
</p>

            <p>
  <b>Total:</b> ₹{
    row.item.status === "Cancelled"
      ? 0
      : Math.round(
          (
            (row.item.price || 0) *
            (row.item.quantity || 1)
          ) +
          (
            (
              (row.item.price || 0) *
              (row.item.quantity || 1) *
              18
            ) / 100
          ) +
          (row.item.shippingCharge || 0)
        )
  }
</p>

             <p>
                <b>Status:</b>{" "}

                {editId === `${row.orderId}-${row.itemIndex}` ? (
                  <select
                    value={statusValue}
                    onChange={(e) => {
                      const newStatus = e.target.value;

                      setStatusValue(newStatus);

                      // auto save immediately
                      fetch(`${API}/${row.orderId}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          status: newStatus,
                          itemIndex: row.itemIndex,
                        }),
                      })
                        .then((res) => res.json())
                        .then(() => {
                          fetchOrders();
                          setEditId(null);
                          showSuccess("Order Status Updated ");
                        })
                        .catch((err) => console.log(err));
                    }}
                    className={`status-${statusValue?.toLowerCase() || "pending"}`}
                  >
                    {row.item.status === "Pending" && (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    )}

                    {row.item.status === "Processing" && (
                      <>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    )}

                    {row.item.status === "Shipped" && (
                      <>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </>
                    )}

                    {row.item.status === "Delivered" && (
                      <option value="Delivered">Delivered</option>
                    )}

                    {row.item.status === "Cancelled" && (
                      <option value="Cancelled">Cancelled</option>
                    )}
                  </select>
                ) : (
                  <span
                    className={`ord-status ord-${row.item.status?.toLowerCase() || "pending"}`}
                  >
                    {row.item.status}
                  </span>
                )}
              </p>

              <button
                onClick={() =>
                  handleEdit(row.orderId, row.itemIndex, row.item.status)
                }
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {viewMode === "table" && (
        <div className="tableWrapper">
          <table className="ordersTable">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
  {currentItems.map((row) => (
    <tr key={`${row.orderId}-${row.itemIndex}`}>
      
      {/* ORDER ID */}
      <td>{row.orderId}</td>

      {/* CUSTOMER */}
      <td>{row.customer || "User"}</td>

      {/* PRODUCT */}
      <td>
        <div className="tableProductBox">
          <img
            src={row.item.image || row.item.productId?.image}
            className="tableProductImg"
            alt=""
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />

          <div>
            <div>{row.item.name || row.item.productId?.name}</div>
            <div>{row.item.productId?.categoryId?.name}</div>
            <div>{row.item.productId?.subcategoryId?.name}</div>
          </div>
        </div>
      </td>

      {/* QTY */}
      <td>{row.item.quantity}</td>

      {/* TOTAL */}
      {/* TOTAL */}
<td>
  ₹{
    row.item.status === "Cancelled"
      ? 0
      : Math.round(
          (
            (row.item.price || 0) *
            (row.item.quantity || 1)
          ) +
          (
            (
              (row.item.price || 0) *
              (row.item.quantity || 1) *
              18
            ) / 100
          ) +
          (
            row.itemIndex === 0
              ? (row.shippingCharge || 0)
              : 0
          )
        )
  }
</td>

      {/* PAYMENT */}
      <td>
        <span
          className={
            row.paymentMethod === "online"
              ? "payment-online"
              : "payment-cod"
          }
        >
          {row.paymentMethod === "online"
            ? "Prepaid"
            : "Cash on Delivery"}
        </span>
      </td>

      {/* STATUS */}
      <td>
        {editId === `${row.orderId}-${row.itemIndex}` ? (
          <select
            value={statusValue}
            onChange={(e) => {
              const newStatus = e.target.value;
              setStatusValue(newStatus);

              fetch(`${API}/${row.orderId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: newStatus,
                  itemIndex: row.itemIndex,
                }),
              })
                .then((res) => res.json())
                .then(() => {
                  fetchOrders();
                  setEditId(null);
                  showSuccess("Order Status Updated ");
                })
                .catch((err) => console.log(err));
            }}
            className={`status-${statusValue?.toLowerCase() || "pending"}`}
          >
            {row.item.status === "Pending" && (
              <>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Cancelled">Cancelled</option>
              </>
            )}

            {row.item.status === "Processing" && (
              <>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Cancelled">Cancelled</option>
              </>
            )}

            {row.item.status === "Shipped" && (
              <>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </>
            )}

            {row.item.status === "Delivered" && (
              <option value="Delivered">Delivered</option>
            )}

            {row.item.status === "Cancelled" && (
              <option value="Cancelled">Cancelled</option>
            )}
          </select>
        ) : (
          <span className={`ord-status ord-${row.item.status?.toLowerCase()}`}>
            {row.item.status}
          </span>
        )}
      </td>

      {/* ADDRESS */}
      <td style={{ fontSize: "12px" }}>
        {row.address ? (
          <>
            <div>{row.address.fullName}</div>
            <div>{row.address.locality}</div>
            <div>{row.address.village}</div>
            <div>
              {row.address.city}, {row.address.state}
            </div>
            <div>{row.address.pincode}</div>
          </>
        ) : (
          "No Address"
        )}
      </td>

      {/* ACTION */}
      <td>
        <button style={{color:"white"}}
          onClick={() =>
            handleEdit(row.orderId, row.itemIndex, row.item.status)
          }
        >
          Edit
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
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
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;