const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = require("express").Router();
const Host = require("../models/Host.model");
const User = require("../models/User.model");
const Housing = require("../models/Housing.model");
const { compareSync, genSaltSync, hashSync } = require("bcryptjs");
const uploader = require("../middlewares/cloudinary.config");

router.post("/signup", uploader.single("imageUrl"), async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, city, aboutMe } =
      req.body;
    const verify = await Host.findOne({ email });
    if (verify) {
      res.status(405).json({ message: "That email is already in use!" });
    } else {
      const image = req.file.path;
      const salt = genSaltSync(10);
      const hashedPassword = hashSync(password, salt);
      await Host.create({
        email,
        hashedPassword,
        firstName,
        lastName,
        country,
        city,
        image,
        aboutMe,
      });
      res.status(201).json({ message: "Host created" });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status.json({ message });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentHost = await Host.findOne({ email });

    if (currentHost) {
      if (compareSync(password, currentHost.hashedPassword)) {
        const hostCopy = { ...currentHost._doc };
        delete hostCopy.hashedPassword;
        const authToken = jwt.sign(
          {
            expiresIn: "24h",
            user: hostCopy,
          },
          process.env.TOKEN_SECRET,
          {
            algorithm: "HS256",
          }
        );
        res.status(200).json({ status: 200, token: authToken });
      } else {
        res.status(400).json({ message: "Wrong password!" });
      }
    } else {
      res.status(404).json({ message: "No user with this email!" });
    }
  } catch (error) {
    console.log(error);
  }
});

//Edit profile

router.get("/host/edit/:id", uploader.single("imageUrl"), async (req, res) => {
  try {
    const { id } = req.params;
    const hostProfile = await Host.findById(id);
    res.json({ ...hostProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No host with this id" });
  }
});

router.put(
  "/host/edit/:id",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, country, city, aboutMe } = req.body;
      const oldHost = await Host.findById(id);
      let image;
      if (req.file) {
        image = req.file.path;
      } else {
        image = oldHost.image;
      }
      const updatedHost = await Host.findByIdAndUpdate(
        id,
        {
          email,
          firstName,
          lastName,
          country,
          city,
          aboutMe,
          image,
        },
        { new: true }
      );
      res.status(200).json({ user: updatedHost });
    } catch (error) {
      res.status(404).json({ message: "No host with this id" });
    }
  }
);

//testing
router.get("/listings", isAuthenticated, async (req, res, next) => {
  try {
    const { user } = req.payload;
    const userId = user._id;
    const listings = await Housing.find({ owner: userId });
    res.status(201).json(listings);
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/listings",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res, next) => {
    try {
      const { user } = req.payload;
      const userId = user._id;
      console.log(req.body);
      const image = req.file.path;
      const { country, city, typeOfRoom, placesAvailable } = req.body;
      const newListing = await Housing.create({
        country,
        city,
        typeOfRoom,
        placesAvailable,
        image,
        owner: userId,
      });
      res.json(newListing);
    } catch (error) {
      console.log(error);
    }
  }
);

router.put(
  "/listings/:id",
  uploader.single("imageUrl"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("body", req.body);
      const { country, city, typeOfRoom, placesAvailable } = req.body;
      let image;
      const oldListing = await Housing.findById(id);
      console.log("Image URL", oldListing.image);
      if (req.file) {
        image = req.file.path;
      } else {
        image = oldListing.image;
      }

      const updatedListing = await Housing.findByIdAndUpdate(
        id,
        {
          country,
          city,
          typeOfRoom,
          placesAvailable,
          image,
        },
        { new: true }
      );
      res.json(updatedListing);
    } catch (error) {
      console.log(error);
    }
  }
);

router.delete("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Housing.findByIdAndDelete(id);
    res.json({ message: "Listing deleted" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/verify", isAuthenticated, (req, res) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json({ payload: req.payload, message: "Token OK" });
});

module.exports = router;
