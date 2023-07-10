// Server setup variables
const password = '123';
const port = 4320;
const publicIp = 'http://212.85.190.107:' + port;

const clientFolderName = '/client';
const hostingFolderName = '/_hostingfolder';

const clientFolder = __dirname + clientFolderName;
const htmlLoginUI = __dirname + '/client/loginUI.html';
const htmlAppUI = __dirname + '/client/appUI.html';
const hostingFolder = __dirname + hostingFolderName;

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');

app.get('/', function(req, res) {
	res.sendFile(htmlLoginUI);
});
app.use(clientFolderName, express.static(clientFolder));
app.use(hostingFolderName, express.static(hostingFolder));
serv.listen(port);

// Socket initialization + Listener/Emitter
var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket){
	loginListener(socket);
	requestAllFilesDataListener(socket);
	downloadFileListener(socket);
	fileChunkListener(socket);
});

function loginListener(socket) {
	socket.on('login', function(data) {
		if (data.password != password) {
			socket.emit('wrongPassword');
			return;
		}

		socket.emit('returnHtml', {
			html: readFile(htmlAppUI, 'utf8')
		});
	});
}

function requestAllFilesDataListener(socket) {
	socket.on('requestAllFilesData', function() {
		socket.emit('returnAllFilesData', {
			filesData: getAllFilesData(hostingFolder)
		});
	});
}

function downloadFileListener(socket) {
	socket.on('downloadFile', function(data) {
		let fileLink = publicIp + hostingFolderName + '/' + data.fileName;
		socket.emit('returnFileLink', {
			fileName: data.fileName,
			fileLink: fileLink
		});
	});
}

// We need error handling for uploading
function fileChunkListener(socket) {
	socket.on('fileChunk', function(data) {
		if (data.fileName.includes('..') || data.fileName.includes('/') || data.fileName.includes('\\')) {
			socket.emit('requestChunk');
			return;
		}

		const filePath = hostingFolder + '/' + data.fileName;
		console.log(filePath); // DO NOT REMOVE, is important in case someone can exploit the server
		const writeStream = fs.createWriteStream(filePath, {flags: 'a'});
		writeStream.write(data.fileChunk, function(err) {
			writeStream.end();
			socket.emit('requestChunk');
		});
	});

	socket.on('fileEnd', function(data) {
		io.emit('returnAllFilesData', {
			filesData: getAllFilesData(hostingFolder)
		});
	});
}


// Utility functions -> TODO: put into new file
function readFile(filePath, encoding) {
	return fs.readFileSync(filePath, encoding);
}

function getAllFilesData(folderPath) {
	let out = [];

	let files = fs.readdirSync(folderPath);
	for (let file of files) {
		let filePath = folderPath + '/' + file;
		let stats = getFileStats(filePath);

		out.push([file, stats.size]);
	}

	return out;
}

function getFileStats(filePath) {
	return fs.statSync(filePath);
}