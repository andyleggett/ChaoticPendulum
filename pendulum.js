(function(win, doc){

	'use strict';

	var pendulums = [];
	var startTime = null;
	var previousTime = 0;
	var canvasSize = 600;
	var gravity = 9.81;

	 win.requestAnimationFrame = (function () {
		return win.requestAnimationFrame ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame ||
			function( callback ){
				win.setTimeout(callback, 1000 / 60);
			};
	})();

	function initialise(){

		var currentPendulum = doc.getElementById('pendulum1');
		currentPendulum.width = currentPendulum.height = canvasSize;

		pendulums.push({
			context: currentPendulum.getContext('2d'),
			pivot: {x: 0, y: 0},
			end: {x: 0, y: 160},
			theta: 2.0001,
			deltaTheta: 0,
			length: 160, //l
			dampingCoefficient: 0.01, //delta
			forceAmplitude: 50, //a
			forceFrequency: 1//w
		});

		currentPendulum = doc.getElementById('pendulum2');
		currentPendulum.width = currentPendulum.height = canvasSize;

		pendulums.push({
			context: currentPendulum.getContext('2d'),
			pivot: {x: 0, y: 0},
			end: {x: 0, y: 160},
			theta: 2,
			deltaTheta: 0,
			length: 160, //l
			dampingCoefficient: 0.01, //delta
			forceAmplitude: 50, //a
			forceFrequency: 1//w
		});

		win.requestAnimationFrame(loop);
	}

	function loop(time){

		if (!startTime){
			startTime = time;
		}

		//calculate new positions
		recalculate((time - startTime)/100, (time-previousTime)/100);

		//redraw pendulums
		redraw();

		previousTime = time;

		win.requestAnimationFrame(loop);
	}

	function recalculate(time, step){

		var pendulum;

		for(var i=0; i<pendulums.length; i+=1){

			pendulum = pendulums[i];

			//calculate new angle and angular velocity
			calculateTheta(pendulum, time, step);

			pendulum.pivot.x = 0;
			pendulum.pivot.y = -pendulum.forceAmplitude * Math.cos(time * pendulum.forceFrequency);

			pendulum.end.x = pendulum.pivot.x + pendulum.length * Math.sin(pendulum.theta);
			pendulum.end.y = pendulum.pivot.y + pendulum.length * Math.cos(pendulum.theta);
		}
	}

	function calculateTheta(p, time, step){

		//use numerical integration (Runge-Kutta 4th order method)
		var k1, k2, k3, k4;

		k1 = 0.5 * step * calculateDifferential(p, time, p.theta, p.deltaTheta);
		k2 = 0.5 * step * calculateDifferential(p, time + 0.5*step, p.theta + 0.5*step*(p.theta + 0.5*k1), p.deltaTheta + k1);
		k3 = 0.5 * step * calculateDifferential(p, time + 0.5*step, p.theta + 0.5*step*(p.theta + 0.5*k1), p.deltaTheta + k2);
		k4 = 0.5 * step * calculateDifferential(p, time + step, p.theta + step*(p.deltaTheta + k3), p.deltaTheta + 2*k3);

		p.theta += step * (p.deltaTheta + (1/3)*(k1 + k2 + k3));
		p.deltaTheta += (1/3)*(k1 + 2*k2 + 2*k3 + k4);
	}

	function calculateDifferential(p, time, theta, deltatheta){

		return (-2 * p.dampingCoefficient * deltatheta) - ((gravity/p.length) * Math.sin(theta)) + ((p.forceAmplitude * p.forceFrequency * p.forceFrequency / p.length) * Math.cos(p.forceFrequency * time) * Math.sin(theta));
	}

	function redraw(){

		var pendulum, context, centreX, centreY;

		for(var i=0; i<pendulums.length; i+=1){

			pendulum = pendulums[i];
			context = pendulum.context;
			context.clearRect (0, 0, canvasSize, canvasSize);
			centreX = context.canvas.width/2;
			centreY = context.canvas.height/2;

			context.beginPath();
			context.moveTo(centreX + pendulum.pivot.x, centreY + pendulum.pivot.y);
			context.lineTo(centreX + pendulum.end.x, centreY + pendulum.end.y);
			context.lineWidth = 1;
			context.strokeStyle = "#444";
			context.stroke();

			context.beginPath();
			context.arc(centreX + pendulum.end.x, centreY + pendulum.end.y, 10, 0, Math.PI * 2, false);
			context.fillStyle = 'green';
			context.fill();

			context.stroke();
		}
	}

	initialise();

})(window, document);