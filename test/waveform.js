var fs = require('fs')
	, waveform = require('../waveform-node')
	, should = require('chai').should();

describe('#Draw mp3', function() {
	it('download mp3 and should get waveform;', function(done) {
		var options = {
			numOfSample: 2000
		};
		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
			if(error){
				console.log(error);
				return;
			}

			// Calculate
			peaks.length.should.equal(options.numOfSample);
			done();
		});
	});
});
