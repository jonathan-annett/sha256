
var 

path = require("path"),
fs=require("fs"),
express=require("express"),
fa_path=path.join(__dirname,"node_modules","font-awesome");


function font_awesome_express(app,url){
    app.use(url||"/font-awesome",express.static(fa_path));
}

module.exports = font_awesome_express;