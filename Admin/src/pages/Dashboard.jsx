import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

import {
  FaBox, FaUsers, FaShoppingCart, FaRupeeSign
} from "react-icons/fa";

import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";


/* STATUS COLORS */
const STATUS_COLORS = {
  Pending: "#facc15",     // Yellow
  Processing: "#3b82f6",  // Blue
  Shipped: "#8b5cf6",     // Purple
  Delivered: "#22c55e",   // Green
  Cancelled: "#ef4444",   // Red
};

function Dashboard() {

  const [filter, setFilter] = useState("weekly");

  const [summary, setSummary] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productData, setProductData] = useState([]);
  const [stockData, setStockData] = useState([]);

  const topProducts = [
    { name: "Luxury Sofa", sales: 120 },
    { name: "Wooden Chair", sales: 95 },
    { name: "Dining Table", sales: 80 },
  ];

  useEffect(() => {
    // axios.get("http://localhost:5000/api/dashboard/stock")
    // .then(res => {
    //   setProductData(res.data);
    // });

    axios.get("https://sarathi-furniture.onrender.com/api/dashboard/stock")
    .then(res => setStockData(res.data))
    .catch(err => console.log("Stock error:", err));

    axios.get(`https://sarathi-furniture.onrender.com/api/dashboard/summary?filter=${filter}`)
      .then(res => setSummary(res.data))
      .catch(console.log);

    axios.get(`https://sarathi-furniture.onrender.com/api/dashboard/sales?filter=${filter}`)
      .then(res => {
        const formatted = res.data.map(item => ({
          name: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][item._id - 1],
          sales: Math.round(item.sales)
        }));
        setSalesData(formatted);
      })
      .catch(console.log);

    axios.get(`https://sarathi-furniture.onrender.com/api/dashboard/order-status?filter=${filter}`)
      .then(res => {
        const formatted = res.data.map(item => ({
          name: item._id,
          value: item.value
        }));
        setOrderData(formatted);
      })
      .catch(console.log);

    axios.get(`https://sarathi-furniture.onrender.com/api/dashboard/recent-orders?filter=${filter}`)
      .then(res => setOrders(res.data))
      .catch(console.log);

  }, [filter]);
  const navigate = useNavigate();

  const LOW_STOCK_LIMIT = 10;

  // ❌ Out of Stock
  const outOfStockItems = stockData.filter(item => item.stock === 0);

  // ⚠ Low Stock (exclude 0)
  const lowStockItems = stockData.filter(
    item => item.stock > 0 && item.stock <= LOW_STOCK_LIMIT
  );
  
  const getOrderStatus = (order) => {
    const statuses = (order.items || []).map(i => i.status);

    if (statuses.every(s => s === "Cancelled")) return "Cancelled";
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.includes("Shipped")) return "Shipped";
    if (statuses.includes("Processing")) return "Processing";

    return "Pending";
  };
  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor your business performance</p>
        </div>

        <select
          className="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="cards">
        <div className="card">
          <FaBox />
          <h3>Total Products</h3>
          <p>{summary.totalProducts || 0}</p>
        </div>

        <div className="card">
          <FaShoppingCart />
          <h3>Total Orders</h3>
          <p>{summary.totalOrders || 0}</p>
        </div>

        <div className="card">
          <FaUsers />
          <h3>Customers</h3>
          <p>{summary.totalUsers || 0}</p>
        </div>

        <div className="card">
          <FaRupeeSign />
          <h3>Revenue</h3>
         <p>₹{Math.round(summary.revenue || 0)}</p>
        </div>
      </div>

      {/* TOP CHARTS */}
      <div className="charts">

        {/* SALES */}
        <div className="chartBox large">
          <h3>Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />

              <YAxis
                tickFormatter={(value) => Math.round(value)}
              />

              <Tooltip
                formatter={(value) => Math.round(value)}
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ORDER STATUS */}
        <div className="chartBox">
          <h3>Order Status</h3>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={orderData} dataKey="value" outerRadius={80}>
                {orderData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={STATUS_COLORS[entry.name] || "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* LEGEND */}
          <div className="pie-legend">
            {orderData.map((item, index) => (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: STATUS_COLORS[item.name] }}
                ></span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

     {/* OUT OF STOCK */}
      <div className="out-stock">
        <h3>Stock Overview(Out of Stock)</h3>

        {outOfStockItems.length === 0 ? (
          <p>All items available</p>
        ) : (
          outOfStockItems.slice(0, 5).map((item, i) => (
            <div key={i} className="low-item">
              <span>{item.name}</span>

              <span className="danger">Out of Stock</span>

              <button
                className="restock-btn"
                onClick={() =>
                  navigate(`/inventory?productId=${item.productId}`)
                }
              >
                Restock
              </button>
            </div>
          ))
        )}
      </div>

      {/* LOW STOCK */}
      <div className="low-stock">
        <h3>⚠ Low Stock</h3>

        {lowStockItems.length === 0 ? (
          <p>No low stock items</p>
        ) : (
          lowStockItems.slice(0, 5).map((item, i) => (
            <div key={i} className="low-item">
              <span>{item.subcategory || item.name}</span>

              <span className="warning">{item.stock} left</span>

              <button
                className="restock-btn"
                onClick={() =>
                  navigate(`/inventory?productId=${item.productId}`)
                }
              >
                Restock
              </button>
            </div>
          ))
        )}
      </div>

      {/* RECENT ORDERS */}
      <div className="orders">
        <h3>Recent Orders</h3>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const status = getOrderStatus(o);

              return (
                <tr key={o._id} className="order-row">

                  <td data-label="Order ID">
                    #{o._id.slice(-5)}
                  </td>

                  <td data-label="Customer">
                    {o.userId?.name}
                  </td>

                  <td data-label="Status">
                    <span className={`status ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>

                  <td data-label="Amount">
                    ₹{
                      Math.round(
                        (o.items || [])
                          .filter(
                            (item) =>
                              item.status?.toLowerCase() !== "cancelled"
                          )
                          .reduce((total, item) => {

                            const subtotal =
                              (item.price || 0) *
                              (item.quantity || 1);

                            const gst = subtotal * 0.18;

                            // ✅ FULL SHIPPING FOR EACH PRODUCT
                            const shipping =
                              o.shippingCharge || 0;

                            return total + subtotal + gst + shipping;

                          }, 0)
                      )
                    }
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

      </div>

    </div>
  );
}

export default Dashboard;