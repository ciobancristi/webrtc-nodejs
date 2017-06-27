/**
 *
 * @project        Motion Detection in JS
 * @file           ImageCompare.js
 * @description    Core functionality.
 * @author         Benjamin Horn
 * @package        MotionDetector
 * @version        0.1 - modified by Cristian-Andrei Cioban
 * 
 */

(function (App) {

	"use strict";

	App.Core = function (callback) {

		var rendering = false;

		var width = 64;
		var height = 48;

		var webCam = null;
		var imageCompare = null;

		var currentImage = null;
		var oldImage = null;

		var topLeft = [Infinity, Infinity];
		var bottomRight = [0, 0];

		function initialize() {
			imageCompare = new App.ImageCompare();
			webCam = new App.WebCamCapture(App.videoElement);

			rendering = true;
			main();
		}

		function render() {
			oldImage = currentImage;
			currentImage = webCam.captureImage(false);

			if (!oldImage || !currentImage) {
				return;
			}

			var vals = imageCompare.compare(currentImage, oldImage, width, height);

			topLeft[0] = vals.topLeft[0] * 10;
			topLeft[1] = vals.topLeft[1] * 10;

			bottomRight[0] = vals.bottomRight[0] * 10;
			bottomRight[1] = vals.bottomRight[1] * 10;

			document.getElementById('movement').style.top = topLeft[1] + 'px';
			document.getElementById('movement').style.left = topLeft[0] + 'px';

			document.getElementById('movement').style.width = (bottomRight[0] - topLeft[0]) + 'px';
			document.getElementById('movement').style.height = (bottomRight[1] - topLeft[1]) + 'px';

			topLeft = [Infinity, Infinity];
			bottomRight = [0, 0]

		}

		function motionDetected() {
			oldImage = currentImage;
			currentImage = webCam.captureImage(false);

			if (!oldImage || !currentImage) {
				return;
			}

			var vals = imageCompare.compare(currentImage, oldImage, width, height);

			if (vals &&
				(topLeft[0] !== vals.topLeft[0] * 10 ||
					topLeft[1] !== vals.topLeft[1] * 10 ||
					bottomRight[0] !== vals.bottomRight[0] * 10 ||
					bottomRight[1] !== vals.bottomRight[1] * 10)
			) {
				//console.log('callback')
				return callback();
			}
		}


		var raf = (function () {
			var count = 0;
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
				function (callback) {
					window.setTimeout(callback, 1000 / 60);
				};
		})();

		function main() {
			try {
				//render();
				motionDetected()
			} catch (e) {
				console.log(e);
				return;
			}

			if (rendering == true) {
				raf(main.bind(this));
			}
		}

		initialize();
	};
})(MotionDetector);