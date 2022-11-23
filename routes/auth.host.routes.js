const { hashSync, genSaltSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { off } = require("../app");
const router = require("express").Router();
const Host = require("../models/Host.model");
const Housing = require("../models/Housing.model");

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await Host.findOne({ email });
    if (foundUser) {
      res.status(400).json({ message: "Host already exists." });
    }
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await Host.create({ email, hashedPassword });
    res.status(201).json({ message: "Host created" });
  } catch (error) {
    console.log(error);
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const currentHost = await Host.find({ email });
  if (currentHost) {
    if (compareSync(password, currentHost.hashedPassword)) {
      const hostCopy = { ...currentHost._doc };
      delete hostCopy.hashedPassword;
      const authToken = jwt.sign(
        {
          expiresIn: "6h",
          user: hostCopy,
        },
        process.env.Token_SECRET,
        {
          algorithm: "HS256",
        }
      );
      res.status(200).json({ status: 200, token: authToken });
    } else {
      res.status(400).json({ message: "Wrong password" });
    }
  } else {
    res.status(404).json({ message: "No user with this username" });
  }
});

router.get("/listings", async (req, res, next) => {
  try {
    const listings = await Housing.find({ owner: authToken._id });

    res.status(201).json(listings);
  } catch (error) {
    console.log(error);
  }
});

router.post("/listings", async (req, res, next) => {
  try {
    const body = req.body;
    const listing = await Housing.create({ ...body, owner: authToken._id });
    res.status(201).json({ listing });
  } catch (error) {
    console.log(error);
  }
});

router.put("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const listing = await Housing.findByIdAndUpdate(id, body, { new: true });

    res.json({ listing });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Housing.findByIdAndDelete(id);
    res.json(listing);
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
