const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose"); //npm i (passport) (passport-local) (passport-local-mongoose)

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose); //this will do password + unique + everything
module.exports = mongoose.model("User", userSchema);
