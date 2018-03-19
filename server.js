var url = require("url");
var express = require("express");
var app = express();
var MongoClient = require('mongodb').MongoClient;

//var localMongoUrl = "mongodb://localhost:";
var amazonWebUrl = "mongodb://admin:admin@ds061076.mlab.com:61076/urlshort";




var port = process.env.PORT || 3000;
var appUrl;

MongoClient.connect(amazonWebUrl, function(err, db){
    
if(process.env.PORT){
   appUrl= "https://myurlshorty.herokuapp.com/"
} else {
    appUrl = "localhost:" + port + "/" ;
}

app.get("/", function(req,res){
    res.end("<html><body>go to /new/www.url.com to get the url (put the url you want to shorten where it says www.url.com)</body></html>")
})
    
app.get("/favicon.ico",function(req,res){
    res.end("ok")
})
app.get("/new/:long(*?)", function(req, res){
    
	var longUrl = req.params.long;
    var q = req.query;
    q = JSON.stringify(q);
    q = JSON.parse(q);
    var qid = q[0];
    
    //var parsedLong = url.parse(longUrl, true);
    //parsedLong = JSON.stringify(parsedLong);
    console.log("q = "+q)
    longUrl += "?"
    for(var key in q) {
        longUrl += key + "=" + q[key] + "&"
        console.log(key, q[key])
    }
    longUrl = longUrl.slice(0, longUrl.length - 1)

	var uniqueId = new Date().getTime();
	uniqueId = uniqueId.toString();
	uniqueId = uniqueId.slice(0, -2);

	db.collection("urlshort").insert({
		"longUrl": longUrl,
		"shortUrl": appUrl+uniqueId,
		"id": uniqueId
	}, function(error, result){
		if(error){console.log("there was an error writing to the database")}
			console.log(result)

		var obj= result.ops[0];

		var longAndShort = {"longUrl": obj.longUrl, "shortUrl":obj.shortUrl}

		res.send(longAndShort);
	})//end collection insert

})//end long url get request

//when someone does a get request for a unique id, check if it matches one in the database
app.get("/:idNum", function(req, res){
  var idNum = req.params.idNum;
  console.log(idNum)

	db.collection("urlshort").find({
		"id": idNum
	}).toArray(function(error, result){
		if(error){console.log("this short url does not match anything in the database")}
			
		    var l= result[0];
        if( l !== undefined) { 
		l = l.longUrl;
		if(l.indexOf("http") == -1){l = "http://"+l}

		res.redirect(l)
        } else {
            res.end("id " + idNum + " not found")
        }
	})
})



}) //end mongo database connection


app.listen(port, console.log("app listening on port "+port))