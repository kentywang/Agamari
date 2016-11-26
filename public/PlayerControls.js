import store from '../browser/store';


import { scene } from '../browser/game/main';
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

	var geometry = new THREE.BoxGeometry( 30,3,2 );
    var material = new THREE.MeshPhongMaterial({ 
                                             shading: THREE.FlatShading });
    this.ssmesh = new THREE.Mesh( geometry, material );
    scene.add(this.ssmesh)


	this.update = function() { 


		
		scope.scale = store.getState().players[scope.id].scale;

		this.checkKeyStates();

		  //Current zoom of the camera behind the ball
		  this.camera.position.z = curCamZoom * scope.scale;
		  this.camera.position.y = curCamHeight * scope.scale;
		  this.camera.rotation.x = -0.6; // scale this with height to planet

		// this.camera.position.set(this.player.position.x ,this.player.position.y + 120, this.player.position.z + 70);
  // 		this.camera.lookAt(this.player.position);

	};

	this.checkKeyStates = function () {

		// get quaternion and position to apply impulse
	var playerPosition = new CANNON.Vec3(scope.cannonMesh.position.x, scope.cannonMesh.position.y, scope.cannonMesh.position.z);



	// get unit (directional) vector for position
    var norm = playerPosition.normalize();

    // scale the vector's length to size of ball
   	// var playerNormalToPlanet = playerPosition.scale(scope.scale * 10);

   	// find top point on ball by inverse multiplying position vector with quaternion
   	// var reverseRot = scope.cannonMesh.quaternion.inverse();
   	var localTopPoint = new CANNON.Vec3(0,0,430);


   	// scale by size of ball
   	// var topPoint = reverseRot.vmult(localTopPoint).scale(scope.scale * 10);

   	// topPoint = topPoint.vadd(playerPosition);
   	//topPoint = playerPosition;
   	var topVec = new CANNON.Vec3(0,0,1);

   	var quaternionOnPlanet = new CANNON.Quaternion();
    quaternionOnPlanet.setFromVectors(topVec, playerPosition);

    var newPosition = quaternionOnPlanet.vmult(new CANNON.Vec3(0,0,norm).vadd(new CANNON.Vec3(0,0, scope.scale * 10)));

		this.ssmesh.position.set(newPosition.x, newPosition.z, newPosition.y)

		if (keyState[32]) {
	           // console.log(Date.now() - scope.cooldown)
			if(Date.now() - scope.cooldown > 5000){

		        // spacebar - dash/push

	            //var impulse = new CANNON.Vec3(0,-7000 * (1/60),0);
	            var vec = new THREE.Vector3();
	            camera.getWorldDirection( vec );

	            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 3) * 50 * vec.x * 100, Math.pow(scope.scale, 3) * 50 * vec.z * 100, Math.pow(scope.scale, 3) * 50 * vec.y * 100);
	            this.cannonMesh.applyImpulse(impulse,newPosition);
	            scope.cooldown = Date.now();
	            //this.cannonMesh.position.y -= 2;
			}
	    }

	    if (keyState[38] || keyState[87]) {

	        // up arrow or 'w' - move forward

            //var impulse = new CANNON.Vec3(0,-7000 * (1/60),0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 3) * vec.x * 100, Math.pow(scope.scale, 3) * vec.z * 100, Math.pow(scope.scale, 3) * vec.y * 100);
            this.cannonMesh.applyImpulse(impulse,newPosition);
            //this.cannonMesh.position.y -= 2;
	    }

	    if (keyState[40] || keyState[83]) {

	        // down arrow or 's' - move backward

            //var impulse = new CANNON.Vec3(0,7000 * (1/60),0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 3) * -vec.x * 100, Math.pow(scope.scale, 3) * -vec.z * 100, Math.pow(scope.scale, 3) * -vec.y * 100);
            this.cannonMesh.applyImpulse(impulse,newPosition);
            //this.cannonMesh.position.y += 2;
	    }

	    if (keyState[37] || keyState[65]) {

	        // left arrow or 'a' - rotate left
			
            //var impulse = new CANNON.Vec3(-7000 * (1/60),0,0);
            var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 3) * vec.z * 5, Math.pow(scope.scale, 3) * -vec.x * 5, Math.pow(scope.scale, 3) * vec.y * 5);
            this.cannonMesh.applyImpulse(impulse,newPosition);
            //this.cannonMesh.position.x -= 2;
            raycastReference.rotation.y += .02;
	    }

	    if (keyState[39] || keyState[68]) {

	        // right arrow or 'd' - rotate right
	        
            //var impulse = new CANNON.Vec3(7000 * (1/60),0,0);
			var vec = new THREE.Vector3();
            camera.getWorldDirection( vec );

            var impulse = new CANNON.Vec3(Math.pow(scope.scale, 3) * -vec.z * 5, Math.pow(scope.scale, 3) * vec.x * 5, Math.pow(scope.scale, 3) * vec.y * 5);
            this.cannonMesh.applyImpulse(impulse,newPosition);
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