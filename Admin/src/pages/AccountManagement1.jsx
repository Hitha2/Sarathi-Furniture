import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AccountManagement1.css";

const AccountManagement1 = () => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ TABLE / GRID VIEW
  const [viewMode, setViewMode] = useState("table");

  // ✅ PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const gridPerPage = 6;
  const tablePerPage = 10;

  const itemsPerPage =
    viewMode === "grid"
      ? gridPerPage
      : tablePerPage;

  useEffect(() => {
    fetchOrders();
  }, [year, month, date]);

  // ✅ RESET PAGE
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, year, month, date, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // const params = {};

      // if (year) params.year = year;
      // if (month) params.month = month;
      // if (date) params.date = date;

      // const res = await axios.get(
      //   "http://localhost:5000/api/orders/report",
      //   { params }
      // );


        const res = await axios.get(
          "https://sarathi-furniture.onrender.com/api/orders/report"
        );

      setOrders(res.data);
    } catch (err) {
      console.log(
        "Error fetching orders:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ PAGINATION LOGIC
  const indexOfLast =
    currentPage * itemsPerPage;

  const indexOfFirst =
    indexOfLast - itemsPerPage;

  // ✅ REMOVE CANCELLED ORDERS
 // ✅ REMOVE ONLY CANCELLED PRODUCTS
  const validOrders = orders.map((order) => {

    const validItems = (order.items || []).filter(
      (item) =>
        item.status?.trim().toLowerCase() !== "cancelled"
    );

    return {
      ...order,
      items: validItems,
    };

  })
  .filter((order) => order.items.length > 0);

  // ✅ SEARCH FILTER
  const filteredOrders = validOrders.filter(
  (item) => {
    const orderDate = new Date(
      item.createdAt
    );

    // ✅ YEAR FILTER
    if (
      year &&
      orderDate.getFullYear() !==
        Number(year)
    ) {
      return false;
    }

    // ✅ MONTH FILTER
    if (
      month &&
      orderDate.getMonth() + 1 !==
        Number(month)
    ) {
      return false;
    }

    // ✅ DATE FILTER
    if (date) {
      const selectedDate =
        new Date(date);

      if (
        orderDate.toDateString() !==
        selectedDate.toDateString()
      ) {
        return false;
      }
    }

    // ✅ SEARCH FILTER
    const customerName =
      item.deliveryAddress?.fullName
        ?.toLowerCase()
        .trim() || "";

    const productNames =
      item.items
        ?.map((p) =>
          p.name?.toLowerCase()
        )
        .join(" ") || "";

    const searchValue =
      search.toLowerCase().trim();

    return (
      customerName.includes(
        searchValue
      ) ||
      productNames.includes(
        searchValue
      )
    );
  }
);

  // ✅ SORT ORDERS
  const sortedOrders = [
    ...filteredOrders,
  ].sort(
    (a, b) =>
      new Date(a.createdAt) -
      new Date(b.createdAt)
  );

  // ✅ GET ORDER TOTAL
  // ✅ GET TOTAL WITHOUT CANCELLED ITEMS
   // ✅ ACCOUNTING TOTAL
const getOrderTotal = (order) => {

  let total = 0;

  (order.items || []).forEach((item) => {

    // ❌ skip cancelled
    if (
      item.status?.toLowerCase() === "cancelled"
    ) {
      return;
    }

    // ✅ COD count only delivered
    if (
      order.paymentMethod?.toLowerCase() === "cod" &&
      item.status?.toLowerCase() !== "delivered"
    ) {
      return;
    }

    const subtotal =
      (item.price || 0) *
      (item.quantity || 1);

    const gst = subtotal * 0.18;

    // ✅ shipping for each product
    const shipping =
      order.shippingCharge || 0;

    total += subtotal + gst + shipping;
  });

  return Math.round(total);
};

  // ✅ OPENING BALANCE
  let openingBalance = 0;

  const previousOrders =
    validOrders.filter((order) => {
      const orderDate = new Date(
        order.createdAt
      );

      // ✅ DATE FILTER
      if (date) {
        return (
          orderDate < new Date(date)
        );
      }

      // ✅ MONTH + YEAR FILTER
      if (month && year) {
        return (
          orderDate.getFullYear() <
            Number(year) ||
          (orderDate.getFullYear() ===
            Number(year) &&
            orderDate.getMonth() +
              1 <
              Number(month))
        );
      }

      // ✅ YEAR FILTER
      if (year) {
        return (
          orderDate.getFullYear() <
          Number(year)
        );
      }

      return false;
    });

  // ✅ SUM PREVIOUS ORDERS
  openingBalance =
    previousOrders.reduce(
      (sum, order) =>
        sum + getOrderTotal(order),
      0
    );

  // ✅ TOTAL CREDIT
  const totalCredit =
    filteredOrders.reduce(
      (sum, order) =>
        sum + getOrderTotal(order),
      0
    );

  // ✅ CLOSING BALANCE
  const closingBalance =
    openingBalance + totalCredit;

  // ✅ PAGINATION
  const totalPages = Math.ceil(
    filteredOrders.length /
      itemsPerPage
  );

  const currentOrders =
    sortedOrders.slice(
      indexOfFirst,
      indexOfLast
    );

  // ✅ SUMMARY
  const totalSales = filteredOrders.reduce(
    (total, order) => {

      const itemCount = (order.items || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      return total + itemCount;

    },
    0
  );

 // ✅ COUNT COD ONLY AFTER DELIVERY
// ✅ COD TOTAL
const totalCOD = validOrders
  .filter(
    (order) =>
      order.paymentMethod?.toLowerCase() === "cod"
  )
  .reduce(
    (sum, order) =>
      sum + getOrderTotal(order),
    0
  );

// ✅ ONLINE TOTAL
const totalOnline = validOrders
  .filter(
    (order) =>
      order.paymentMethod?.toLowerCase() !== "cod"
  )
  .reduce(
    (sum, order) =>
      sum + getOrderTotal(order),
    0
  );

  const grandTotal =
    validOrders.reduce(
      (sum, order) =>
        sum + getOrderTotal(order),
      0
    );
  return (
    <div className="account-container">
      {/* HEADER */}
      <div className="account-fixed-header">
        <div className="acc-top-row">
          <h2>Account Management</h2>

          {/* VIEW TOGGLE */}
          <div className="ord-view-toggle">
            <button
              className={
                viewMode === "table"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("table")
              }
            >
              Table
            </button>

            <button
              className={
                viewMode === "grid"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("grid")
              }
            >
              Grid
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          className="acc-search"
          placeholder="Search customer name or product name..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* FILTERS */}
        <div className="account-filter">
          <select
            value={year}
            onChange={(e) =>
              setYear(e.target.value)
            }
          >
            <option value="">
              All Years
            </option>
            <option value="2026">
              2026
            </option>
            <option value="2025">
              2025
            </option>
          </select>

          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          >
            <option value="">
              All Months
            </option>
            <option value="1">Jan</option>
            <option value="2">Feb</option>
            <option value="3">Mar</option>
            <option value="4">Apr</option>
            <option value="5">May</option>
            <option value="6">Jun</option>
            <option value="7">Jul</option>
            <option value="8">Aug</option>
            <option value="9">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p>{totalSales}</p>
        </div>

        <div className="summary-card cod-card">
          <h3>COD Amount</h3>
          <p>₹{totalCOD}</p>
        </div>

        <div className="summary-card online-card">
          <h3>Online Amount</h3>
          <p>₹{totalOnline}</p>
        </div>

        <div className="summary-card opening-card">
          <h3>Opening Balance</h3>
          <p>₹{openingBalance}</p>
        </div>
      </div>

      {/* ================= TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div className="desktop-table">
          <div className="table-wrapper">
            <table className="account-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {currentOrders.length >
                0 ? (
                  currentOrders.map(
                    (item, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          {
                            item
                              .deliveryAddress
                              ?.fullName
                          }
                        </td>

                        <td>
                          {item.items?.map(
                            (p, i) => (
                              <div key={i}>
                                {p.name}
                              </div>
                            )
                          )}
                        </td>

                        <td>
                          {item.items?.map(
                            (i, idx) => (
                              <div key={idx}>
                                {
                                  i.quantity
                                }
                              </div>
                            )
                          )}
                        </td>

                        <td>
                          <span
                            className={`payment-badge ${item.paymentMethod}`}
                          >
                            {item.paymentMethod ===
                            "cod"
                              ? "COD"
                              : "Online"}
                          </span>
                        </td>

                      <td className="amount">
  {item.items?.map((p, i) => {

    const subtotal =
      (p.price || 0) * (p.quantity || 1);

    const gst = subtotal * 0.18;

    // ✅ SHIPPING ONLY FIRST PRODUCT
    const shipping =
      i === 0
        ? (item.shippingCharge || 0)
        : 0;

    const itemTotal =
      subtotal + gst + shipping;

    return (
      <div key={i}>
        ₹{Math.round(itemTotal)}

        <span
          style={{
            marginLeft: "8px",
            fontSize: "12px",
            color:
              p.status?.toLowerCase() === "delivered"
                ? "green"
                : p.status?.toLowerCase() === "cancelled"
                ? "red"
                : "orange",
          }}
        >
          ({p.status})
        </span>
      </div>
    );
  })}
</td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="no-data"
                    >
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="summary-cards">
            <div className="summary-card closing-card">
              <h3>Total Credit</h3>
              <p>₹{totalCredit}</p>
            </div>

            <div className="summary-card closing-card">
              <h3>Closing Balance</h3>
              <p>
                ₹{closingBalance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= GRID VIEW ================= */}
      {viewMode === "grid" && (
        <div className="usersGrid">
          {currentOrders.map(
            (item, index) => (
              <div
                className="userGridCard"
                key={index}
              >
                <h4>
                  {
                    item
                      .deliveryAddress
                      ?.fullName
                  }
                </h4>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>
                    Products:
                  </strong>
                </p>

                {item.items?.map(
                  (p, i) => (
                    <div key={i}>
                      {p.name} (
                      {p.quantity})
                    </div>
                  )
                )}

                <p>
                  <strong>
                    Payment:
                  </strong>{" "}
                  <span
                    className={`payment-badge ${item.paymentMethod}`}
                  >
                    {item.paymentMethod ===
                    "cod"
                      ? "COD"
                      : "Online"}
                  </span>
                </p>

                <p>
                  <strong>
                    Amounts:
                  </strong>
                </p>

               {item.items?.map((p, i) => {

  const subtotal =
    (p.price || 0) * (p.quantity || 1);

  const gst = subtotal * 0.18;

  // ✅ SHIPPING ONLY FIRST PRODUCT
  const shipping =
    i === 0
      ? (item.shippingCharge || 0)
      : 0;

  const itemTotal =
    subtotal + gst + shipping;

  return (
    <div key={i}>
      ₹{Math.round(itemTotal)}

      <span
        style={{
          marginLeft: "8px",
          fontSize: "12px",
          color:
            p.status?.toLowerCase() === "delivered"
              ? "green"
              : p.status?.toLowerCase() === "cancelled"
              ? "red"
              : "orange",
        }}
      >
        ({p.status})
      </span>
    </div>
  );
})}
              </div>
            )
          )}
        </div>
      )}

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(
              (p) => p - 1
            )
          }
        >
          Prev
        </button>

        {[...Array(totalPages)].map(
          (_, index) => (
            <button
              key={index}
              className={
                currentPage ===
                index + 1
                  ? "active-page"
                  : ""
              }
              onClick={() =>
                setCurrentPage(
                  index + 1
                )
              }
            >
              {index + 1}
            </button>
          )
        )}

        <button
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (p) => p + 1
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AccountManagement1;