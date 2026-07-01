import React, { useState, useEffect } from "react";
import "../styles/Profile.css";
import { FaCamera, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const userId = localStorage.getItem("userId");

  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [user, setUser] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    gender: ""
  });

  const navigate = useNavigate();
 const handleLogoutClick = () => {
  setShowLogoutModal(true);
};
  

const confirmLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");

  window.dispatchEvent(new Event("userChanged"));

  setShowLogoutModal(false);

  navigate("/login", { replace: true });
};

const cancelLogout = () => {
  setShowLogoutModal(false);
};

  // ✅ Separate edit states
  const [editPersonal, setEditPersonal] = useState(false);
  // const [editEmail, setEditEmail] = useState(false);
  // const [editPhone, setEditPhone] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
const [isAddressEditing, setIsAddressEditing] = useState(false);

const token = localStorage.getItem("token");


  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    locality: "",
    village: "",
    city: "",
    state: ""
  });

  // LOAD DATA
useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      localStorage.clear();
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `https://sarathi-furniture.onrender.com/api/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔴 HANDLE EXPIRED TOKEN
      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();

      setUser({
        name: data.name || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        gender: data.gender || ""
      });

      setProfileImage(data.profileImage || "");
      setAddresses(data.addresses || []);

    } catch (err) {
      console.log(err);
    }
  };

  fetchData();
}, [navigate, userId]);

  // INPUT CHANGE
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // IMAGE UPLOAD
const handleImageChange = async (e) => {
  const file = e.target.files[0];

  console.log("FILE SELECTED:", file); // 👈 check this

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://sarathi-furniture.onrender.com/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log("UPLOAD RESPONSE:", data);

  setProfileImage(data.imageUrl);
};

  // SAVE PROFILE
const saveData = async () => {
  try {
    const res = await fetch(`https://sarathi-furniture.onrender.com/api/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...user,
        profileImage
      })
    });

    console.log("STATUS:", res.status);

    const text = await res.text();
    console.log("RESPONSE:", text);

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    const data = JSON.parse(text);

    setUser(data);
    setProfileImage(data.profileImage || "");

    showSuccess("Profile Updated ✅");

  } catch (error) {
    console.error(error);
   showError("Error updating profile ❌");
  }
};

  // ADDRESS CHANGE
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // SAVE ADDRESS
 const saveNewAddress = async () => {
  if (!address.fullName || !address.phone || !address.pincode) {
    showError("Fill required fields");
    return;
  }

  const res = await fetch(
    `https://sarathi-furniture.onrender.com/api/profile/address/${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address)
    }
  );

  const data = await res.json();

  setAddresses(data.addresses || []);
  setShowAddressForm(false);

  setAddress({
    fullName: "",
    phone: "",
    pincode: "",
    locality: "",
    village: "",
    city: "",
    state: ""
  });

  showSuccess("Address Added ✅");
};

const handleEdit = () => {
  setIsEditing(true);
  setEditPersonal(true);
};

const handleEditAddress = (addr) => {
  setShowAddressForm(true);
  setIsAddressEditing(true);
  setEditingAddressId(addr._id);

  setAddress({
    fullName: addr.fullName,
    phone: addr.phone,
    pincode: addr.pincode,
    locality: addr.locality,
    village: addr.village,
    city: addr.city,
    state: addr.state
  });
};

const updateAddress = async () => {
  const res = await fetch(
    `https://sarathi-furniture.onrender.com/api/profile/${userId}/address/${editingAddressId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address)
    }
  );

  const data = await res.json();

  setAddresses(data.addresses || []);
  setShowAddressForm(false);
  setIsAddressEditing(false);
  setEditingAddressId(null);

  setAddress({
    fullName: "",
    phone: "",
    pincode: "",
    locality: "",
    village: "",
    city: "",
    state: ""
  });

  showSuccess("Address Updated ✅");
};

const deleteAddress = async (addressId) => {
  try {
    const res = await fetch(
      `https://sarathi-furniture.onrender.com/api/profile/${userId}/address/${addressId}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    setAddresses(data.addresses || []);
    showSuccess("Address Deleted ✅");
  } catch (error) {
    console.error(error);
    showError("Error deleting address ❌");
  }
};
const removeImage = () => {
  setShowRemovePopup(true);
};

const confirmRemoveImage = async () => {
  try {
    // update UI
    setProfileImage("");

    // update database
    await fetch(`https://sarathi-furniture.onrender.com/api/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...user,
        profileImage: ""
      })
    });

    console.log("Image removed from DB");

    setShowRemovePopup(false);

    showSuccess("Profile photo removed ✅");

  } catch (error) {
    console.error("Error removing image:", error);

    showError("Failed to remove photo ❌");
  }
};
  return (
    <div className="profilePage">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="userBox">

          <div className="profileImgBox">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="user"
              
            />
{/* 
            <label htmlFor="profileUpload" className="cameraIconSmall">
              <FaCamera />
            </label>

            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!isEditing}
              hidden
            /> */}
          </div>

          <div>
            <p style={{marginTop:"20px"}}>Hello</p>
            <h4>{user.name}</h4>
          </div>
        </div>

        <div className="menuBlock">
          <p className="menuTitle">ACCOUNT SETTINGS</p>

          <div
            className={activeTab === "profile" ? "menuItem active" : "menuItem"}
            onClick={() => setActiveTab("profile")}
          >
            Profile Information
          </div>

          <div
            className={activeTab === "address" ? "menuItem active" : "menuItem"}
            onClick={() => setActiveTab("address")}
          >
            Manage Addresses
          </div>

          <div
            className="menuItem logoutItem"
            onClick={handleLogoutClick}>
            Logout
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="card">

            {editPersonal && (
              <div style={{ marginBottom: "30px", textAlign: "center" }}>

                <div style={{ position: "relative", display: "inline-block" }}>
                

   <img
    src={
      profileImage ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
    alt="profile"
    style={{
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />

  {/* {profileImage && (
    <FaTrash
      onClick={removeImage}
      title="Remove photo"
      style={{
        cursor: "pointer",
        color: "red",
        fontSize: "18px"
      }}<
    />
  )} */}


</div>

                <br />

               <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "8px"
}}>
  <label style={{
    cursor: "pointer",
    color: "blue",
    fontWeight: "bold"
  }}>
    {profileImage ? "Change Photo" : "Add Photo"}
    <input type="file" hidden onChange={handleImageChange} />
  </label>

  {profileImage && (
    <FaTrash
      onClick={removeImage}
      title="Remove photo"
      style={{
        cursor: "pointer",
        color: "red",
        fontSize: "16px"
      }}
    />
  )}
</div>

</div>  
)}

{showRemovePopup && (
  <div className="popup-overlay">
    <div className="popup-box">

      <h3>Remove Profile Photo?</h3>

      <p>
        Are you sure you want to remove your profile photo?
      </p>

      <div className="popup-actions">

        <button
          className="yes-btn"
          onClick={confirmRemoveImage}
        >
          Yes
        </button>

        <button
          className="no-btn"
          onClick={() => setShowRemovePopup(false)}
        >
          No
        </button>

      </div>

    </div>
  </div>
)}

            {/* ✅ ONE HEADER ONLY */}
            <div className="sectionHeader">
              <h3>Personal Information</h3>

              {!editPersonal ? (
                <button className="editBtnMain" onClick={handleEdit}>
                  Edit
                </button>
              ) : (
                <button
                  className="saveBtnMain"
                  onClick={() => {
                    saveData();
                    setEditPersonal(false);
                  }}
                >
                  Save
                </button>
              )}
            </div>

            {/* NAME */}
            <div className="row">
              <input
                name="name"
                placeholder="First Name"
                value={user.name}
                disabled={!editPersonal}
                onChange={handleChange}
              />

              <input
                name="lastName"
                placeholder="Last Name"
                value={user.lastName}
                disabled={!editPersonal}
                onChange={handleChange}
              />
            </div>

            {/* GENDER */}
            <p style={{ marginTop: "15px" }}>Your Gender</p>

            <div className="gender">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={user.gender === "male"}
                  disabled={!editPersonal}
                  onChange={handleChange}
                />
                Male
              </label>

              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={user.gender === "female"}
                  disabled={!editPersonal}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>

            {/* EMAIL */}
            <div style={{ marginTop: "25px" }}>
              <h4>Email Address</h4>
              <input
                name="email"
                value={user.email}
                disabled
                onChange={handleChange}
              />
            </div>

            {/* PHONE */}
            <div style={{ marginTop: "25px" }}>
            <h4>Mobile Number</h4>
            <input
              name="phone"
              value={user.phone}
              disabled={!editPersonal}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // only numbers
                setUser({ ...user, phone: value });
              }}
            />
          </div>

          </div>
        )}

        {/* ADDRESS */}
        {activeTab === "address" && (
          <div className="card">
            <h3>Manage Addresses</h3>

            <p
              className="addAddressBtn"
              onClick={() => {
                setShowAddressForm(true);
                setIsAddressEditing(false);
                setEditingAddressId(null);

                setAddress({
                  fullName: "",
                  phone: "",
                  pincode: "",
                  locality: "",
                  village: "",
                  city: "",
                  state: ""
                });
              }}
            >
              + ADD A NEW ADDRESS
            </p>

            {showAddressForm && (
              <div className="addressFormCard">

                <div className="row">
                  <input
                    name="fullName"
                    placeholder="Name"
                    value={address.fullName}
                    onChange={handleAddressChange}
                  />
                  <input
                  name="phone"
                    placeholder="Enter contact number"
                  value={address.phone}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // only numbers
                    setAddress({ ...address, phone: value });
                  }}
                />
                </div>

                <div className="row">
                  <input
                  name="pincode"
                    placeholder="pincode"
                  value={address.pincode}
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // only numbers
                    setAddress({ ...address, pincode: value });
                  }}
                />
                 <input
                    name="village"
                    placeholder="Village"
                    value={address.village}
                    onChange={handleAddressChange}
                  />

                  <textarea
                    name="locality"
                    placeholder="House No, Area, Street, Landmark"
                    value={address.locality}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="row">
                  <input
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressChange}
                  />
                  <input
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="btnGroup">
                  <button onClick={isAddressEditing ? updateAddress : saveNewAddress}>SAVE</button>
                  <button onClick={() => {setShowAddressForm(false);setIsAddressEditing(false);setEditingAddressId(null);}}>CANCEL</button>
                </div>
              </div>
            )}

           {Array.isArray(addresses) && addresses.map((addr) => (
            <div key={addr._id} className="addressCard">
              <h4>{addr.fullName}</h4>
              <p>{addr.locality}</p>
                <p>{addr.village}</p>
                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              <p>{addr.phone}</p>

              <div className="addressActions">
                <button className="editBtn"
                onClick={() => handleEditAddress(addr)}>
                  Edit
                </button>
                
                <button className="deleteBtn"
                  onClick={() => deleteAddress(addr._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

      </div>
       {/* <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar
              closeButton={false}
        /> */}

        {showLogoutModal && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Are you sure you want to logout?</p>

            <div className="confirm-actions">
              <button className="btn-yes" onClick={confirmLogout}>
                Yes
              </button>

              <button className="btn-no" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;