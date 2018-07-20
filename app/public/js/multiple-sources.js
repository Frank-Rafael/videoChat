function hasUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasUserMedia()) {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.log("enumerateDevices() not supported.");
		//return;
	}
 
$('#localVideo').click(function() {
        alert("click");
    });
// List cameras and microphones.

	navigator.mediaDevices.enumerateDevices().then(function(devices) {
		
		var audioSource = null;
		var videoSource = null;
		
		devices.forEach(function(device) {
		
			if(device.kind === "audiooutput") {
				console.log("Microfono encontrado:", device.label, device.deviceId);
				audioSource = device.deviceId;
			} else if (device.kind === "videoinput") {
				console.log("Camara encontrada:", device.label, device.deviceId);
				videoSource = device.deviceId;
			} else {
				console.log("Fuente desconocida encontrada:", device);
			}
		
		
			//console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
		});
		
		alert(audioSource);
		var constraints = {
		audio: {
			optional: [{sourceId: audioSource}, ]
		},
		video: {
			optional: [{sourceId: videoSource}]
		}
		};
		
		
	navigator.getUserMedia(constraints, function (stream) {
		var video = document.getElementById('localVideo');
		video.srcObject = stream;
	  
    }, function (error) {
      console.log("Raised an error when capturing:", error);
    });
		
	})
	.catch(function(err) {
	  console.log(err.name + ": " + err.message);
	});
	

 
  
  /*MediaStreamTrack.getSources(function(sources) {
    var audioSource = null;
    var videoSource = null;

    for (var i = 0; i != sources.length; ++i) {
      var source = sources[i];

      if(source.kind === "audio") {
        console.log("Microphone found:", source.label, source.id);
        audioSource = source.id;
      } else if (source.kind === "video") {
        console.log("Camera found:", source.label, source.id);
        videoSource = source.id;
      } else {
        console.log("Unknown source found:", source);
      }
    }

    var constraints = {
      audio: {
        optional: [{sourceId: audioSource}]
      },
      video: {
        optional: [{sourceId: videoSource}]
      }
    };

    navigator.getUserMedia(constraints, function (stream) {
      var video = document.querySelector('video');
      video.src = window.URL.createObjectURL(stream);
    }, function (error) {
      console.log("Raised an error when capturing:", error);
    });
  });*/
  
} else {
  alert("Sorry, your browser does not support getUserMedia.");
}
