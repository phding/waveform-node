var spawn = require('child_process').spawn;

var log_10 = function(arg){
    return Math.log(arg) / Math.LN10;
}
var coefficient_to_db = function(coeff){
	return 20.0 * log_10(coeff);
}
var log_meter = function(power, lower_db, upper_db, non_linearity){
	if(power < lower_db){
		return 0;
	}
    else{
      return Math.pow((power - lower_db) / (upper_db - lower_db), non_linearity);
  	}
}
var alt_log_meter = function(power){
	return log_meter(power, -192.0, 0.0, 8.0);
}

var waveformTypeEnum = {
	STACK: 0,
	LINE: 1
}

// Extract the sample via ffmpeg
var getDataFromFFMpeg = function(filepath, options, callback){

	var outputStr = '';
	var oddByte = null;
	var gotData = false;
	var samples = [];
	var channel = 0;
        var ffmpegPath = '';

        // Allow for the ffmpeg path to be specified via options
        try {
                if (typeof(options.ffmpegPath) !== 'undefined' && options.ffmpegPath != null) {
                  ffmpegPath = options.ffmpegPath;
                }
        } catch (ex) {
          ffmpegPath = 'ffmpeg';
        }

        // Extract signed 16-bit little endian PCM data with ffmpeg and pipe to
        // stdout
        var ffmpeg = spawn(ffmpegPath, ['-i',filepath,'-f','s16le', '-acodec','pcm_s16le','-y','pipe:1']);
	ffmpeg.stdout.on('data', function(data){
		gotData = true;
		var value;
    	var i = 0;
		var dataLen = data.length;
	    
	    // If there is a leftover byte from the previous block, combine it with the
	    // first byte from this block
	    if (oddByte !== null) {
	      value = ((data.readInt8(i++, true) << 8) | oddByte) / 32767.0;
	      samples.push(value);
	      channel = ++channel % 2;
	    }
	    
	    for (; i < dataLen; i += 2) {
	      value = data.readInt16LE(i, true) / 32767.0;
	      samples.push(value);
	      channel = ++channel % 2;
	    }
	    
	    oddByte = (i < dataLen) ? data.readUInt8(i, true) : null;
	});

	ffmpeg.stderr.on('data', function(data) {
		// Text info from ffmpeg is output to stderr
		outputStr += data.toString();
	});

	ffmpeg.stderr.on('end', function() {
		if (gotData){
			// Try parse duration and bitrate
			var pattern = new RegExp(/Duration: ([0-9:.]*),( start: [0-9:.]*,)? bitrate: ([0-9]*) kb/);
			var pattern2 = new RegExp(/Stream #[0-9:^(eng)]* Audio: [^,]*, ([0-9]*) Hz, ([a-z]*),/);


			var matches = outputStr.match(pattern);
			var matches2 = outputStr.match(pattern2);

			var strList = matches[1].split(new RegExp('[:.]', 'g'));
			var duration = 0;
			for(var i=0;i<3;i++){
				var val = parseInt(strList[i]);

				duration *= 60;
				duration += val;
			}
			duration = duration + (parseInt(strList[3]) / 100);


			var channels = matches2[2];

			if(channels !== undefined){
				if(channels == 'mono'){
					channels = 1;
				}else{
					channels = 2;
				}
			}

			var info = {
				duration: duration,
				bitRate: parseInt(matches[3]),
				sampleRate: parseInt(matches2[1]),
				channels: channels
			}
		  	callback(null, samples, info);
		}
		else{
		  callback(outputStr, null);
		}
	});
}


var getPeakBySamplesPerSecond = function(waveformType, samplesPerSecond, samples, streamInfo){
	var desiredSamplePerSecond = Math.ceil(samples.length / streamInfo.duration);
	if(desiredSamplePerSecond > samplesPerSecond){
		desiredSamplePerSecond = samplesPerSecond;
	}

	var samplesPerPeak = Math.ceil(samples.length / (desiredSamplePerSecond * streamInfo.duration))
	return getPeak(waveformType, samplesPerPeak, samples, streamInfo);
}

var getPeakByNumberOfSamples = function(waveformType, numOfSample, samples, streamInfo){
	var samplesPerPeak = Math.ceil(samples.length / numOfSample);
	var peaks =  getPeak(waveformType, samplesPerPeak, samples, streamInfo);

	while(peaks.length < numOfSample){
		peaks.push(peaks[0]);
	}
	return peaks;
}

// get peak by desired number of sample
var getPeak = function(waveformType, samplesPerPeak, samples, streamInfo){
	// Calculate sample
	var peaks = [];
	var currMax = 0;

	if(waveformType == waveformTypeEnum.LINE){
		currMax = samples[0];
		for(var i=0; i<samples.length; i+= samplesPerPeak){
			var value = samples[i];
			peaks.push(value);
		}
	}else if(waveformType == waveformTypeEnum.STACK){

		var partialMax = 0;
		var sampleIdx = 0;

		for(var idx = 0; idx < samples.length; idx++){
			var value = Math.abs(samples[idx]);
			sampleIdx++;

			// Get partial max
			if(value > partialMax){
				partialMax = value;
			}

			if(sampleIdx >= samplesPerPeak){
				var currMax = alt_log_meter(coefficient_to_db(partialMax));
				peaks.push(currMax);
				sampleIdx = 0;
				partialMax = 0;
			}
		}
	}else{
		throw new Error("Unsupported wave form type: " + waveformType);
	}

	peaks.toPrecision = toPrecision;

	return peaks;
}

var toPrecision = function(precision){
	var list = [];
	for(var i=0; i<this.length;i++){
		list.push(this[i].toPrecision(precision));
	}

	return list;
}

// Extract wave form from a file
exports.getWaveForm = function(filepath, options, callback){

	options = options || {};

	var numOfSample = 1000;
	var waveformType = waveformTypeEnum.STACK;
	var samplesPerSecond = undefined;
	if(typeof options.numOfSample !== 'undefined'){
		numOfSample = options.numOfSample;
	}

	if(typeof options.waveformType !== 'undefined'){
		waveformType = options.waveformType;
	}

	if(typeof options.samplesPerSecond !== 'undefined'){
		samplesPerSecond = options.samplesPerSecond;
	}

	if(numOfSample < 1){
		throw new Error("Number of sample should larget than 1");
	}

	getDataFromFFMpeg(filepath, options, function(error, samples, streamInfo){
		if(error){
			callback(error);
			return;
		}
		var peaks = [];

		try{
			if(typeof samplesPerSecond == 'undefined'){
				peaks = getPeakByNumberOfSamples(waveformType, numOfSample, samples, streamInfo);
			}else{
				peaks = getPeakBySamplesPerSecond(waveformType, samplesPerSecond, samples, streamInfo);
			}

		}catch(error){
			callback(error);
		}
		
		// Parse
		callback(null, peaks);
	});
}

exports.waveformType = waveformTypeEnum;
