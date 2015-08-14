var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "/home/famhist/ordorg/examples";
http.createServer(function (req, res){
  var urlObj = url.parse(req.url, true, false);
  fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
  console.log(ROOT_DIR+urlObj.pathname);
    if(err)
     {
	console.log("we had an error");
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
     }
	console.log("we got here");
     res.writeHead(200);
     res.end(data);
  });

}).listen(3000);

