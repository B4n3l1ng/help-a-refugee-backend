const { genSaltSync, hashSync } = require("bcrypt");
const { Router } = require("express");
const User = require("../models/User.model");

Router.post("/signup", async (req, res) => {
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
