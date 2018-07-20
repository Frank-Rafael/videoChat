var express = require('express');
var https= require('https');
var path = require('path');
// Constructor
function CallIdentifier() {
    var router = express.Router();
    // check if method is defined in request
	
    router.use('/:callID', function(req, res, next){
		let callID = req.params.callID;
		if(!callID || callID == 'xxx'){
			res.sendFile('/other/not-found.html', { root: path.join(__dirname, '../public') });
		}
		else{
			let profe = req.params.callID;
			let isValid = profe == 'profe123' ? true : false;
			if(isValid){
				console.log('Profesor: ' + req.params.callID + " tiene sesion");
				next();
			}else{
				console.log('Profesor: ' + req.params.callID + " no tiene sesion");
				res.sendFile('/other/not-session.html', { root: path.join(__dirname, '../public') });
			}
		}
    });
	
	router.get('/:callID', function(req, res) {
		res.sendFile('/init-page.html', { root: path.join(__dirname, '../public') });
	});
	
	router.use('/lib/*', function(req, res, next){
		console.log('empty' + req.params);
			res.sendFile('/other/not-found.html', { root: path.join(__dirname, '../public') });
    });
	
	router.use('/js/*', function(req, res, next){
		console.log('empty' + req.params);
			res.sendFile('/other/not-found.html', { root: path.join(__dirname, '../public') });
    });
	
		router.use('/', function(req, res, next){
		console.log('empty' + req.params);
			res.sendFile('/other/not-found.html', { root: path.join(__dirname, '../public') });
    });
	
    return router;
}
// export the class
module.exports = CallIdentifier;
