'use strict'

var
	http            = require('http'),
	colors          = require('colors'),
	yaml            = require('node-yaml-config'),
	settings        = yaml.load( __dirname + '/settings.yml', (process.env.NODE_ENV || 'development') ),
	redis           = require('redis'),
	redisSubscriber = redis.createClient( settings.redis.port, settings.redis.host );


/* ==========================================================================
   Create Http server
   ========================================================================== */

var server = http.createServer(function (req, res) {
    
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<html><head><title>Imagify</title></head><body><h1>Imagify Live Counter</h1></body></html>');
	res.end();

});


/* ==========================================================================
   Setting up socket.io
   ========================================================================== */

var
	io           = require('socket.io').listen(server),
	currentValue = 0;

redisSubscriber.get('total_optimized_images', function (value) {

	console.log('Total Optimized:' + value);

	redisSubscriber.subscribe( settings.redis.channel );

	redisSubscriber.on('message', function (channel, message) {
		io.emit( 'counter', message );
	});

	io.sockets.on('connection', function (socket) {

		io.emit( 'counter', currentValue );

		console.log( 'Client connected'.cyan );

	});

	/* ==========================================================================
	   Start service
	   ========================================================================== */

	server.listen(settings.server.port, function () {
		console.log( ('Imagify Counter is listening on port ' + settings.server.port).bold.green );
	});

});

