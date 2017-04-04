# waveform-node

# Prerequisite

You need to have ffmpeg installed, and add the path to environment variable.

## Usage

```
var waveform = require('waveform-node');

var options = {};
waveform.getWaveForm( __dirname + './mpthreetest.mp3', options, function(error, peaks){
  if(error){
		return;
	}

  // Get peaks
	console.log(peaks);
});
```


## Options

### samplesPerSecond
Type: ```Integer ```

Default: ``` undefined ```

Samples per second. This parameter is conflict with numOfSample, if this attribute was set, the numOfSample will be ignored.

### numOfSample
Type: ```Integer ```

Default: ``` 2000 ```

Number of data point for return value, sampling across entire waveform

### waveformType
Type: ```Enum ```

Default: ``` Stack ```

Choose type of return value

- Stack will be series of peak by picking highest absolute value in given window(sampling rate)
  ![Alt text](/doc/stack.png "Stack")
- Line will be series of value by the sampling rate
  ![Alt text](/doc/line.png "Line")

### ffmpegPath
Type: ```String ```

Default: ``` ffmpeg ```

Location of the 'ffmpeg' binary.  Check out the 'ffmpeg-static' package for static binaries.


