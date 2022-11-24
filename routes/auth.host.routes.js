const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = require("express").Router();
const Host = require("../models/Host.model");
const User = require("../models/User.model");
const Housing = require("../models/Housing.model");
const { compareSync, genSaltSync, hashSync } = require("bcryptjs");

router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      country,
      city,
      picture,
      aboutMe,
    } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await Host.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      country,
      city,
      picture,
      aboutMe,
    });
    res.status(201).json({ message: "Host created" });
  } catch (error) {
    console.log(error);
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
        res.status(400).json({ message: "Wrong password" });
      }
    } else {
      res.status(404).json({ message: "No user with this username" });
    }
  } catch (error) {
    console.log(error);
  }
});

//Edit profile

router.get("/host/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hostProfile = await Host.findById(id);
    res.json({ ...hostProfile._doc });
  } catch (error) {
    res.status(404).json({ message: "No host with this id" });
  }
});

router.put("/host/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      password,
      firstName,
      lastName,
      country,
      city,
      picture,
      aboutMe,
    } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    const updatedHost = await Host.findByIdAndUpdate(
      id,
      {
        email,
        hashedPassword,
        firstName,
        lastName,
        country,
        city,
        picture,
        aboutMe,
      },
      { new: true }
    );
    res.status(200).json({ ...updatedHost._doc });
  } catch (error) {
    res.status(404).json({ message: "No host with this id" });
  }
});

//testing
router.get("/listings", isAuthenticated, async (req, res, next) => {
  try {
    const { user } = req.payload;
    const userId = user._id;
    git;
    //const listings = await Housing.find({ owner: authToken.user._id });

    //res.status(201).json(listings);
  } catch (error) {
    console.log(error);
  }
});

router.get("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Housing.findById(id);
    res.json(listing);
  } catch (error) {
    console.log(error);
  }
});

router.post("/listings", async (req, res, next) => {
  try {
    const { country, city, typeOfRoom, placesAvailable, image } = req.body;
    const newListing = await Housing.create({
      country,
      city,
      typeOfRoom,
      placesAvailable,
      image,
      owner: authToken.user._id,
    });
    res.json(newListing);
  } catch (error) {
    console.log(error);
  }
});

router.put("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country, city, typeOfRoom, placesAvailable, image } = req.body;
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
});

router.delete("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Housing.findByIdAndDelete(id);
    res.json({ message: "Listing deleted" });
  } catch (error) {
    console.log(error);
  }
});

//Route for the host to see and receive the messages from the users and to be able to reply to them
router.get("/messages", async (req, res, next) => {
  try {
    const messages = await Message.find({ owner: authToken.user._id });
    res.status(201).json(messages);
  } catch (error) {
    console.log(error);
  }
});

router.get("/messages/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id)
      .populate("owner")
      .populate("user");
    res.json(message);
  } catch (error) {
    console.log(error);
  }
});

router.post("/messages", async (req, res, next) => {
  try {
    const { message, sender, receiver } = req.body;
    const newMessage = await Message.create({
      message,
      sender,
      receiver,
      owner: authToken.user._id,
    });
    res.json(newMessage);
  } catch (error) {
    console.log(error);
  }
});

router.put("/messages/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, sender, receiver } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      {
        message,
        sender,
        receiver,
      },
      { new: true }
    );
    res.json(updatedMessage);
  } catch (error) {
    console.log(error);
  }
});

//Route for the host to be able to see the users profile who is messaging them
router.get("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("user");
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

//Route for the host to be able to delete the messages
router.delete("/messages/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/verify", isAuthenticated, (req, res) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json({ payload: req.payload, message: "Token OK" });
});

module.exports = router;
