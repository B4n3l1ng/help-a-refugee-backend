const { Schema, model } = require("mongoose");

const HousingSchema = new Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required"],
    },

    city: {
      type: String,
      required: [true, "City is required."],
    },
    typeOfRoom: {
      type: String,
      required: [true, "Type of room is required."],
    },
    placesAvailable: {
      type: Number,
      required: [true, "For how many people do you have space?"],
    },
    image: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Host",
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  }
);

const Housing = model("Housing", HousingSchema);

module.exports = Housing;
