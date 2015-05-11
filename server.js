﻿/*
 * Windshield
 *
 */

var fs = require('fs');
var path = require('path');
var http = require('http');
var crypto = require("crypto");
var express = require('express');
var app = express();
var tasks = [];
var request = require('request');

var videoBase = path.resolve(__dirname + "/videos/");
console.log("Stored Videos Path:", videoBase);

app.use(express.static(path.join(__dirname, 'html')));
app.use('/videos', express.static('videos'));

app.get('/transcode/:kbps/:filename/:outfile', function(req, res) {
  res.contentType('mp4');
  var ffmpeg = require('fluent-ffmpeg');
  var videoSource = videoBase +""+ req.params.filename;
  var ws = fs.createWriteStream(videoBase + req.params.outfile);
var proc = ffmpeg(videoSource)
  .on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('progress', function(progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('error', function(err, stdout, stderr) {
    console.log('Cannot process video: ' + err.message);
  })
  .on('end', function() {
	res.end();
	console.log('Transcoding succeeded !');
  })
  .videoCodec('libx264')
  .audioBitrate('96k')
  .addOptions([
	"-movflags frag_keyframe+faststart",
	'-tune zerolatency',
	'-threads 0',
	'-preset ultrafast',
	'-g 9',
	'-b '+ req.params.kbps +'k',
	'-async 0',
	'-bufsize 0k'
   ])
  .toFormat('mp4')
  .pipe(ws, {end:true});
});

app.get('/network/*:url', function(req, res) {
	req.params.url = req.params.url + req.params[0];
	request(req.params.url).pipe(res);
});

app.get('/livestream/:kbps/*', function(req, res) {
  res.contentType('mp4');
  var ffmpeg = require('fluent-ffmpeg');
  var videoSource = req.params[0];
var proc = ffmpeg()
  .input(request(videoSource))
  .on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('progress', function(progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('error', function(err, stdout, stderr) {
    console.log('Cannot process video: ' + err.message);
  })
  .on('end', function() {
	res.end();
	console.log('Transcoding succeeded !');
  })
  .videoCodec('libx264')
  .audioBitrate('96k')
  .addOptions([
	"-movflags frag_keyframe+faststart",
	'-tune zerolatency',
	'-threads 4',
	'-preset ultrafast',
	'-g 9',
	'-b '+ req.params.kbps +'k',
	'-async 0',
	'-bufsize 0k'
   ])
  .toFormat('mp4')
  .pipe(res, {end:true});
});

app.get('/live/:kbps/:filename', function(req, res) {
  res.contentType('mp4');
  var ffmpeg = require('fluent-ffmpeg');
  var videoSource = videoBase +""+ req.params.filename;
var proc = ffmpeg(videoSource)
  .on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('progress', function(progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('error', function(err, stdout, stderr) {
    console.log('Cannot process video: ' + err.message);
  })
  .on('end', function() {
	res.end();
	console.log('Transcoding succeeded !');
  })
  .videoCodec('libx264')
  .audioBitrate('96k')
  .addOptions([
	"-movflags frag_keyframe+faststart",
	'-tune zerolatency',
	'-threads 4',
	'-preset ultrafast',
	'-g 9',
	'-b '+ req.params.kbps +'k',
	'-async 0',
	'-bufsize 0k'
   ])
  .toFormat('mp4')
  .pipe(res, {end:true});
});

app.get('/stream/:filename', function(req, res) {
console.log("Streaming:",req.params.filename);
var ffmpeg = require('fluent-ffmpeg');
	var videoSource = videoBase +""+ req.params.filename;

	try {
		res.on('unpipe', function () {
		     res.end();
		});
		var stream = fs.createReadStream(videoSource)
		stream.pipe(res);
	} catch (e) {
		console.log(e);
	}

});

app.listen(40);