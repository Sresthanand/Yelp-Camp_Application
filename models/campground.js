const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200"); //cloudinary api help
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review", //ref is object Id from review model
      },
    ],
  },
  opts
);

//For map
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

//This middleware findOneAndDelete will be hit after we delete campground
//runs a function
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    //found a document
    await Review.deleteMany({
      //Deleting
      _id: {
        $in: doc.reviews, //if we find the id matched to that particular campground id which has the review , it deletes it(maybe)
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
