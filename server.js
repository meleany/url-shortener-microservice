// New URL Shortener Microservice Project by Yasmin Melean 31/08/2019
// init project
const dns = require('dns');
const url = require('url');
const shortid = require('shortid');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Require CORS to allow FCC the remote testing of the API.
// More about Cors: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing.
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200})); // Some legacy browsers (IE11, various SmartTVs) choke on 204

// Global setting for safety timeouts to handle callbacks that will never be called.
var timeout = 10000;

// Start MonngoDB connection to the database 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}).catch(error => console.log(error));

// Use mongoose basic Schema types to create the Model.
const Schema = mongoose.Schema; 
var urlSchema = new Schema({
  originalUrl: String,
  shortUrl: String
});
var Url = mongoose.model('Url', urlSchema);

// Find the original Url given the short url.
var findUrlByShortid = function(shortid, done) {
  Url.find({shortUrl: shortid}, function(err, data){
    err ? done(err) : done(null, data);
  });
};

// Find the url object given the original url.
var findUrlByOriginalUrl = function(href, done) {
  Url.find({originalUrl: href}, function(err, data){
    err ? done(err) : done(null, data);
  });
}

// Create a document instance using the Url constructor.
var createAndSaveUrl = function(href, shortid, done) {
  var newUrl = new Url({originalUrl: href, shortUrl: shortid});
  newUrl.save(function(err, data) {
    if(err){
      return done(err);
    }else{
      done(null, data);
    }
  });
};

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(urlencodedParser);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/api/shorturl/*', function(req, res, next) {
  var t = setTimeout(() => {next({message: 'timeout'})}, timeout);
  var shortid=req.params[0];
  console.log(shortid);
  // Find the original Url given the short url. Use Model.Find() using the shortid as search key.
  findUrlByShortid(shortid, function(err, data){
    clearTimeout(t);
    if(err) { return next(err) }
    if(!data){
      console.log("Missing 'done()' argument");
      return next({message: 'Missing callback argument'});
    }
    if(data.length == 0) {
      res.json({"ERROR": "Invalid shortened url, no url found for given input."});
    }else{
      res.redirect(data[0].originalUrl); 
    }
  });  
});

app.post('/api/shorturl/new', urlencodedParser, function(req, res, next) {
  var addr = req.body.url;
  var parsedUrl = url.parse(addr, true); // The url.parse() method takes a URL string, parses it, and returns a URL object.
  var urlHost = parsedUrl.host;          
  var urlHref = parsedUrl.href;
  var t = setTimeout(() => {next({message: 'timeout'})}, timeout);
  
  if(urlHost){
  // Use the function dns.lookup(host, cb) to check if the submitted URL points to a valid site. 
    dns.lookup(urlHost, (err, addresses, family) => {
      if(addresses){
        const shortUrl = shortid.generate();
        findUrlByOriginalUrl(urlHref, function(err, data){
          clearTimeout(t);
          if(err) { return next(err) }
          if(!data){
            console.log("Missing 'done()' argument");
            return next({message: 'Missing callback argument in find original url'});
          }
          if(data.length == 0) {
            createAndSaveUrl(urlHref, shortUrl, function(err, data2){
              clearTimeout(t);
              if(err) { return next(err) }
              if(!data2) {
                console.log("Missing 'done()' argument");
                return next({message: 'Missing callback argument in create and save url'});
              }
              res.json({"original_url": urlHref, "short_url": shortUrl});
            });
          }else{
            res.json({"original_url": data[0].originalUrl, "short_url": data[0].shortUrl}); 
          }
        });
      }else{
        res.json({"error": "invalid URL"});
      }
    });    
  }else{
    res.json({"error": "invalid URL"});
  }
});

/* 
// Equivalent to POST method using GET. Do not implement as the redirect GET method has similar end point.
app.get('/api/shorturl/new*', function(req, res) {
  var addr = req.params[0];
  var parsedUrl = url.parse(addr, true); // The url.parse() method takes a URL string, parses it, and returns a URL object.
  var urlHost = parsedUrl.host;          
  
  if(urlHost){
  // Use the function dns.lookup(host, cb) to check if the submitted URL points to a valid site. 
    dns.lookup(urlHost, (err, addresses, family) => {
      if(addresses){
        const shortUrl = shortid.generate();
        res.json({"original_url": parsedUrl.href, "short_url": shortUrl});
      }else{
        res.json({"error": "invalid URL"});
      }
    });    
  }else{
    res.json({"error": "invalid URL"});
  }
});
*/

// Starts the server and listens for requests in PORT
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app ULR Shortener Microservice is listening on port ' + listener.address().port);
});