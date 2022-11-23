const router = require("express").Router();
const Housing = require("../models/Housing.model");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.get("/listings", async (req, res, next) => {
  try {
    const listings = await Housing.find();
    res.json(listings);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
