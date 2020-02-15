var 

path    = require("path"),
fs      = require("fs"),
express = require("express"),
fa_path = path.join(__dirname,"node_modules","font-awesome");

if (!fs.existsSync(fa_path)) {
    fa_path = path.join(__dirname,"..","font-awesome");
}


function font_awesome_express(app,url){
    url = url||"/font-awesome";
    console.log(fa_path);
    app.use(url,express.static(fa_path));
    return {
        url_base : url,
        url : path.join(url,"css","font-awesome.css"),
        url_min : path.join(url,"css","font-awesome.min.css")
    };
}
module.exports = font_awesome_express;
