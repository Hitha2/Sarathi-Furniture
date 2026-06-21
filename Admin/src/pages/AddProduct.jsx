import React, { useEffect, useState } from "react";
import "../styles/Addproduct.css";
import axios from "axios";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";


const AddProduct = () => {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);

  const [viewMode, setViewMode] = useState("table");
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";


  const [currentPage, setCurrentPage] = useState(1);

  const gridPerPage = 8;
  const tablePerPage = 10;

  const itemsPerPage =
  viewMode === "grid" ? gridPerPage : tablePerPage;

  const [form, setForm] = useState({
    name: "",
    price: "",
    discount: "",
    category: "",
    subcategory: "",
    description: "",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, viewMode]);

  // ================= FETCH =================
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/product");

    const data = res.data;

    setProducts(Array.isArray(data) ? data : data.products || []);
  } catch (err) {
    console.error(err);
  }
};

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SUBCATEGORY =================
  useEffect(() => {
    if (form.category) {
      axios
        .get(`http://localhost:5000/api/subcategory/${form.category}`)
        .then((res) => setSubcategories(res.data))
        .catch((err) => console.error(err));
    } else {
      setSubcategories([]);
    }
  }, [form.category]);

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {

  if (!form.name || !form.price || !form.category || !form.subcategory) {
    showError("Fill all fields");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("categoryId", form.category);
    formData.append("subcategoryId", form.subcategory);
    formData.append("price", form.price);
    formData.append("discount", form.discount);
    formData.append("description", form.description);
    formData.append("name", form.name);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
 await axios.put(
  `http://localhost:5000/api/product/${editId}`,
  formData
);  
showSuccess("Product Updated Successfully ");

    } else {
      await axios.post(
        "http://localhost:5000/api/product",
        formData
      );

      showSuccess("Product Added Successfully ");
    }

    fetchProducts();
    resetForm();
    setShowForm(false);

  } catch (err) {
    console.log(err);
    showError("Error ");
  }
};
const handleUpdate = async (id) => {
  try {
    const formData = new FormData();

    formData.append("categoryId", form.category);
    formData.append("subcategoryId", form.subcategory);
    formData.append("price", form.price);
    formData.append("discount", form.discount);
    formData.append("description", form.description);
    formData.append("name", form.name);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await axios.put(`http://localhost:5000/api/product/${id}`, formData);

    showSuccess("Product Updated Successfully ");

    fetchProducts();
    resetForm();
  } catch (err) {
    console.log(err);
    showError("Error ❌");
  }
};

  // ================= EDIT =================
  const handleEdit = (p) => {
    setShowForm(true);
    setIsEdit(true);
    setEditId(p._id);

    setForm({
      price: p.price,
      discount: p.discount,
      category: p.categoryId?._id,
      subcategory: p.subcategoryId?._id,
      description: p.description,
      name: p.name,
    });

    setPreview(`http://localhost:5000/uploads/${p.image}`);
    setImageFile(null);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/product/${id}`);
      showSuccess("Deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      price: "",
      discount: "",
      category: "",
      subcategory: "",
      description: "",
      name: "",
    });
    setPreview("");
    setImageFile(null);
    setIsEdit(false);
    setEditId(null);
  };

 const finalSearch = (query || search || "").toLowerCase();

const filteredProducts = products
  .filter((p) => {

    // if no search show all
    if (!finalSearch.trim()) return true;

    const text = (
      (p.name || "") +
      " " +
      (p.categoryId?.name || "") +
      " " +
      (p.subcategoryId?.name || "") +
      " " +
      (p.description || "")
    ).toLowerCase();

    return text.includes(finalSearch);
  })
  .reverse();

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  return (

  <div className="main-content">
       <div className="mp-top-panel">

  {/* ===== FIRST ROW ===== */}
  <div className="mp-top-row">
    <h2>Product Management</h2>

    <div className="mp-right-controls">

      <div className="mp-view-toggle">
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

      <button
        className="mp-add-btn"
        onClick={() => {
          setShowForm(true);
          resetForm();
        }}
      >
        + Add Product
      </button>

    </div>
  </div>

  {/* ===== SECOND ROW ===== */}
  <input
    className="mp-search"
    placeholder="Search product..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

</div>
    {/* ================= MOBILE CARD VIEW ================= */}
    {viewMode === "grid" && (
      <div className="mp-grid">
      {currentProducts.map((p) => (
        <div className="mp-card" key={p._id}>

          <img
            src={`http://localhost:5000/uploads/${p.image}`}
            alt=""
            className="mp-card-img"
          />

          <div className="mp-card-body">
            <h4>{p.name}</h4>

            <h4>{p.categoryId?.name} → {p.subcategoryId?.name}</h4>

            <p><b>Price:</b> ₹{p.price}</p>

            <p><b>Discount:</b> {p.discount ? `${p.discount}%` : "-"}</p>

            <p>{p.description}</p>

            <div className="mp-card-actions">
              <button className="mp-edit-btn"
              onClick={() => {
                  setEditingProductId(p._id);
                  setForm({
                    name: p.name,
                    price: p.price,
                    discount: p.discount,
                    category: p.categoryId?._id,
                    subcategory: p.subcategoryId?._id,
                    description: p.description,
                  });

                  setPreview(`http://localhost:5000/uploads/${p.image}`);
                }}>
                Edit
              </button>

              <button className="mp-delete-btn" onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </div>

            {/* ===== INLINE EDIT FORM (ONLY THIS CARD OPENS) ===== */}
        {editingProductId === p._id && (
        <div className="mp-mobile-edit-full">

          <h4>Edit Product</h4>

          <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={categories.map((cat) => ({
              value: cat._id,
              label: cat.name
            }))}
            value={
              categories
                .map((cat) => ({ value: cat._id, label: cat.name }))
                .find((c) => c.value === form.category) || null
            }
            onChange={(selected) =>
              setForm({
                ...form,
                category: selected.value,
                subcategory: ""
              })
            }
            placeholder="Select Category"
          />

          {/* Subcategory */}
          <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={subcategories.map((sub) => ({
              value: sub._id,
              label: sub.name
            }))}
            value={
              subcategories
                .map((sub) => ({ value: sub._id, label: sub.name }))
                .find((s) => s.value === form.subcategory) || null
            }
            onChange={(selected) =>
              setForm({ ...form, subcategory: selected.value })
            }
            placeholder="Select Subcategory"
          />
          <input
            value={form.name}
            placeholder="Product Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          {/* Price */}
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          {/* Discount */}
         <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={[10,20,30,40,50,60,70].map((d) => ({
              value: d,
              label: `${d}%`
            }))}
            value={
              form.discount
                ? { value: form.discount, label: `${form.discount}%` }
                : null
            }
            onChange={(selected) =>
              setForm({ ...form, discount: selected.value })
            }
            placeholder="Discount"
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* Image */}
          {preview && (
            <img src={preview} className="mp-preview-img" />
          )}

          <input type="file" onChange={handleImageChange} />

          {/* Buttons */}
          <div className="mp-inline-actions">
           <button
              className="mp-add-btn"
              onClick={async () => {
                await handleUpdate(p._id);
                setEditingProductId(null);
              }}
            >
              Update
            </button>

            <button
              className="mp-cancel-btn"
              onClick={() => setEditingProductId(null)}
            >
              Cancel
            </button>
          </div>

        </div>
      )}
          </div>
        </div>
      ))}
    </div>
    )}

    {/* ================= DESKTOP TABLE ================= */}
    {viewMode === "table" && (
  <div className="mp-table-wrapper">

    <table className="mp-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Subcategory</th>
          <th>Product Name</th>
          <th>Image</th>
          <th>Price</th>
          <th>Discount</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {currentProducts.map((p) => (
          <tr key={p._id}>
            <td>{p.categoryId?.name}</td>
            <td>{p.subcategoryId?.name}</td>
            <td>{p.name}</td>
            <td>
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                className="mp-product-img"
                alt=""
              />
            </td>

            <td>₹{p.price}</td>
            <td>{p.discount ? `${p.discount}%` : "-"}</td>
            <td>{p.description}</td>

            <td>
              <button style={{color:"white", marginRight:"10px"}} className="mp-edit-btn" onClick={() => handleEdit(p)}>
                Edit
              </button>
              <button style={{color:"white"}} className="mp-delete-btn" onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
)}

    {/* ================= FORM ================= */}
    {showForm && (
    <div className="mp-modal-overlay">
      <div className="mp-modal">
        <h3>{isEdit ? "Update Product" : "Add Product"}</h3>

        <div className="mp-edit-form">

          <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={categories.map((cat) => ({
              value: cat._id,
              label: cat.name
            }))}
            value={
              categories
                .map((cat) => ({ value: cat._id, label: cat.name }))
                .find((c) => c.value === form.category) || null
            }
            onChange={(selected) =>
              setForm({
                ...form,
                category: selected.value,
                subcategory: ""
              })
            }
            placeholder="Select Category"
          />

          <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={subcategories.map((sub) => ({
              value: sub._id,
              label: sub.name
            }))}
            value={
              subcategories
                .map((sub) => ({ value: sub._id, label: sub.name }))
                .find((s) => s.value === form.subcategory) || null
            }
            onChange={(selected) =>
              setForm({ ...form, subcategory: selected.value })
            }
            placeholder="Select Subcategory"
          />

          <div className="form-group">
            <input
              value={form.name}
              placeholder="Product Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            {preview && (
              <img src={preview} className="mp-preview-img" alt="" />
            )}
            <input type="file" onChange={handleImageChange} />
          </div>

          <div className="form-group">
            <input
              value={form.price}
              placeholder="Price"
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </div>

          <Select
            className="small-react-select"
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            options={[10,20,30,40,50,60,70].map((d) => ({
              value: d,
              label: `${d}%`
            }))}
            value={
              form.discount
                ? { value: form.discount, label: `${form.discount}%` }
                : null
            }
            onChange={(selected) =>
              setForm({ ...form, discount: selected.value })
            }
            placeholder="Select Discount"
          />

          <textarea
            value={form.description}
            placeholder="Description"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button onClick={handleSubmit} className="mp-add-btn">
            {isEdit ? "Update Product" : "Add Product"}
          </button>

          <button
            className="mp-cancel-btn"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            Cancel
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

export default AddProduct;