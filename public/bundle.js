/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _engine = __webpack_require__(1);
	
	var room1 = 'room1';
	var room2 = 'room2';
	
	var socket = io('/');
	socket.on('connect', function () {
		console.log("connected");
	
		socket.on('start', function () {
			(0, _engine.init)();
		});
	
		socket.on('message', console.log);
	});
	
	window.onClick1 = function () {
		socket.emit('room', room1);
	};
	window.onClick2 = function () {
		socket.emit('room', room2);
	};
	
	window.logToRoom1 = function () {
		socket.emit('log', room1);
	};
	
	window.logToRoom2 = function () {
		socket.emit('log', room2);
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var init = exports.init = function init() {
	  var scene = new THREE.Scene();
	  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	
	  var renderer = new THREE.WebGLRenderer();
	  renderer.setSize(window.innerWidth, window.innerHeight);
	  document.body.appendChild(renderer.domElement);
	
	  var geometry = new THREE.BoxGeometry(1, 1, 1);
	  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	  var cube = new THREE.Mesh(geometry, material);
	  scene.add(cube);
	
	  camera.position.z = 5;
	
	  var render = function render() {
	    requestAnimationFrame(render);
	
	    cube.rotation.x += 0.1;
	    cube.rotation.y += 0.1;
	
	    renderer.render(scene, camera);
	  };
	  render();
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map