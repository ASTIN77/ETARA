const json2csv    =       require('json2csv').parse;



// CREATE JSON FILE TO DOWNLOAD AND POPULATE
// USING THE FIELDS VARIABLE BELOW TO
// POPULATE AS HEADERS

exports.get = (req, res) => {
    // Create Headers Based On Fault Schema
    const fields = ['mprNo', 'siteName', 'buildingNo', 'streetAddress', 'secondAddress', 'townCity', 'postCode' , 'supplier',
                    'siteContactName', 'siteContactNo', 'msn', 'meterModel', 'meterType', 'meterMake', 'admSerial',
                    'admImei', 'admInstallDate'];
    const opts = {fields};
    const uploadData = '';
    
    // Convert JSON to CSV File
    const csv = json2csv(uploadData, opts);
    
    //Open on users device with filename "uploadMprns.csv"
    res.set("Content-Disposition", "attachment;filename=uploadMprns.csv");
    res.set("Content-Type", "application/octet-stream");
    res.send(csv);
};