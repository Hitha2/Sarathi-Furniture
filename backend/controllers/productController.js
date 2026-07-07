import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Subcategory from "../models/Subcategory.js";

// ================= ADD PRODUCT =================
export const addProduct = async (req, res) => {
  try {
    const { name, categoryId, subcategoryId, price, discount, description } = req.body;

    const product = await Product.create({
      name,
      categoryId,
      subcategoryId,
      price,
      discount,
      description,
      image: req.file ? req.file.path : "",
    });

    await Inventory.create({
      productId: product._id,
      stock: 0,
    });

    res.status(201).json({ message: "Product Added Successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding product" });
  }
};

// ================= GET PRODUCTS =================
export const getProducts = async (req, res) => {
  try {
    const { category, subcategory, min, max, discount, search } = req.query;

    let filter = {};

    if (category && category !== "undefined") {
      filter.categoryId = category;
    }

    if (subcategory && subcategory !== "undefined") {
      filter.subcategoryId = subcategory;
    }

    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    if (discount) {
      filter.discount = { $gte: Number(discount) };
    }

    // SEARCH
    if (search && search.trim() !== "") {
      const keyword = search.trim();
      const fuzzyPattern = keyword.split(" ").join(".*");

      const matchedSubcategories = await Subcategory.find({
        name: { $regex: fuzzyPattern, $options: "i" }
      });

      const subIds = matchedSubcategories.map((sub) => sub._id);

      const orConditions = [
        { name: { $regex: fuzzyPattern, $options: "i" } },
        { description: { $regex: fuzzyPattern, $options: "i" } }
      ];

      if (subIds.length > 0) {
        orConditions.push({ subcategoryId: { $in: subIds } });
      }

      filter.$or = orConditions;
    }

    // FETCH ALL PRODUCTS (NO PAGINATION)
    const products = await Product.find(filter)
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");

    const inventory = await Inventory.find();

    const inventoryMap = {};
    inventory.forEach((i) => {
      inventoryMap[i.productId.toString()] = i.stock;
    });

    const finalData = products.map((p) => ({
      ...p._doc,
      stock: inventoryMap[p._id.toString()] || 0,
    }));

    res.json(finalData);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {
    const { name, categoryId, subcategoryId, price, discount, description } = req.body;

    const updateData = {
      name,
      categoryId,
      subcategoryId,
      price,
      discount,
      description,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Product Updated Successfully",
      data: updated,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await Inventory.findOneAndDelete({ productId: req.params.id });

    res.json({ message: "Deleted Successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= GET SINGLE PRODUCT =================
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const inv = await Inventory.findOne({ productId: product._id });

    const finalData = {
      ...product._doc,
      stock: inv ? inv.stock : 0,
    };

    res.json(finalData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};