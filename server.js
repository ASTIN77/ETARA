var express     =       require('express'),
    ejs         =       require('ejs'),
    app         =       express();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.set('port', process.env.PORT);  
    
    
app.get("/", function (req,res){
    res.render("index");
}) ;  
    
    
    
    
    
    
    
    
app.listen(app.get('port'), function(){
    console.log('SMS-Astech Portal Successfully Started');
});