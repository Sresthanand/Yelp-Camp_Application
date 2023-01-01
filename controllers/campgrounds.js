const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //mapbox provide geo-coding api
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  //console.log(campgrounds);
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  //if error comes from catchAsync it passes to next that is error middleware/route
  // if (!req.body.campground)throw new ExpressError("Invalid Campground Data", 400);
  //Server side validations using Joi
  //client side validations using Bootstrap
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    //from multer
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id; //setting author (username)
  await campground.save();
  // console.log(campground);
  req.flash("success", "Successfully made a new Campround!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author"); //through populate now particularly review will be shown
  if (!campground) {
    req.flash("error", "Cannot find that camprgound!");
    return res.redirect("/campgrounds");
  }
  //console.log(req.user);
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    //from multer
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  //deleting
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      //deleting from cloudinary
      await cloudinary.uploader.destroy(filename);
    }
    campground.updateOne({
      //deleting from mongo
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated Campround!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campround!");
  res.redirect(`/campgrounds`);
};
