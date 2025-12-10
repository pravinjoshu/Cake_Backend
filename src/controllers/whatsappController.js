import { sendWhatsapp } from "../utils/sendWhatsapp.js";

export const whatsapp = async (req, res) => {
  try {
    const { phone, msg } = req.body;

    if (!phone || !msg) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required"
      });
    }

    const data = await sendWhatsapp(phone, msg);

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
