import Category from "../models/Category.js";

// ✅ ADD CATEGORY
export const addCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Image required" });
    }

    const newCategory = new Category({
      name: req.body.name,
      image: req.file.filename,
    });

    await newCategory.save();
    res.json(newCategory);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ GET CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json("Deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ UPDATE CATEGORY (EDIT FIX)
export const updateCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
    };

    // 🔥 If new image uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};




