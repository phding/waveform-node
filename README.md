# waveform-node

## Usage

```
var fs = require('fs');
var waveform = require('../waveform-node');

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

### numOfSample
Type: ```Integer ```

Default: ``` 2000 ```

Number of data point for return value, sampling across entire waveform

### waveFormType
Type: ```Enum ```

Default: ``` Stack ```


Choose type of return value

- Stack will be series of peak by picking highest absolute value in given window(sampling rate)
  ![Alt text](/doc/stack.png "Stack")
- Line will be series of value by the sampling rate
  ![Alt text](/doc/line.png "Line")

