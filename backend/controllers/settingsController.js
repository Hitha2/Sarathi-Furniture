import Settings from "../models/Settings.js";

// GET SETTINGS
export const getSettings = async (req, res) => {
  try {

    let settings = await Settings.findOne();

    // CREATE DEFAULT IF EMPTY
    if (!settings) {
      settings = await Settings.create({
        shippingRatePerKm: 5,
      });
    }

    res.json(settings);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE SETTINGS
export const updateSettings = async (req, res) => {
  try {

    const { shippingRatePerKm } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    settings.shippingRatePerKm =
      shippingRatePerKm;

    await settings.save();

    res.json({
      message: "Updated successfully",
      settings,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};