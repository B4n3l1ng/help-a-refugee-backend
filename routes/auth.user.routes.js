const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const router = require("express").Router();
const User = require("../models/User.model");

Router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await User.create({ email, hashedPassword });
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.log(error);
  }
});

Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const currentUser = await User.findOne({ email });

    if (email) {
      if (compareSync(password, currentUser.hashedPassword)) {
        const userCopy = { ...currentUser._doc };
        delete userCopy.hashedPassword;
        //       const authToken = jwt.sign(
        //         {
        //           expiresIn: '24h',
        //           user: userCopy,
        //         },
        //         process.env.TOKEN_SECRET,
        //         {
        //           algorithm: 'HS256'
        //         }
        //       )
        //     res.status(200).json({ status: 200, token: authToken })
        //   } else {
        //     res.status(400).json({ message: 'Wrong password' })
        //   }
        // } else {
        //   res.status(404).json({ message: 'No user with this username' })
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
