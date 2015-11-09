var fs = require('fs')
	, waveform = require('../waveform-node')
	, should = require('chai').should();

describe('#Draw mp3', function() {
	it('download mp3 and should get waveform with default value', function(done) {
		var options = {
			numOfSample: 2000,
			waveformType: waveform.waveformType.LINE
		};

		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
			if(error){
				console.log(error);
				return;
			}

			// Calculate
			peaks.length.should.not.equal(0);
			done();
		});
	});
	it('download mp3 and should get waveform in line form', function(done) {
		var options = {
			numOfSample: 2000,
			waveformType: waveform.waveformType.LINE
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

	it('download mp3 and should get waveform by samples per second', function(done){
		var options = {
			samplesPerSecond: 20,
			waveformType: waveform.waveformType.STACK
		}

		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
			if(error){
				console.log(error);
				return;
			}

			// The mp3 is roughly 12s
			peaks.length.should.equal(options.samplesPerSecond * 12);
			done();
		});

	});

	it('download mp3 and should get waveform in stack form', function(done) {
		var options = {
			numOfSample: 2000,
			waveformType: waveform.waveformType.STACK
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
			waveformType: 1000
		};

		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
			error.should.not.be.undefined;
			done();
		});
	});

	it('Check precision', function(done){
		var options = {
			samplesPerSecond: 20,
			waveformType: waveform.waveformType.STACK
		};

		waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){

			var precision = 3;
			var list = peaks.toPrecision(precision);
			var ret = true;
			for(var i=0;i<list.length;i++){
				var target = list[i].replace(/0\.0*/, '');
				ret = target.length == precision? true: false;
				if(!ret){
					target.length.should.equal(precision);
				}
			}
			done();
		});
	})
});
