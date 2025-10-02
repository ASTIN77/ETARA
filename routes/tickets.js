// routes/tickets.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const Fault = require("../models/fault");
const Mprn = require("../models/mprn");
const Comment = require("../models/comment");
const middleware = require("../middleware/middleware");

// ------------------------------------------------------
// CREATE NEW TICKET - GET
// ------------------------------------------------------
router.get("/", middleware.isLoggedIn, (req, res) => {
  return res.render("new/newTicket");
});

// ------------------------------------------------------
// CREATE TICKET WITH MPRN DETAILS - POST (/tickets/mprn)
// ------------------------------------------------------
router.post("/mprn", middleware.isLoggedIn, async (req, res) => {
  try {
    const rawMprn = (req.body.mprn || "").toString().trim();
    if (!rawMprn) {
      req.flash("error", "Please enter a valid MPRN!");
      return res.redirect("/tickets/");
    }

    const mprnNum = Number(rawMprn);
    const mprnQuery = { mprNo: Number.isNaN(mprnNum) ? rawMprn : mprnNum };

    // Check for any outstanding ticket on this MPRN
    const outstanding = await Fault.find({
      mprNo: mprnQuery.mprNo,
      status: "Outstanding"
    }).limit(1);

    if (outstanding.length) {
      const f = outstanding[0];
      const response =
        'An Outstanding Fault Ticket with Reference No: ' +
        `<a href="/search/${f._id}">${f.jobRef}</a> already exists.`;
      req.flash("error", response);
      return res.redirect("/tickets/");
    }

    // Find the MPRN details to prefill the ticket form
    const foundMprn = await Mprn.findOne(mprnQuery);
    if (!foundMprn) {
      req.flash("error", "Please enter a valid mprn!");
      return res.redirect("/tickets/");
    }

    return res.render("new/createTicket", { mprn: foundMprn });
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      "Something went wrong. Please contact the System Administrator"
    );
    return res.redirect("/tickets/");
  }
});

// ------------------------------------------------------
// CREATE NEW TICKET - POST (/tickets/create)
// ------------------------------------------------------
router.post("/create", middleware.isLoggedIn, async (req, res) => {
  try {
    // sanitize visit notes (faultIssue.text)
    if (req.body.faultIssue && typeof req.body.faultIssue.text === "string") {
      req.body.faultIssue.text = req.sanitize(req.body.faultIssue.text);
    }

    const dmAuthor = { id: req.user._id, username: req.user.username };

    const newFaultDoc = {
      mprNo: req.body.mprn,
      meterRead: req.body.meterRead,
      faultCat: req.body.faultCat,
      faultIssue: req.body.faultIssue,
      appDate: req.body.appDate,
      dmAuthor
    };

    const created = await Fault.create(newFaultDoc);

    const response =
      'Fault Ticket Reference SMSDM:  ' +
      `<a href="/search/${created._id}">${created.jobRef}</a> has been successfully created.`;
    req.flash("success", response);
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash(
      "error",
      "Oops, Error Creating New Ticket. Please request assistance from your system administrator."
    );
    return res.redirect("/");
  }
});

// ------------------------------------------------------
// EDIT/UPDATE TICKET - PUT (/tickets/:id)
// ------------------------------------------------------
router.put("/:id", middleware.isLoggedIn, async (req, res) => {
  try {
    // Build the update payload from non-empty fields
    const updatedData = {};
    if (req.body.fault && typeof req.body.fault === "object") {
      for (const key of Object.keys(req.body.fault)) {
        if (req.body.fault[key] !== "") {
          updatedData[key] = req.body.fault[key];
        }
      }
    }

    // sanitize visit notes in comment, if provided
    if (req.body.comment && typeof req.body.comment.text === "string") {
      req.body.comment.text = req.sanitize(req.body.comment.text);
    }

    // Update the Fault document
    const updatedFault = await Fault.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedFault) {
      req.flash("error", "Ticket not found. No updates saved.");
      return res.redirect("/");
    }

    // If there is a new comment, create it and attach to the fault
    if (req.body.comment && req.body.comment.text) {
      const comment = await Comment.create({
        ...req.body.comment,
        dmAuthor: { id: req.user._id, username: req.user.username }
      });

      updatedFault.comments.push(comment._id);
      await updatedFault.save();
    }

    // Update MPRN details if provided
    if (req.body.mprn && typeof req.body.mprn === "object") {
      const updatedMprnData = {};
      for (const key of Object.keys(req.body.mprn)) {
        if (req.body.mprn[key] !== "") {
          updatedMprnData[key] = req.body.mprn[key];
        }
      }
      if (Object.keys(updatedMprnData).length > 0 && req.body.mprn.mprNo) {
        await Mprn.findOneAndUpdate(
          { mprNo: req.body.mprn.mprNo },
          updatedMprnData,
          { new: true }
        );
      }
    }

    const jobRefOut = updatedData.jobRef || updatedFault.jobRef || "Unknown";
    const response =
      'Fault Ticket Reference SMSDM:  ' +
      `<a href="/search/${req.params.id}">${jobRefOut}</a> has been successfully updated.`;
    req.flash("success", response);
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "An error has occured. No updates have been saved.");
    return res.redirect("/");
  }
});

// ------------------------------------------------------
// DELETE TICKET - DELETE (/tickets/:id)
// ------------------------------------------------------
router.delete("/:id", middleware.isLoggedIn, async (req, res, next) => {
  try {
    const foundTicket = await Fault.findById(req.params.id).populate("comments");
    if (!foundTicket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/");
    }

    // Remove all associated comments, then the ticket itself
    const commentIds = (foundTicket.comments || []).map((c) =>
      typeof c === "object" && c._id ? c._id : c
    );

    await Promise.all([
      commentIds.length
        ? Comment.deleteMany({ _id: { $in: commentIds } })
        : Promise.resolve(),
      Fault.findByIdAndDelete(req.params.id)
    ]);

    req.flash(
      "success",
      `Ticket SMSDM ${foundTicket.jobRef} successfully removed.`
    );
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
