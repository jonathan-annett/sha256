var 

path    = require("path"),
fs      = require("fs"),
express = require("express"),
fa_path = path.join(__dirname,"node_modules","font-awesome");


function font_awesome_express(app,url){
    url = url||"/font-awesome";
    app.use(url,express.static(fa_path));
    return {
        url_base : urlm
        url : path.join(url,"css","font-awesome.css");
        url_min : path.join(url,"css","font-awesome.min.css");
}
module.exports = font_awesome_express;