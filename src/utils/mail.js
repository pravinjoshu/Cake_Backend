import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"CakeForest OTP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Your OTP Code</h2>
      <p style="font-size:20px;"><b>${otp}</b></p>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
