// routes/uploads.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const fileUpload = require("express-fileupload");
const csv = require("fast-csv");

const ticketTemplate = require("../public/javascripts/newTicketsUpload.js");
const mprnTemplate = require("../public/javascripts/newMprnsUpload.js");
const cancellationTemplate = require("../public/javascripts/newCancellationsUpload.js");
const updateTicketsTemplate = require("../public/javascripts/updateTickets.js");

const Fault = require("../models/fault");
const Mprn = require("../models/mprn");
const Comment = require("../models/comment");
const mongoose = require("mongoose");
const middleware = require("../middleware/middleware");

router.use(fileUpload());

// Helper: parse CSV string -> array of rows
function parseCsvString(str, options = { headers: true, ignoreEmpty: true }) {
  return new Promise((resolve, reject) => {
    const rows = [];
    // Support both fast-csv APIs (fromString older, parseString newer)
    const parser =
      (csv.parseString ? csv.parseString(str, options) : csv.fromString(str, options));

    parser
      .on("error", reject)
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows));
  });
}

// ------------------------------------------------------
// PAGES (GET)
// ------------------------------------------------------
router.get("/tickets", middleware.isLoggedIn, (req, res) => {
  return res.render("uploads/newTickets");
});

router.get("/mprns", middleware.isLoggedIn, (req, res) => {
  return res.render("uploads/newMprns");
});

router.get("/cancellations", middleware.isLoggedIn, (req, res) => {
  return res.render("uploads/newCancellations");
});

router.get("/updateTickets", middleware.isLoggedIn, (req, res) => {
  return res.render("uploads/updateTickets");
});

// Templates
router.get("/faultTemplate", middleware.isLoggedIn, ticketTemplate.get);
router.get("/mprnTemplate", middleware.isLoggedIn, mprnTemplate.get);
router.get("/cancellationTemplate", middleware.isLoggedIn, cancellationTemplate.get);
router.get("/updateTicketsTemplate", middleware.isLoggedIn, updateTicketsTemplate.get);

// ------------------------------------------------------
// UPLOAD: TICKETS (CSV)  POST /uploads/tickets
// ------------------------------------------------------
router.post("/tickets", middleware.isLoggedIn, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.file;
    const rows = await parseCsvString(file.data.toString());

    // Enrich and insert
    const dmAuthor = { id: req.user._id, username: req.user.username };
    const docs = rows.map((r) => ({
      ...r,
      _id: new mongoose.Types.ObjectId(),
      dmAuthor
    }));

    const inserted = await Fault.insertMany(docs, { ordered: false });
    req.flash("success", `${inserted.length} Fault Ticket(s) have been successfully uploaded.`);
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Please check the uploaded file for errors.");
    return res.redirect("/");
  }
});

// ------------------------------------------------------
// UPLOAD: MPRNS (CSV)  POST /uploads/mprns
// ------------------------------------------------------
router.post("/mprns", middleware.isLoggedIn, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.file;
    const rows = await parseCsvString(file.data.toString());

    const dmAuthor = { id: req.user._id, username: req.user.username };
    const docs = rows.map((r) => ({
      ...r,
      _id: new mongoose.Types.ObjectId(),
      dmAuthor
    }));

    const inserted = await Mprn.insertMany(docs, { ordered: false });
    req.flash("success", `${inserted.length} MPRN record(s) have been successfully uploaded.`);
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Please check the uploaded file for errors.");
    return res.redirect("/");
  }
});

// ------------------------------------------------------
// UPLOAD: CANCELLATIONS (CSV)  POST /uploads/cancellations
// ------------------------------------------------------
router.post("/cancellations", middleware.isLoggedIn, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.file;
    const rows = await parseCsvString(file.data.toString());

    // Build bulk updates: set status + isCancelledReason by jobRef
    const ops = rows
      .map((r) => {
        const jobRef = r.jobRef;
        const status = r.status;
        const isCancelledReason = r.isCancelledReason;

        if (!jobRef) return null;

        return {
          updateOne: {
            filter: { jobRef: Number(jobRef) || jobRef },
            update: { $set: { status, isCancelledReason } },
            upsert: false
          }
        };
      })
      .filter(Boolean);

    if (ops.length === 0) {
      req.flash("error", "No valid rows to process.");
      return res.redirect("/");
    }

    await Fault.bulkWrite(ops, { ordered: false });
    req.flash("success", "Fault Ticket(s) have been successfully cancelled.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Please check the uploaded file for errors.");
    return res.redirect("/");
  }
});

// ------------------------------------------------------
// UPLOAD: UPDATE TICKETS (CSV)  POST /uploads/updateTickets
// ------------------------------------------------------
router.post("/updateTickets", middleware.isLoggedIn, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.file;
    const rows = await parseCsvString(file.data.toString());

    // Process each row sequentially to preserve intent and avoid rate spikes
    for (const item of rows) {
      const jobRefNum = Number(item.jobRef);
      const jobRef = Number.isNaN(jobRefNum) ? item.jobRef : jobRefNum;

      if (!jobRef) continue;

      // Build updates
      const set = {};
      if (item.status) set.status = item.status;
      if (item.faultCat) set.faultCat = item.faultCat;
      if (item.meterRead) set.meterRead = item.meterRead;

      // Parse dates if present
      if (item.appDate) {
        const d = new Date(item.appDate);
        if (!isNaN(d)) set.appDate = d;
      }
      if (item.attendedDate) {
        const d = new Date(item.attendedDate);
        if (!isNaN(d)) set.attendedDate = d;
      }

      // Update the fault; request the updated doc back
      const updatedFault = await Fault.findOneAndUpdate(
        { jobRef },
        set,
        { new: true }
      );

      // Create and attach a comment (optional)
      const commentText = item.comment && String(item.comment).trim();
      if (updatedFault && commentText) {
        const comment = await Comment.create({
          text: commentText,
          dmAuthor: { id: req.user._id, username: req.user.username }
        });

        updatedFault.comments.push(comment._id);
        await updatedFault.save();
      }
    }

    req.flash("success", "Fault Ticket(s) have been successfully updated.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Please check the updates file for errors.");
    return res.redirect("/");
  }
});

module.exports = router;
