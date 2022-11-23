const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User.model");

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await User.create({ email, hashedPassword });
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
