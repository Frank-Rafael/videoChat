/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/
'use strict';

// Getting references to page DOM for video calling.
const localVideoEl = document.getElementById('local-video'),
    remoteVideoEl = document.getElementById('remote-video'),
    callIdEl = document.getElementById('callID'),
    turnCB = document.getElementById('isTURNcb'),
    turnViewEL = document.getElementById('isTURN'),
    shareViewEl = document.getElementById('share-view'),
    shareTitleEl = document.getElementById('share-title');

var localStream,//local audio and video stream
    remoteStream,//remote audio and video stream
    ice,//ice server query.
    sig,//sigaling
    peer;//peer connection.
   

const localVideoElement = document.getElementById('local-video');
const audioInputSelect = $('#audioSource');
const audioOutputSelect = $('#audioOutput');
const videoSelect = $('#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

const audioSourceSelected = false;
const videoSelected = false;

//audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

var mediaConstraintsInit = {
    audio: true,
    video: {
        "min":{"width":"720","height":"360"},
        "max":{"width":"1280","height":"640"}
    }
};

/*if url has callid wait for other user in list with id to call
    else if no id in url create a sharable url with this username.*/
var username,//local username created dynamically.
    remoteCallID,//id of remote user
    inCall = false,//flag true if user in a call, or false if not.
    channelPath = '';//set this variable to specify a channel path

//custom: check URL for "ch" var, and set the channel accourdingly
var ch = decodeURI( (RegExp('ch' + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] );
if(ch != 'null' ) channelPath = ch;
console.log('channel path: ',channelPath);

//if there is no remoteCallID show sharable link to call user.

function callRemotePeer(){
	alert("Call remote peer");
    if (!!remoteCallID) {
        console.log('Calling ' + remoteCallID);
        peer.callPeer(remoteCallID);
    } else {
        console.log('Error', 'A remote peer was not found!');
    }
}



function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  
  /*const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });*/

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    let optionID = deviceInfo.deviceId;
	let optionLabel = deviceInfo.label;
 
    if (deviceInfo.kind === 'audioinput') {
      audioInputSelect.append('<li id="'+optionID+'"><a class="abcd" >'+optionLabel+'</a></li>');
    } else if (deviceInfo.kind === 'audiooutput') {
      audioOutputSelect.append('<li id="'+optionID+'"><a>'+optionLabel+'</a></li>');
    } else if (deviceInfo.kind === 'videoinput') {
      videoSelect.append('<li id="'+optionID+'"><a>'+optionLabel+'</a></li>');
	  
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }

  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}


//navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
/*
// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
      .then(() => {
        console.log(`Success, audio output device attached: ${sinkId}`);
      })
      .catch(error => {
        let errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(localVideoElement, audioDestination);
}
*/
function gotStream(stream) {

  window.stream = stream; // make stream available to console
  localVideoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function start() {
	alert("Start");
	if (window.stream) {alert('changing element');
		window.stream.getTracks().forEach(track => {
			track.stop();
		});
	}
	const audioSource = audioSourceSelected;
	const videoSource = videoSelected;


	//videoSource = '3dbcf43b0d75c788642ceac4cc1ccfc8985d93eeff6736c0dfbacf9ffd64ea1';
	const constraints = {
		audio: {deviceId: audioSource ? {exact: audioSource} : mediaConstraintsInit.audio},
		video: {deviceId: videoSource ? {exact: videoSource} : mediaConstraintsInit.video}
	};

	alert(JSON.stringify(constraints));

	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);

	alert("post navigator");
	//create signal if null
	if(!sig) doSignal();
	//if the peer is created, update our media
	if(!!peer) peer.updateMediaStream(localStream);
  
  
  //navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

// Get Xirsys ICE (STUN/TURN)
function doICE(){
alert("remoteCallID"+remoteCallID);
    console.log('doICE ');
    if(!ice){
        ice = new $xirsys.ice('/webrtc',{channel:channelPath});
        ice.on(ice.onICEList, onICE);
    }
}

function onICE(evt){
    console.log('onICE ',evt);
    if(evt.type == ice.onICEList){
        start();
    }
} 

videoSelect.on("click", start);
//audioInputSelect.onchange = start;
//audioOutputSelect.onchange = changeAudioDestination;

//Get Xirsys Signaling service
function doSignal(){
    sig = new $xirsys.signal( '/webrtc', username,{channel:channelPath} );
    sig.on('message', msg => {
        let pkt = JSON.parse(msg.data);
        //console.log('*main*  signal message! ',pkt);
        let payload = pkt.p;//the actual message data sent 
        let meta = pkt.m;//meta object
        let msgEvent = meta.o;//event label of message
        let toPeer = meta.t;//msg to user (if private msg)
        let fromPeer = meta.f;//msg from user
        //remove the peer path to display just the name not path.
        if(!!fromPeer) {
            let p = fromPeer.split("/");
            fromPeer = p[p.length - 1];
        }alert(msgEvent);
        switch (msgEvent) {
            //first Connect Success!, list of all peers connected.
            case "peers":
                //this is first call when you connect, 
                onReady();
                // if we are connecting to a remote user and remote 
                // user id is found in the list then initiate call
                
				if(!!remoteCallID) {
                    let users = payload.users;
					alert('users.indexOf(remoteCallID): '+users.indexOf(remoteCallID));
                    if(users.indexOf(remoteCallID) > -1){
                        callRemotePeer();
                    }
                }
                break;
            //peer gone.
            case "peer_removed":
                if(fromPeer == remoteCallID) onStopCall();
                break;
            
            // new peer connected
            //case "peer_connected":
            // 	addUser(fromPeer);
            // 	break;
            // message received. Call to display.
            //case 'message':
            // 	onUserMsg(payload.msg, fromPeer, toPeer);
            // 	break;
        }
    })
}

//start();


//Ready - We have our ICE servers, our Media and our Signaling.
function onReady(){
    console.log('* onReady!');
    // setup peer connector, pass signal, our media and iceServers list.
    let isTURN = getURLParameter("isTURN") == 'true';//get force turn var.
    peer = new $xirsys.p2p(sig,localStream,(!ice ? {} : {iceServers:ice.iceServers}), {forceTurn:isTURN});
    //add listener when a call is started.
    peer.on(peer.peerConnSuccess, onStartCall);
}
// A peer call started udpate the UI to show remote video.
function onStartCall(evt){
    console.log('*main*  onStartCall ',evt);
    let remoteId = evt.data;
    setRemoteStream(peer.getLiveStream(remoteId));
    /*if(localVideoEl.classList.contains('major-box')){
        localVideoEl.classList.remove('major-box');
        localVideoEl.classList.add('minor-box');
    }
    if(remoteVideoEl.classList.contains('hidden')){
        remoteVideoEl.classList.remove('hidden');
    }*/
    //shareTitleEl.innerHTML = 'In call with user:';
    remoteCallID = remoteId;
    inCall = true;
}

function onStopCall() {
    console.log('*main*  onStopCall ');
    if( inCall ){
        peer.hangup(remoteCallID);
    }
    if(localVideoEl.classList.contains('minor-box')){
        localVideoEl.classList.remove('minor-box');
        localVideoEl.classList.add('major-box');
    }
    if(!remoteVideoEl.classList.contains('hidden')){
        remoteVideoEl.classList.add('hidden');
    }
    inCall = false;
    remoteCallID = null;
}

//gets URL parameters
function getURLParameter(name) {
	alert("getURLParameter");
    let ret = decodeURI( (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] ) 
    return  ret == 'null' ? null : ret;
};
//makes unique userid
function guid(s='user') {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s + s4() + s4();
}

window.onload = () => {
    console.log('Window onload');
    username = guid();//create random local username
    let urlName = getURLParameter("callid");//get call id if exists from url

    if(!!urlName) {
        remoteCallID = urlName;
        //shareTitleEl.innerHTML = 'Calling User...';
        callIdEl.value = remoteCallID;
        //console.log('turnview: ',turnViewEL);
        //turnViewEL.style.display = 'none';
    } // if call id does not exist this is the callee
    else {
        //callIdEl.innerHTML = location.origin + location.pathname + '?callid='+username;
        callIdEl.value = location.origin + location.pathname + '?callid='+username;

        $(turnCB).on('click', evt => {
            //console.log('TURN: ',evt);
            let checked = evt.target.checked;
            if(checked == true){
                callIdEl.value = location.origin + location.pathname + '?callid='+username+'&isTURN=true';
            } else {
                callIdEl.value = location.origin + location.pathname + '?callid='+username;
            }
            peer.forceTurn = checked;
        })
    }
    //get Xirsys service
    doICE();
};