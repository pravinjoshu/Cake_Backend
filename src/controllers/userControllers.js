import User from "../models/User.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  res.json(user);
};
