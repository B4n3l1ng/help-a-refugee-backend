const { hashSync, genSaltSync } = require("bcrypt");
const { Router } = require("express");
const Host = require("../models/Host.model");

Router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await Host.create({ email, hashedPassword });
    res.status(201).json({ message: "Host created" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
