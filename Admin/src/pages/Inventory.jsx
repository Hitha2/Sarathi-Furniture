import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Inventory.css";
import { useLocation } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";


const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [editId, setEditId] = useState(null);
  const [stock, setStock] = useState("");
  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState("table");

  const [currentPage, setCurrentPage] = useState(1);
  const [highlightId, setHighlightId] = useState(null);
  
  const location = useLocation();

  const productIdFromURL = new URLSearchParams(location.search).get("productId");

  const gridPerPage = 8;
  const tablePerPage = 10;

  const itemsPerPage =
  viewMode === "grid" ? gridPerPage : tablePerPage;

  const API = "hhttps://sarathi-furniture.onrender.com/api/inventory";

  useEffect(() => {
    fetchInventory();
  }, []);


  const filteredInventory = inventory.filter((item) =>
  (
    item.productId?.categoryId?.name +
    " " +
    item.productId?.subcategoryId?.name
  )
    .toLowerCase()
    .includes(search.toLowerCase())
);
  // ================= FETCH =================
  const fetchInventory = async () => {
    try {
      const res = await axios.get(API);
      setInventory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

useEffect(() => {
  if (!productIdFromURL || filteredInventory.length === 0) return;

  const index = filteredInventory.findIndex(
    (item) => item.productId?._id === productIdFromURL
  );

  if (index === -1) return;

  const page = Math.floor(index / itemsPerPage) + 1;

  setCurrentPage(page);
  setHighlightId(productIdFromURL);
}, [productIdFromURL, filteredInventory]);


  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditId(item._id);
    setStock(item.stock);
  };

  // ================= UPDATE =================
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API}/${id}`, { stock });
      setEditId(null);
      fetchInventory();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      showSuccess("Deleted successfully ");
      fetchInventory();
    } catch (err) {
      console.log(err);
      showError("Delete failed ");
    }
  };

  useEffect(() => {
  if (window.innerWidth < 768) {
    setViewMode("grid");
  }
}, []);

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentInventory = filteredInventory.slice(
  indexOfFirst,
  indexOfLast
);

const totalPages = Math.ceil(
  filteredInventory.length / itemsPerPage
);

useEffect(() => {
  if (!highlightId) return;

  const timer = setTimeout(() => {
    setHighlightId(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [highlightId]);

  return (
    <div className="inv-container">

      {/* ===== TOP PANEL ===== */}
      <div className="inv-top-panel">

        <div className="inv-top-row">
          <h2>Inventory Management</h2>
          <div className="view-toggle">
            <button
              className={viewMode === "table" ? "activeView" : ""}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>

            <button
              className={viewMode === "grid" ? "activeView" : ""}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
          </div>
        </div>

        <input
          type="text"
          className="inv-search"
          placeholder="Search category or subcategory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      {viewMode === "table" && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Product Name</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentInventory.map((item) => (
               <tr
                  key={item._id}
                  data-product-id={item.productId?._id}
                  className={highlightId === item.productId?._id ? "highlight-row" : ""}
                >

                  {/* CATEGORY */}
                  <td>{item.productId?.categoryId?.name || "-"}</td>

                  {/* SUBCATEGORY */}
                  <td>{item.productId?.subcategoryId?.name || "-"}</td>

                  <td>{item.productId?.name || "-"}</td>

                  {/* STOCK */}
                  <td>
                    {editId === item._id ? (
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    ) : (
                      item.stock
                    )}
                  </td>

                  {/* STATUS */}
                  <td>
                    {item.stock === 0 ? (
                      <span className="out">Out</span>
                    ) : item.stock <= 5 ? (
                      <span className="low">Low</span>
                    ) : (
                      <span className="good">In Stock</span>
                    )}
                  </td>

                  {/* LAST UPDATED */}
                  <td>
                    {item.lastUpdated
                      ? new Date(item.lastUpdated).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* ACTION */}
                  <td>
                    {editId === item._id ? (
                      <>
                        <button onClick={() => handleUpdate(item._id)}>
                          Save
                        </button>
                        <button onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button
                          style={{ background: "red", marginLeft: "5px" }}
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* ================= MOBILE CARDS ================= */}
      {viewMode === "grid" && (
        <div className="inventory-cards">
          {currentInventory.map((item) => (
            <div className="inventory-card" key={item._id}>

              <h4>
                {item.productId?.name || "No Product"}
              </h4>

              <p>
                <b>Category:</b> {item.productId?.categoryId?.name || "-"}
              </p>

              <p>
                <b>Subcategory:</b> {item.productId?.subcategoryId?.name || "-"}
              </p>

              <p>
                <b>Stock:</b>{" "}
                {editId === item._id ? (
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                ) : (
                  item.stock
                )}
              </p>

              <p>
                <b>Status:</b>{" "}
                {item.stock === 0 ? (
                  <span className="out">Out</span>
                ) : item.stock <= 5 ? (
                  <span className="low">Low</span>
                ) : (
                  <span className="good">In Stock</span>
                )}
              </p>

              <p>
                <b>Updated:</b>{" "}
                {item.lastUpdated
                  ? new Date(item.lastUpdated).toLocaleDateString()
                  : "-"}
              </p>

              <div className="card-actions">
                {editId === item._id ? (
                  <>
                    <button onClick={() => handleUpdate(item._id)}>
                      Save
                    </button>
                    <button onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(item)}>
                      Edit Stock
                    </button>
                    <button
                      style={{ background: "red" }}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>

      </div>
    </div>
  );
};

export default Inventory;