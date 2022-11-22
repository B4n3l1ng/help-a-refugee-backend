const router = require("express").Router();
const User = require("../models/User.model");
const Host = require("../models/Host.model");

const { genSatlSync, hashSync, compareSync } = require("bcryptjs");

router.post("/signupHost", async (req, res) => {
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

router.post("/signupUser", async (req, res) => {
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
