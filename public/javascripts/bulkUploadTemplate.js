const json2csv    =       require('json2csv').parse,
      Fault       =       require('../../models/fault');


// CREATE JSON FILE TO DOWQNLOAD AND POPULATE
// USING THE FIELDS VARIABLE BELOW TO
// POPULATE AS HEADERS

exports.get = (req, res) => {
    // Create Headers Based On Fault Schema
    const fields = ['mprNo', 'faultCat', 'faultIssue'];
    const opts = {fields};
    const uploadData = '';
    
    // Convert JSON to CSV File
    const csv = json2csv(uploadData, opts);
    
    //Open on users device with filename "uploadTickets.csv"
    res.set("Content-Disposition", "attachment;filename=uploadTickets.csv");
    res.set("Content-Type", "application/octet-stream");
    res.send(csv);
};