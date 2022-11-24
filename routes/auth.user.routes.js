const { genSaltSync, hashSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");

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

    if (email) {
      if (compareSync(password, currentUser.hashedPassword)) {
        const userCopy = { ...currentUser };
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
  res.json("Pinging login");
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

//Log out route//
router.get("/logout", (req, res, next) => {});

module.exports = router;
