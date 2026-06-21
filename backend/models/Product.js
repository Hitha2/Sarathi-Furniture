import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name:{
 type:String,
 required:true
},
  
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  description: String,
  image: String
}, { timestamps: true });

export default mongoose.model("Product", productSchema);