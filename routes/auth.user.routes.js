const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Host = require("../models/Host.model");
const Housing = require("../models/Housing.model");
const uploader = require("../middlewares/cloudinary.config");

router.post("/upload", uploader.single("imageUrl"), (req, res, next) => {
  console.log("file is:", req.file.path);
});

router.post("/signup", uploader.single("imageUrl"), async (req, res) => {
  try {
    console.log("hello", req.body);
    const { email, password, firstName, lastName, aboutMe } = req.body;
    const image = req.file.path;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      aboutMe,
      image,
    });
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status.json({ message });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentUser = await User.findOne({ email });

    if (currentUser) {
      if (compareSync(password, currentUser.hashedPassword)) {
        const userCopy = { ...currentUser._doc };
        delete userCopy.hashedPassword;
        const authToken = jwt.sign(
          {
            expiresIn: "24h",
            user: userCopy,
          },
          process.env.TOKEN_SECRET,
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
  } catch (error) {
    console.log(error);
  }
});

//Get profile//
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userProfile = await User.findById(id);
    res.json({ ...userProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No user with this id" });
  }
});

//Edit profile//
router.get(
  "/user/edit/:id",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userProfile = await User.findById(id);
      res.json({ ...userProfile._doc });
    } catch (error) {
      res.status(404).json({ message: "No user with this id" });
    }
  }
);

router.put(
  "/edit/:id",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const userProfile = await User.findByIdAndUpdate(id, body, { new: true });
    console.log(userProfile);

    res.json({ user: userProfile });
  }
);

//Delete profile//
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const userProfile = await User.findByIdAndDelete(id);

  res.status(201).json({ message: "Please create an user" });
});

//Route for the users to be able to see all of the listings posted by the hosts//
router.get("/listings", uploader.single("imageUrl"), async (req, res) => {
  try {
    const listings = await Housing.find();
    res.json(listings);
  } catch (error) {
    res.status(404).json({ message: "No listings found" });
  }
});

//Route for the users to be able to see the listing details including a link to the host profile//
router.get("/user/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listingDetails = await Listing.findById(id).populate("host");
    res.json(listingDetails);
  } catch (error) {
    res.status(404).json({ message: "No listing with this id" });
  }
});

//Route for the user to be able to see the host's profile page//
router.get("/host/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hostProfile = await Host.findById(id);
    res.json({ ...hostProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No host with this id" });
  }
});

// Route for the users to be able to message the host from the listing page regarding the listing//
router.post("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const listingDetails = await Listing.findById(id).populate("host");
    res.json(listingDetails);
  } catch (error) {
    res.status(404).json({ message: "No listing with this id" });
  }
});

//Route for the users to be able to see the messages they have received from the hosts//
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(404).json({ message: "No messages found" });
  }
});

//Route for users to be able to read messages individually and delete them//
router.get("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const messageDetails = await Message.findById(id).populate("host");
    res.json(messageDetails);
  } catch (error) {
    res.status(404).json({ message: "No message with this id" });
  }
});

router.delete("/messages/:id", async (req, res, next) => {
  const { id } = req.params;
  const messageDetails = await Message.findByIdAndDelete(id).populate("host");
  res.json(messageDetails);
});

//Route for the users to be able to reply to the messages they have received from the hosts//
router.post("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const messageDetails = await Message.findById(id).populate("host");
    res.json(messageDetails);
  } catch (error) {
    res.status(404).json({ message: "No message with this id" });
  }
});

//Route for the users to be able to book a listing//
router.post("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const listingDetails = await Housing.findById(id)
      .populate("host")
      .populate("user");
    res.json(listingDetails);
  } catch (error) {
    res.status(404).json({ message: "No listing with this id" });
  }
});

//Route for the users to be able to see the listing they have booked//
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Housing.find();
    res.json(bookings);
  } catch (error) {
    res.status(404).json({ message: "No bookings found" });
  }
});

//Route for the users to be able to see the booking details including a link to the host profile//
router.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bookingDetails = await Housing.findById(id).populate("host");
    res.json(bookingDetails);
  } catch (error) {
    res.status(404).json({ message: "No booking with this id" });
  }
});

router.get("/verify", isAuthenticated, (req, res) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json({ payload: req.payload, message: "Token OK" });
});

module.exports = router;
