import axios from "axios";

export const sendWhatsapp = async (toNumber, message) => {
  try {
    const res = await axios.post(
      "https://graph.facebook.com/v17.0/<YOUR_PHONE_NUMBER_ID>/messages",
      {
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("WhatsApp Error:", err.response?.data || err.message);
    throw new Error("Message not sent");
  }
};
