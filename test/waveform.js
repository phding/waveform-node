var fs = require('fs');
var waveform = require('../waveform-node.js');
var request = require('request');
var temp = require('temp');

temp.open({suffix: '.mp3'}, function(err, tempFile){
	request('https://archive.org/download/testmp3testfile/mpthreetest.mp3')
	.on('end', function(){
		waveform.getWaveForm(tempFile.path, null, function(error, peaks){
			if(error){
				console.log(error);
				return;
			}

			// Calculate
			console.log(peaks); // Should be the desired
		})
	})
	.pipe(fs.createWriteStream(tempFile.path))
});

