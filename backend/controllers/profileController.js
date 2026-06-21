import User from "../models/User.js";
import fs from "fs";
import path from "path";

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    console.log("USER ID RECEIVED:", req.params.id); 
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("PROFILE IMAGE:", req.body.profileImage);

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update fields
    user.name = req.body.name || user.name;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;

    // 🔥 HANDLE IMAGE DELETE + UPDATE
    if (req.body.profileImage !== undefined) {

  // 🔥 CASE 1: User removed image
  if (req.body.profileImage === "" && user.profileImage) {
    const fileName = user.profileImage.split("/uploads/")[1];

    if (fileName) {
      const filePath = path.join(process.cwd(), "uploads", fileName);

      fs.unlink(filePath, (err) => {
        if (err) console.log("Delete error:", err);
        else console.log("Image deleted");
      });
    }
  }

  // 🔥 CASE 2: User uploaded NEW image
  if (
    req.body.profileImage &&
    user.profileImage &&
    req.body.profileImage !== user.profileImage
  ) {
    const fileName = user.profileImage.split("/uploads/")[1];

    if (fileName) {
      const filePath = path.join(process.cwd(), "uploads", fileName);

      fs.unlink(filePath, (err) => {
        if (err) console.log("Replace delete error:", err);
        else console.log("Old image replaced");
      });
    }
  }

  // ✅ Finally update DB
  user.profileImage = req.body.profileImage;
}

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADD ADDRESS
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Incoming Address:", req.body); 
    user.addresses.push(req.body); 
    await user.save();             

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* UPDATE ADDRESS */
export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const updatedData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the address
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update fields
    Object.assign(address, updatedData);

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};