const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const HostSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: [true, "Password is required."],
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    image: {
      type: String,
    },
    aboutMe: {
      type: String,
    },
    
  }
);

const Host = model("Host", HostSchema);

module.exports = Host;
