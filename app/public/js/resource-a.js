function loadTimer(){
	var active = false;
	var realTimeElapsed;

	function start_timer(){
		if(active){
			let timer = realTimeElapsed ? realTimeElapsed : '00:00:00';
			let time = timer.split(":");
			
			let hour = time[0], min = time[1], sec = time[2];
			
			if(sec == 59){
				if(min == 59){
					hour++;
					min = 0;
					if(hour < 10) hour = "0" + hour;
				}else{
					min++;
				}
				
				if(min < 10) min = "0" + min;
				sec = 0;
			
			}else{
				sec++;
				if(sec < 10) sec = "0" + sec;
			}
			
			let newTime = hour + ":" + min + ":" + sec;
			realTimeElapsed = newTime
			globalTimer = realTimeElapsed
			document.getElementById("info-timer").innerHTML = newTime;
			setTimeout(start_timer, 970);
		}
	}

	$(".change-timer").on('click', function(){
		if(active == false){
			$("#timer-status").attr('src', 'img/svg/pause.svg');
			active = true;
			start_timer();
		}else{
			$("#timer-status").attr('src', 'img/svg/play.svg');
			active = false;
		}
	});
}




