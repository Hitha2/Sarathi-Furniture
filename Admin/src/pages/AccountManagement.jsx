import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AccountManagement.css";
import { useLocation } from "react-router-dom";

const API = "http://localhost:5000/api/admin";

function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table | grid
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [currentPage, setCurrentPage] = useState(1);

  const gridPerPage = 8;
  const tablePerPage = 10;
  const itemsPerPage = viewMode === "grid" ? gridPerPage : tablePerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, search, query]);

  useEffect(() => {
    if (query) {
      console.log("Searching customer:", query);
      // optional: filter or call API
    }
  }, [query]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(`${API}/accounts`)
      .then(res => setUsers(res.data));
  };

  const toggleStatus = (id) => {
    axios.put(`${API}/accounts/toggle/${id}`)
      .then(() => fetchUsers());
  };

  const deleteUser = (id) => {
    axios.delete(`${API}/accounts/${id}`)
      .then(() => fetchUsers());
  };

  const updateUser = () => {
    axios.put(`${API}/accounts/${selectedUser._id}`, selectedUser)
      .then(() => {
        setSelectedUser(null);
        fetchUsers();
      });
  };

  // ✅ FILTER INSIDE COMPONENT
  const finalSearch = (query || search).toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!finalSearch.trim()) return true;

    return (
      user.name?.toLowerCase().includes(finalSearch) ||
      user.email?.toLowerCase().includes(finalSearch) ||
      user.phone?.toLowerCase().includes(finalSearch)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
  <div className="account-container">

    {/* FIXED HEADER */}
   <div className="account-fixed-header">

    <div className="acc-top-row">
      <h2>Customer Management</h2>

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
      </div>
    </div>

    <input
      type="text"
      className="acc-search"
      placeholder="Search name, email, phone..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

  </div>

  {/* CONTENT */}
  <div className="account-content">
    {/* ================= TABLE ================= */}
    {viewMode === "table" && (
      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              {/* <th>Status</th> */}
              <th>Total Orders</th>
              <th>Total Spent</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                {/* <td>{user.isActive ? "Active" : "Inactive"}</td> */}
                <td>{user.totalOrders}</td>
                <td>Rs. {(user.totalSpent || 0).toFixed(2)}</td>

                {/* <td>
                  <button className="btn-edit" onClick={() => setSelectedUser(user)}>
                    Edit
                  </button>
  
                  <button className="btn-toggle" onClick={() => toggleStatus(user._id)}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button className="btn-delete" onClick={() => deleteUser(user._id)}>
                    Delete
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* ================= GRID ================= */}
    {viewMode === "grid" && (
      <div className="usersGrid">
        {currentUsers.map(user => (
          <div className="userGridCard" key={user._id}>

            <h4>{user.name}</h4>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>
              <strong>Total Orders:</strong> {user.totalOrders || 0}
            </p>

            <p>
              <strong>Total Spent:</strong> ₹{user.totalSpent || 0}
            </p>

            {/* <span className={`status ${user.isActive ? "active" : "inactive"}`}>
              {user.isActive ? "Active" : "Inactive"}
            </span> */}

            {/* <div className="user-actions">
              <button className="btn-edit" onClick={() => setSelectedUser(user)}>Edit</button>
              <button className="btn-delete" onClick={() => deleteUser(user._id)}>Delete</button>
            </div> */}

          </div>
        ))}
      </div>
    )}
    </div>

    {/* MODAL */}
    {selectedUser && (
      <div className="modal">
        <div className="modal-content">
          <h3>Edit User</h3>

          <input
            value={selectedUser.name}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, name: e.target.value })
            }
          />

          <input
            value={selectedUser.email}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, email: e.target.value })
            }
          />

          <input
            value={selectedUser.phone}
            onChange={(e) =>
              setSelectedUser({ ...selectedUser, phone: e.target.value })
            }
          />

          <div className="btns">
            <button className="btn-save" onClick={updateUser}>Save</button>
            <button className="btn-cancel" onClick={() => setSelectedUser(null)}>Cancel</button>
          </div>
        </div>
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
}

export default AccountManagement;