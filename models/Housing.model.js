const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const housingSchema = new Schema(
  {
    city: {
      type: String,
      required: [true, "City is required."],
    },
    typeOfRoom: {
      type: String,
      required: [true, "This is required."],
    },
    placesAvailable: {
      type: Number,
      required: [true, "For how many people do you have space?"],
    },
    image: {
      type: String,
    },
  }
  //   {
  //     // this second object adds extra properties: `createdAt` and `updatedAt`
  //     timestamps: true,
  //   }
);

const Housing = model("Housing", HostSchema);

module.exports = Housing;
