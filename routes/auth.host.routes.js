const { hashSync, genSaltSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const Host = require("../models/Host.model");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, city, picture, aboutMe } =
      req.body;
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
      aboutMe
    });
    res.status(201).json({ message: "Host created" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide both email and password." });
    return;
  }
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
    const { email, password, firstName, lastName, country, city, picture, aboutMe } = req.body;
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
router.get("/listings", async (req, res, next) => {
  try {
    const listings = await Housing.find({ owner: authToken.user._id });

    res.status(201).json(listings);
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








module.exports = router;
