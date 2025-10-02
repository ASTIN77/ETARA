// routes/mprns.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const Mprn = require("../models/mprn");
const middleware = require("../middleware/middleware");

// ------------------------------------------------------
// CREATE NEW MPRN - GET
// ------------------------------------------------------
router.get("/", middleware.isLoggedIn, (req, res) => {
  return res.render("new/newMprn");
});

// ------------------------------------------------------
// CREATE NEW MPRN - POST
// ------------------------------------------------------
router.post("/create", middleware.isLoggedIn, async (req, res) => {
  try {
    // Sanitize any free-text field if present
    if (typeof req.body.text === "string") {
      req.body.text = req.sanitize(req.body.text);
    }

    // Helper: trim strings
    const s = (v) => (typeof v === "string" ? v.trim() : v);

    // Cast MPRN to number when possible, otherwise keep original
    const mprnNum = Number(req.body.mprn);
    const mprNo = Number.isNaN(mprnNum) ? s(req.body.mprn) : mprnNum;

    const mprnDetails = {
      mprNo,
      supplier: s(req.body.supplier),
      siteName: s(req.body.siteName),
      buildingNo: s(req.body.buildingNo),
      streetAddress: s(req.body.streetAddress1),
      secondAddress: s(req.body.streetAddress2),
      townCity: s(req.body.townCity),
      postCode: s(req.body.postCode),
      siteContactName: s(req.body.siteContact),
      siteContactNo: s(req.body.contactNo),
      msn: s(req.body.msn),
      meterMake: s(req.body.meterMake),
      meterModel: s(req.body.meterModel),
      meterType: s(req.body.meterType),
      admImei: s(req.body.admImei),
      admSerial: s(req.body.admSerial)
    };

    const newMprn = await Mprn.create(mprnDetails);

    const response = `Mprn: ${newMprn.mprNo} has been successfully created.`;
    req.flash("success", response);
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    let msg =
      "Oops, Error Creating Mprn. Please request assistance from your system administrator.";
    // Friendly duplicate key message (common on unique mprNo)
    if (err && err.code === 11000) {
      msg = "This MPRN already exists.";
    }
    req.flash("error", msg);
    return res.redirect("/");
  }
});

module.exports = router;
