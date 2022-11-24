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

router.get("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Housing.findById(id);
    res.json(listing);
  } catch (error) {
    console.log(error);
  }
});

// router.post("/listings", async (req, res, next) => {
//   try {
//     const { country, city, typeOfRoom, placesAvailable, image } = req.body;
//     const newListing = await Housing.create({
//       country,
//       city,
//       typeOfRoom,
//       placesAvailable,
//       image,
//     });
//     res.json(newListing);
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.put("/listings/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { country, city, typeOfRoom, placesAvailable, image } = req.body;
//     const updatedListing = await Housing.findByIdAndUpdate(
//       id,
//       {
//         country,
//         city,
//         typeOfRoom,
//         placesAvailable,
//         image,
//       },
//       { new: true }
//     );
//     res.json(updatedListing);
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.delete("/listings/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const deletedListing = await Housing.findByIdAndDelete(id);
//     res.json(deletedListing);
//   } catch (error) {
//     console.log(error);
//   }
// });


module.exports = router;
