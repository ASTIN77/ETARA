const json2csv    =       require('json2csv').parse;



// CREATE JSON FILE TO DOWQNLOAD AND POPULATE
// USING THE FIELDS VARIABLE BELOW TO
// POPULATE AS HEADERS

exports.get = (req, res) => {
    // Create Headers Based On Fault Schema
    const fields = ['jobRef', 'status', 'isCancelledReason'];
    const opts = {fields};
    const uploadData = '';
    
    // Convert JSON to CSV File
    const csv = json2csv(uploadData, opts);
    
    //Open on users device with filename "uploadTickets.csv"
    res.set("Content-Disposition", "attachment;filename=cancellationTickets.csv");
    res.set("Content-Type", "application/octet-stream");
    res.send(csv);
};