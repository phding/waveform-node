var fs = require('fs')
	, waveform = require('../waveform-node')
	, should = require('chai').should();

describe('#Draw mp3', function() {
	it('download mp3 and should get waveform in line form', function(done) {
		var options = {
			numOfSample: 2000,
			waveFormType: waveform.waveFormType.LINE
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

	it('download mp3 and should get waveform in stack form', function(done) {
		var options = {
			numOfSample: 2000,
			waveFormType: waveform.waveFormType.STACK
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


	it('wrong form type should get error', function(done) {
		var options = {
			numOfSample: 2000,
			waveFormType: 1000
		};

		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
			error.should.not.be.undefined;
			done();
		});
	});
});
