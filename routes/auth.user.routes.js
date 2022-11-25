const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Host = require("../models/Host.model");
const Housing = require("../models/Housing.model");


router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await User.create({ email, hashedPassword, firstName, lastName });
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

//Edit profile//
router.get("/user/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userProfile = await User.findById(id);
    res.json({ ...userProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No user with this id" });
  }
});

router.put("/user/edit/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const userProfile = await User.findByIdAndUpdate(id, body, { new: true });

  res.json({ userProfile });
});

//Delete profile//
router.delete("/user/:id", async (req, res, next) => {
  const { id } = req.params;
  const userProfile = await User.findByIdAndDelete(id);

  res.json(userProfile);
});

//Route for the users to be able to see all of the listings posted by the hosts//
router.get("/user/listings", async (req, res) => {
  try {
    const listings = await Listing.find();
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
router.get("/user/host/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hostProfile = await Host.findById(id);
    res.json({ ...hostProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No host with this id" });
  }
});

// Route for the users to be able to message the host from the listing page regarding the listing//
router.post("/user/listings/:id", async (req, res) => {
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
router.get("/user/messages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(404).json({ message: "No messages found" });
  }
});

//Route for users to be able to read messages individually and delete them//
router.get("/user/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const messageDetails = await Message.findById(id).populate("host");
    res.json(messageDetails);
  } catch (error) {
    res.status(404).json({ message: "No message with this id" });
  }
});

router.delete("/user/messages/:id", async (req, res, next) => {
  const { id } = req.params;
  const messageDetails = await Message.findByIdAndDelete(id).populate("host");
  res.json(messageDetails);
});

//Route for the users to be able to reply to the messages they have received from the hosts//
router.post("/user/messages/:id", async (req, res) => {
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
router.post("/user/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const listingDetails = await Housing
      .findById(id)
      .populate("host")
      .populate("user");
    res.json(listingDetails);
  } catch (error) {
    res.status(404).json({ message: "No listing with this id" });
  }
});


//Route for the users to be able to see the listing they have booked//
router.get("/user/bookings", async (req, res) => {
  try {
    const bookings = await Housing.find();
    res.json(bookings);
  } catch (error) {
    res.status(404).json({ message: "No bookings found" });
  }
});

//Route for the users to be able to see the booking details including a link to the host profile//
router.get("/user/bookings/:id", async (req, res) => {
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

//Log out route//
router.get("/logout", (req, res, next) => {});

module.exports = router;
