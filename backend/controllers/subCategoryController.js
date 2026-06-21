import Subcategory from "../models/Subcategory.js";

// ✅ ADD SUBCATEGORY
export const addSubcategory = async (req, res) => {
  try {
    const newSub = new Subcategory({
      name: req.body.name,
      categoryId: req.body.categoryId,
    });

    await newSub.save();
    res.json(newSub);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ GET SUBCATEGORIES
export const getSubcategories = async (req, res) => {
  try {
    const data = await Subcategory.find({
      categoryId: req.params.categoryId,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ DELETE SUBCATEGORY
export const deleteSubcategory = async (req, res) => {
  try {
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json("Deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ UPDATE SUBCATEGORY (EDIT FIX)
export const updateSubcategory = async (req, res) => {
  try {
    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};






