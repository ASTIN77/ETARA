// routes/reports.js
const express   = require("express");
const router    = express.Router({ mergeParams: true });
const { parse: json2csv } = require("json2csv");

const Fault      = require("../models/fault");
const middleware = require("../middleware/middleware");

// Build Report UI
router.get("/", middleware.isLoggedIn, (req, res) => {
  return res.render("reports/buildReport");
});

// Run report query / export
router.post("/query", middleware.isLoggedIn, async (req, res) => {
  try {
    const body = req.body || {};
    const reportQuery = {};

    // Date filter (requestedDate as a single day range)
    const requestedDateRaw = (body.requestedDate || "").trim();
    if (requestedDateRaw.length) {
      const startDate = new Date(requestedDateRaw);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(requestedDateRaw);
      endDate.setHours(23, 59, 59, 999);
      reportQuery.requestedDate = { $gte: startDate, $lte: endDate };
    }

    // Copy over non-empty fields
    for (const key of Object.keys(body)) {
      const val = body[key];
      if (val !== "" && key !== "action" && key !== "requestedDate") {
        reportQuery[key] = val;
      }
    }

    // Cast numeric fields if present
    if (body.mprNo) {
      const n = Number(body.mprNo);
      if (!Number.isNaN(n)) reportQuery.mprNo = n;
    }
    if (body.jobRef) {
      const j = Number(body.jobRef);
      if (!Number.isNaN(j)) reportQuery.jobRef = j;
    }

    // Aggregation: join to mprns collection on mprNo
    const pipeline = [
      { $match: reportQuery },
      {
        $lookup: {
          from: "mprns",
          let: { mprNo: "$mprNo" },
          pipeline: [
            { $match: { $expr: { $eq: ["$mprNo", "$$mprNo"] } } }
          ],
          as: "siteDetails"
        }
      },
      { $unwind: "$siteDetails" }
    ];

    const faultResults = await Fault.aggregate(pipeline).exec();

    if (body.action === "Export Report") {
      // CSV export
      const fields = [
        "mprNo",
        "siteDetails.siteName",
        "siteDetails.buildingNo",
        "siteDetails.streetAddress",   // fixed key
        "siteDetails.secondAddress",
        "siteDetails.townCity",
        "siteDetails.postCode",
        "siteDetails.supplier",
        "siteDetails.siteContactName",
        "siteDetails.siteContactNo",
        "siteDetails.msn",
        "siteDetails.meterModel",
        "siteDetails.meterType",
        "siteDetails.meterMake",
        "siteDetails.admSerial",
        "siteDetails.admImei",
        "siteDetails.admInstallDate"
      ];

      const csv = json2csv(faultResults, { fields });
      res.set("Content-Disposition", "attachment;filename=reportResults.csv");
      res.set("Content-Type", "text/csv");
      return res.status(200).send(csv);
    }

    // Render HTML results
    return res.render("reports/reportResults", { queryResults: faultResults });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please check and try again!");
    return res.render("index");
  }
});

module.exports = router;
