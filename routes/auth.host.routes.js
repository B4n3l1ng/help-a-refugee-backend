const { hashSync, genSaltSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const Host = require("../models/Host.model");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, city, picture } =
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
//testing
/*router.get("/listings", async (req, res, next) => {
  try {
    const listings = await Housing.find({ owner: authToken.user._id });

    res.status(201).json(listings);
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
});*/

module.exports = router;
