// routes/search.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const Fault = require("../models/fault");
const Mprn = require("../models/mprn");
const middleware = require("../middleware/middleware");

// POST /search  — handle ticket or MPRN lookups
router.post("/", middleware.isLoggedIn, async (req, res) => {
  try {
    const ticket = (req.body.ticketRef || "").trim();
    const mprn = (req.body.mprnRef || "").trim();

    // Neither provided
    if (!ticket && !mprn) {
      req.flash(
        "error",
        "Please provide a valid Ticket Reference or valid Meter Point Reference Number."
      );
      return res.redirect("/");
    }

    // If a ticket was provided, prioritize that path (same as your original flow)
    if (ticket) {
      const ticketQuery = { jobRef: ticket };

      const foundFault = await Fault.findOne(ticketQuery).populate("comments");
      if (!foundFault) {
        req.flash("error", "SMSDM Ticket Reference Not Found!");
        return res.redirect("/");
      }

      // Found: bounce to the show route
      return res.redirect(`/search/${foundFault._id}`);
    }

    // Otherwise, handle MPRN search
    if (mprn) {
      const mprnQuery = { mprNo: mprn };

      const foundMprn = await Mprn.find(mprnQuery).populate("comments");
      if (!Array.isArray(foundMprn) || foundMprn.length === 0) {
        req.flash("confirm", "No Details found for this Meter Point.");
        return res.redirect("/");
      }

      // Faults for this MPRN (may be empty)
      let foundFault = await Fault.find(mprnQuery).populate("comments");
      if (!Array.isArray(foundFault) || foundFault.length === 0) {
        foundFault = "-";
      }

      return res.render("search/results", {
        faults: foundFault,
        mprn: foundMprn
      });
    }

    // Fallback (shouldn’t hit due to earlier guards)
    req.flash("error", "Please provide valid search criteria.");
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/");
  }
});

// GET /search/:id — show fault ticket
router.get("/:id", middleware.isLoggedIn, async (req, res) => {
  try {
    const foundFault = await Fault.findById(req.params.id).populate("comments");
    if (!foundFault) {
      req.flash("error", "Fault not found.");
      return res.redirect("/");
    }

    const mprnQuery = { mprNo: foundFault.mprNo };
    const foundMprn = await Mprn.findOne(mprnQuery);

    if (!foundMprn) {
      req.flash("error", "Please enter a valid MPRN!");
      return res.redirect("back");
    }

    return res.render("search/show", { fault: foundFault, mprn: foundMprn });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong loading this ticket.");
    return res.redirect("/");
  }
});

module.exports = router;
