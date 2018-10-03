var request = require('request')
var unzip = require("unzip-stream");
var sanitize = require("sanitize-filename")
var fs = require('fs')

var processing = true
var offset = 0

process.on('uncaughtException', function (err) {
  console.log('\u001b[41m'+err+'\u001b[0m')
});

if (!fs.existsSync('CustomSongs/')) {
	fs.mkdirSync('CustomSongs/')
}

getMoreSongs(offset)

function getMoreSongs(offset) {
	request.get({
		url: 'https://beatsaver.com/api/songs/new/'+offset,
	}, function(err, resp, body) {
		console.log('\u001b[36mDownloading Songs @ Index '+offset+'\u001b[0m');
		var songs = JSON.parse(body).songs
		if (songs.length != 0) {
			getMoreSongs(offset+15)
			songs.forEach(function(song) {
				download(song);
	      	})
		} else {
			console.log("Done!")
		}
    })
}

function download(song, max) {
	song.name = sanitize(song.name)
	if (!fs.existsSync('CustomSongs/'+song.name+'/')) {
		if (!fs.existsSync('CustomSongs/'+song.name+'/')) {
			fs.mkdirSync('CustomSongs/'+song.name+'/')
		}
		request({
			url: song.downloadUrl
		}).pipe(unzip.Parse()).on('entry', function (entry) {
			if (!entry.path.endsWith('/') && (entry.path.match(/\//g) || []).length < 2){
				entry.pipe(fs.createWriteStream('CustomSongs/'+song.name+entry.path.slice(entry.path.lastIndexOf("/"))));
			} else {
				entry.autodrain();
			}
		}).on('finish', function() {
			console.log('Downloaded> '+song.name)
		})
	}
}