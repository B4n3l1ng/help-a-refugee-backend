const { hashSync, genSaltSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const Host = require("../models/Host.model");

router.post("/signup", async (req, res) => {
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

router.post("/listings", async (req, res, next) => {
  try {
    const body = req.body;
    const listing = await Housing.create(body);
    res.status(201).json({ listing });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
