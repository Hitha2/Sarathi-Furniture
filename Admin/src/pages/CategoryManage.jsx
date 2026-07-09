import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/CategoryManage.css";
import { FaTimes } from "react-icons/fa";
import { showSuccess, showError } from "../utils/toast";

const CategoryManage = () => {
  const [showManage, setShowManage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  const [subName, setSubName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  //  NEW STATES (EDIT)
  const [editId, setEditId] = useState(null);
  const [editSubId, setEditSubId] = useState(null);

  const [search, setSearch] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "category" or "sub"
  const [deleteCatId, setDeleteCatId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // you can change (5, 10, etc.)

  const [subPage, setSubPage] = useState({});
  const subItemsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("https://sarathi-furniture.onrender.com/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((cat) => {
  const catName = cat.name.toLowerCase();

  const subMatch = subcategories[cat._id]?.some((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    catName.includes(search.toLowerCase()) ||
    subMatch
  );
});

  useEffect(() => {
    fetchCategories();
  }, []);

  //  ADD / UPDATE CATEGORY
  const handleAddCategory = async () => {
    try {
      if (!name) {
        showError("Enter category name");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      if (editId) {
        //  UPDATE
        await axios.put(
          `https://sarathi-furniture.onrender.com/api/category/${editId}`,
          formData
        );
       showSuccess("Category updated ");
      } else {
        //  ADD
        if (!image) {
          showError("Image required");
          return;
        }

        await axios.post(
          "https://sarathi-furniture.onrender.com/api/category",
          formData
        );
        showSuccess("Category added ");
      }

      setName("");
      setImage(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT CATEGORY CLICK
  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
  };

  // ADD / UPDATE SUBCATEGORY
  const handleAddSub = async () => {
    try {
      if (!subName || !categoryId) {
        showError("Fill all fields");
        return;
      }

      if (editSubId) {
        //  UPDATE
        await axios.put(
          `https://sarathi-furniture.onrender.com/api/subcategory/${editSubId}`,
          { name: subName }
        );
        showSuccess("Subcategory updated ");
      } else {
        // ADD
        await axios.post("https://sarathi-furniture.onrender.com/api/subcategory", {
          name: subName,
          categoryId,
        });
        showSuccess("Subcategory added ");
      }

      setSubName("");
      setCategoryId("");
      setEditSubId(null);
    } catch (err) {
      console.error(err);
    }
  };

  //  LOAD SUBCATEGORIES
  const loadSubcategories = async (id) => {
    try {
      const res = await axios.get(
        `https://sarathi-furniture.onrender.com/api/subcategory/${id}`
      );

      setSubcategories((prev) => ({
        ...prev,
        [id]: res.data,
      }));

      setSubPage((prev) => ({
        ...prev,
        [id]: 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE CATEGORY
  const handleDelete = (id) => {
  setDeleteId(id);
  setDeleteType("category");
};

  //  DELETE SUBCATEGORY
 const handleDeleteSub = (id, catId) => {
  setDeleteId(id);
  setDeleteCatId(catId);
  setDeleteType("sub");
};

const confirmDelete = async () => {
  try {
    if (deleteType === "category") {
      await axios.delete(
        `https://sarathi-furniture.onrender.com/api/category/${deleteId}`
      );
      showSuccess("Category deleted 🗑️");
      fetchCategories();
    }

    if (deleteType === "sub") {
      await axios.delete(
        `https://sarathi-furniture.onrender.com/api/subcategory/${deleteId}`
      );

      setSubcategories((prev) => ({
        ...prev,
        [deleteCatId]: prev[deleteCatId].filter(
          (s) => s._id !== deleteId
        ),
      }));

      showSuccess("Subcategory deleted ");
    }

    setDeleteId(null);
    setDeleteType("");
    setDeleteCatId(null);
  } catch (err) {
    showError("Delete failed ");
  }
};

const cancelDelete = () => {
  setDeleteId(null);
  setDeleteType("");
  setDeleteCatId(null);
};

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentCategories = filteredCategories.slice(
  indexOfFirst,
  indexOfLast
);

const totalPages = Math.ceil(
  filteredCategories.length / itemsPerPage
);
 
    return (
       <div className="cm-main-content">
  <div className="adminPage">

    {/* HEADER */}
    <div className="cm-top-panel">

      <div className="cm-top-row">
        <h2>Category Dashboard</h2>

        <button
          className="manageToggleBtn"
          onClick={() => setShowManage(!showManage)}
        >
          {showManage ? "View Categories" : "Manage Category"}
        </button>
      </div>

      <input
        type="text"
        className="cm-search"
        placeholder="Search category or subcategory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* ================= VIEW MODE ================= */}
    {!showManage && (
      <div className="categoryGrid">
        {currentCategories.map((cat) => (
          <div className="categoryCard" key={cat._id}>
            <img
              src={cat.image}
              alt={cat.name}
            />
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    )}

    {/* ================= MANAGE MODE ================= */}
    {showManage && (
      <>
        {/* ADD / EDIT CATEGORY */}
        <div className="formContainer">
          <h3>{editId ? "Edit Category" : "Add Category"}</h3>

          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="previewImg"
            />
          )}

          <button onClick={handleAddCategory}>
            {editId ? "Update Category" : "Add Category"}
          </button>
        </div>

        {/* SUBCATEGORY */}
        <div className="formContainer">
          <h3>{editSubId ? "Edit Subcategory" : "Add Subcategory"}</h3>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subcategory Name"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
          />

          <button onClick={handleAddSub}>
            {editSubId ? "Update Subcategory" : "Add Subcategory"}
          </button>
        </div>

        {/* TABLE */}
        <div className="tableContainer">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <img
                      src={cat.image}
                      alt={cat.name}
                    />
                  </td>

                  <td>{cat.name}</td>

                  <td>
                    <button
                      className="viewBtn"
                      onClick={() => {
                        if (subcategories[cat._id]) {
                          setSubcategories((prev) => {
                            const updated = { ...prev };
                            delete updated[cat._id];
                            return updated;
                          });
                        } else {
                          loadSubcategories(cat._id);
                        }
                      }}
                    >
                      {subcategories[cat._id] ? "Close" : "View"}
                    </button>

                    <ul>
                     {(subcategories[cat._id] || [])
                      .slice(
                        ((subPage[cat._id] || 1) - 1) * subItemsPerPage,
                        (subPage[cat._id] || 1) * subItemsPerPage
                      )
                      .map((sub) => (
                  <li key={sub._id}>
                      <span>{sub.name}</span>

                      <div>
                        <button
                          onClick={() => {
                          setSubName(sub.name);
                          setCategoryId(cat._id);
                          setEditSubId(sub._id);
                              }}
                              className="editBtn">Edit</button>

                            <button
                              onClick={() => handleDeleteSub(sub._id, cat._id)}
                              className="deleteBtn">Delete</button>
                      </div>
                    </li>
                      ))}
                    </ul>
                    {subcategories[cat._id]?.length > subItemsPerPage && (
                      <div className="sub-pagination">
                        
                        <button
                          disabled={(subPage[cat._id] || 1) === 1}
                          onClick={() =>
                            setSubPage((prev) => ({
                              ...prev,
                              [cat._id]: (prev[cat._id] || 1) - 1,
                            }))
                          }
                        >
                          Prev
                        </button>

                        {Array.from(
                          {
                            length: Math.ceil(
                              (subcategories[cat._id]?.length || 0) / subItemsPerPage
                            ),
                          },
                          (_, i) => (
                            <button
                              key={i}
                              className={(subPage[cat._id] || 1) === i + 1 ? "active-page" : ""}
                              onClick={() =>
                                setSubPage((prev) => ({
                                  ...prev,
                                  [cat._id]: i + 1,
                                }))
                              }
                            >
                              {i + 1}
                            </button>
                          )
                        )}

                        <button
                          disabled={
                            (subPage[cat._id] || 1) ===
                            Math.ceil(
                              (subcategories[cat._id]?.length || 0) / subItemsPerPage
                            )
                          }
                          onClick={() =>
                            setSubPage((prev) => ({
                              ...prev,
                              [cat._id]: (prev[cat._id] || 1) + 1,
                            }))
                          }
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <button style={{color:"white", marginRight:"10px"}} onClick={() => handleEdit(cat)}>Edit</button>
                    <button style={{color:"white"}} onClick={() => handleDelete(cat._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
</div>
{deleteId && (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <p>Are you sure you want to delete?</p>

      <div className="confirm-actions">
        <button className="btn-yes" onClick={confirmDelete}>
          Yes
        </button>

        <button className="btn-no" onClick={cancelDelete}>
          No
        </button>
      </div>
    </div>
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

export default CategoryManage;