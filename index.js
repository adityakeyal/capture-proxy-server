var http = require('http'),
    httpProxy = require('http-proxy');
const parser =  require('node-html-parser');
const parse = parser.parse

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//

/*
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});
*/

proxy.on('proxyRes', function (proxyRes, req, res) {
    var body = [];
    
    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });
    
    proxyRes.on('end', function () {
        body = Buffer.concat(body).toString();
        if(!req.url.endsWith('.json') && res.getHeader("content-type")!=undefined && res.getHeader("content-type").startsWith('text/html')){
            console.log("#############################################################################################")
            console.log("res from proxied server: " , req.url);
            
            const root = parse(body)
            const allSelects = root.querySelectorAll('select')
            const allLabels = root.querySelectorAll('label')
            const labelMap = {}
            for (var i in allLabels){
                labelMap[allLabels[i].attributes['for']]=allLabels[i].rawText
            }
            for(var x in allSelects){

                console.log("-------------------------------------------------------------------------------")

                const id = allSelects[x].attributes['id'] 
                console.log(labelMap[id]==undefined?id:labelMap[id])
                for(var y in allSelects[x].childNodes){
                    console.log(allSelects[x].childNodes[y].rawText)
                }
                
            }
        }
        

        
        res.end("");
    });
});

var server = http.createServer(function(req, res) {
    
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, {
    target: 'http://172.16.29.45:8080'
  });
  
});

console.log("listening on port 5050")
server.listen(5050);