const { genSaltSync, hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Host = require("../models/Host.model");
const Housing = require("../models/Housing.model");
const uploader = require("../middlewares/cloudinary.config");
const nodemailer = require("nodemailer");

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
  "/user/edit/:id",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, aboutMe } = req.body;
      const oldUser = await User.findById(id);
      let image;
      if (req.file) {
        image = req.file.path;
      } else {
        image = oldUser.image;
      }
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { email, firstName, lastName, aboutMe },
        { new: true }
      );
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      res.status(404).json({ message: "No user with this id" });
    }
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
    const listings = await Housing.find().populate(
      "owner",
      "firstName lastName"
    );
    res.json(listings);
  } catch (error) {
    res.status(404).json({ message: "No listings found" });
  }
});
router.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    console.log("USER ID", userId);
    const listing = await Housing.findByIdAndUpdate(
      id,
      { usedBy: userId },
      { new: true }
    );
    console.log("new housing", listing);

    // const { email,subject, message } = req.body.host;
    const transporter = nodemailer.createTransport({
      service: "gmail" ,
      port: 465,
      secure: true,
      auth: {
        user: "hostarefugeeironhack@gmail.com",
        pass: "FTDxtQUom4&%$2kmF95q0U^rMckmpd",
      },
    });

    let details = {
      from: "hostarefugeeironhack@gmail.com",
      to:  `eric.coimbra@gmail.com`,
      subject: "Verify your email",
      text: "Please click the button to verify",
      html: `
      <div style= "background-color: powderblue; text-align: center; padding: 20px; border-radius: 20px">
      <img style="height: 350px" src='cid:logo'/>
      <h2>Ironhack Confirmation Email</h2>
      <h3>Welcome User!</h3>
      <h3>Thanks for joining our community, Please confirm your email by clicking the button below</h3>
      </div>`,
    };

    transporter.sendMail(details, (err) => {
      if (err) {
        console.log("There was an error", err);
      } else {
        console.log("Email has been sent");
      }
    });

    res.status(200);
  } catch (error) {
    console.log(error);
  }
});

//Route for the users to be able to see the listing details including a link to the host profile//
router.get("/user/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listingDetails = await Listing.findById(id);
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



//Route for when the users book a listing it sends a message to the host//
// router.post("/send-email", async (req, res) => {
//   try {
//       const { email,subject, message } = req.body.host;
//       const transporter = nodemailer.createTransport({
//         service: "Gmail",
//         auth: {
//           user: "hostarefugeeironhack@gmail.com",
//           pass: "FTDxtQUom4&%$2kmF95q0U^rMckmpd",
//         },
//       });

//       transporter.sendMail({
//         from: `"Host a Refugee" <hostarefugeeironhack@gmail.com>`,
//         to:  email,
//         subject: subject,
//         text: message,
//         html: `<b>${message}</b>`,
//       });
//       res.status(200).json({ message: "Email sent" });
//     } catch (error) {
//       res.status(404).json({ message: "No email sent" });
//     }
//   });




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
