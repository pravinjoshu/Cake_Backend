import { UserDetails } from "../models/userDetails.js";

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const details = await UserDetails.findOne({ userId });

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Details not found"
      });
    }

    res.status(200).json({
      success: true,
      details
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save/Update user details
export const saveUserDetails = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      email,
      whatsapp,
      flatNo,
      street,
      landmark,
      city,
      pincode,
      instructions,
      paymentMethod
    } = req.body;

    const address = `${flatNo}, ${street}, ${landmark}, ${city} - ${pincode}`;

    let details = await UserDetails.findOne({ userId });

    if (details) {
      details.fullName = fullName;
      details.phone = phone;
      details.email = email;
      details.whatsapp = whatsapp;
      details.flatNo = flatNo;
      details.street = street;
      details.landmark = landmark;
      details.city = city;
      details.pincode = pincode;
      details.instructions = instructions;
      details.paymentMethod = paymentMethod;
      details.address = address;
      await details.save();
    } else {
      details = await UserDetails.create({
        userId,
        fullName,
        phone,
        email,
        whatsapp,
        flatNo,
        street,
        landmark,
        city,
        pincode,
        instructions,
        paymentMethod,
        address
      });
    }

    res.status(200).json({
      success: true,
      message: "Details saved successfully",
      details
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
