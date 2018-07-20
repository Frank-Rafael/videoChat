const https = require('https');
const http = require('http');
const app = require('./app');
const fs = require('fs');
const config = require('config');
//httpport = process.env.PORT || config.get('host').httpport ||8080,
// httpsport = process.env.SECURE_PORT || config.get('host').httpsport ||8443;
const  httpport = 8080,
      httpsport = 443;

var httpsOptions = {
    key: fs.readFileSync('./app/cert/server.key')
    , cert: fs.readFileSync('./app/cert/server.crt')
};

https.createServer(httpsOptions, app).listen(httpsport, function (err) {
    if (err) {
        throw err
    }
    console.log('Secure server is listening on '+httpsport+'...');
});

http.createServer(app).listen(httpport, function(err) {
    if (err) {
        throw err
    }
    console.log('Insecure server is listening on port ' + httpport + '...');
});

