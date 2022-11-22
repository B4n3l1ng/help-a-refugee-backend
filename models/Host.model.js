const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const hostSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
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
    image: {
      type: String,
    },
  }
  //   {
  //     // this second object adds extra properties: `createdAt` and `updatedAt`
  //     timestamps: true,
  //   }
);

const Host = model("Host", HostSchema);

module.exports = Host;
