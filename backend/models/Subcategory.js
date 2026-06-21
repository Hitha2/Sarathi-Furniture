import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: String,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});
export default mongoose.model("Subcategory", subcategorySchema);