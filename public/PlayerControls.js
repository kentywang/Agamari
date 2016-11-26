import store from '../browser/store';

const THREE = require('three');
const CANNON = require('./cannon.min.js');

THREE.PlayerControls = function ( camera, player, cannonMesh, raycastReference , id) {
	this.domElement = document;

	this.camera = camera;
	this.player = player;
	this.cannonMesh = cannonMesh;
	this.id = id;
	this.cooldown = Date.now();
	this.scale;
	var keyState = {};
	
	var scope = this;

	var vector = new THREE.Vector3( 0, 0, - 1 );
	vector.applyQuaternion( camera.quaternion );

	var curCamZoom = 50;
	var curCamHeight = 40;

	this.update = function() { 
		
		scope.scale = store.getState().players[scope.id].scale;

		this.checkKeyStates();

		  //Current zoom of the camera behind the ball
		  this.camera.position.z = curCamZoom * scope.scale;
		  this.camera.position.y = curCamHeight * scope.scale;
		  this.camera.rotation.x = -0.5;
		// this.camera.position.set(this.player.position.x ,this.player.position.y + 120, this.player.position.z + 70);
  // 		this.camera.lookAt(this.player.position);

	};

	this.checkKeyStates = function () {

		if (keyState[32]) {
	           // console.log(Date.now() - scope.cooldown)
			if(Date.now() - scope.cooldown > 5000){

		        // spacebar - dash/push
		        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z);
	            //var impulse = new CANNON.Vec3(0,-7000 * (1/60),0);
	            var vec = new THREE.Vector3();
	            camera.getWorldDirection( vec );

	            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 4) * 50 * vec.x * 80, Math.pow(scope.scale, 4) * 50 * vec.z * 80, 0);
	            this.cannonMesh.applyImpulse(impulse,localPoint);
	            scope.cooldown = Date.now();
	            //this.cannonMesh.position.y -= 2;
			}
	    }

	    if (keyState[38] || keyState[87]) {

	        // up arrow or 'w' - move forward
	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            //var impulse = new CANNON.Vec3(0,-7000 * (1/60),0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 4) * vec.x * 80, Math.pow(scope.scale, 4) * vec.z * 80, 0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
            //this.cannonMesh.position.y -= 2;
	    }

	    if (keyState[40] || keyState[83]) {

	        // down arrow or 's' - move backward

	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            //var impulse = new CANNON.Vec3(0,7000 * (1/60),0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 4) * -vec.x * 80, Math.pow(scope.scale, 4) * -vec.z * 80, 0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
            //this.cannonMesh.position.y += 2;
	    }

	    if (keyState[37] || keyState[65]) {

	        // left arrow or 'a' - rotate left
			var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 5);
            //var impulse = new CANNON.Vec3(-7000 * (1/60),0,0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 4) * vec.z * 40, Math.pow(scope.scale, 4) * -vec.x * 40, 0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
            //this.cannonMesh.position.x -= 2;
            raycastReference.rotation.y += .02;
	    }

	    if (keyState[39] || keyState[68]) {

	        // right arrow or 'd' - rotate right
	        var localPoint = new CANNON.Vec3(this.cannonMesh.position.x,this.cannonMesh.position.y,this.cannonMesh.position.z + 0.5);
            //var impulse = new CANNON.Vec3(7000 * (1/60),0,0);
			var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 4) * -vec.z * 40, Math.pow(scope.scale, 4) * vec.x * 40, 0);
            this.cannonMesh.applyImpulse(impulse,localPoint);
			//this.cannonMesh.position.x += 2;
			raycastReference.rotation.y -= .02;
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