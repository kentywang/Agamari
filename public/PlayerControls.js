import store from '../browser/store';

const THREE = require('three');
const CANNON = require('./cannon.min.js');

THREE.PlayerControls = function ( camera, player, cannonMesh, domElement ) {
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.camera = camera;
	this.player = player;
	this.cannonMesh = cannonMesh;

	var keyState = {};
	
	var scope = this;

	this.update = function() { 
		this.checkKeyStates();

		this.camera.position.set(this.player.position.x ,this.player.position.y + 120, this.player.position.z + 70);
  		this.camera.lookAt(this.player.position);
	};

	this.checkKeyStates = function () {
	    if (keyState[38] || keyState[87]) {

	        // up arrow or 'w' - move forward
	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            var impulse = new CANNON.Vec3(0,-7000 * (1/60),0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
	    }

	    if (keyState[40] || keyState[83]) {

	        // down arrow or 's' - move backward
	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            var impulse = new CANNON.Vec3(0,7000 * (1/60),0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
	    }

	    if (keyState[37] || keyState[65]) {

	        // left arrow or 'a' - rotate left
			var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            var impulse = new CANNON.Vec3(-7000 * (1/60),0,0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
	    }

	    if (keyState[39] || keyState[68]) {

	        // right arrow or 'd' - rotate right
	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 0.5);
            var impulse = new CANNON.Vec3(7000 * (1/60),0,0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
	    }
	};

	function onKeyDown( event ) {

    	event = event || window.event;

        keyState[event.keyCode || event.which] = true;

    }

    function onKeyUp( event ) {

        event = event || window.event;

        keyState[event.keyCode || event.which] = false;

    }

	this.domElement.addEventListener('contextmenu', function( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener('keydown', onKeyDown, false );
	this.domElement.addEventListener('keyup', onKeyUp, false );

};

THREE.PlayerControls.prototype = Object.create( THREE.EventDispatcher.prototype );