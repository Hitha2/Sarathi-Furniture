import Inventory from "../models/Inventory.js";

// GET ALL INVENTORY (WITH PRODUCT DETAILS)
export const getInventory = async (req, res) => {
  try {
    const data = await Inventory.find()
  .populate({
    path: "productId",
    populate: [
      { path: "categoryId", select: "name" },
      { path: "subcategoryId", select: "name" }
    ]
  });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching inventory" });
  }
};
// UPDATE STOCK
export const updateInventory = async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        stock: req.body.stock,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update error" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Inventory deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error" });
  }
};