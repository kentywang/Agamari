import store from '../store';

import {launch , launchReady, buildUp } from '../reducers/abilities';

import { scene } from './main';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

THREE.PlayerControls = function ( camera, player, cannonMesh , id) {
	this.domElement = document;
	this.camera = camera;
	this.player = player;
	this.cannonMesh = cannonMesh;
	this.id = id;
	this.cooldown = Date.now();
	this.scale;

	this.speedMult = 1;
	this.launchMult = 1;
	this.i = 1;

 	this.playerRotation = new THREE.Quaternion();
	this.left = false;
	this.right = false;
	
	var scope = this;

	var keyState = {};
	
	var curCamZoom = 70;
	var curCamHeight = 80;

	var cameraReferenceOrientation = new THREE.Quaternion();
	var cameraReferenceOrientationObj = new THREE.Object3D();
	var poleDir = new THREE.Vector3(1,0,0);

	this.update = function() { 

		// fov scales according to scale and speedMult
		scope.scale = store.getState().players[scope.id].scale;
		this.camera.fov = Math.max(55, Math.min(45 + this.speedMult*10, 65/(1 + (scope.scale * 0.01) )));
		this.camera.updateProjectionMatrix();

		if(!store.getState().abilities.launch && Date.now() - scope.cooldown > 8.5 * 1000){
			store.dispatch(launchReady());
		}

		this.checkKeyStates();

		// now we position and orient the camera with respect to player and planet using matrix transforms
	    var playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);

		var cameraPosition = this.player.position.clone();
		var poleDirection = new THREE.Vector3(1,0,0)

	    var localUp = cameraPosition.clone().normalize();

	 	if(this.left){
	 		cameraReferenceOrientationObj.rotation.y = 0.05;
	 		this.left = false;
	 	}
	 	else if(this.right){
	 		cameraReferenceOrientationObj.rotation.y = -0.05;
	 		this.right = false;
	 	}

		var referenceForward = new THREE.Vector3(0, 0, 1);
		referenceForward.applyQuaternion(cameraReferenceOrientationObj.quaternion);

		var correctionAngle = Math.atan2(referenceForward.x, referenceForward.z)
		var cameraPoru = new THREE.Vector3(0,-1,0);

		cameraReferenceOrientationObj.quaternion.setFromAxisAngle(cameraPoru,correctionAngle);
		poleDir.applyAxisAngle(localUp,correctionAngle).normalize(); 

		cameraReferenceOrientationObj.quaternion.copy(cameraReferenceOrientation);
		
		var cross = new THREE.Vector3();
		cross.crossVectors(poleDir,localUp);	
		
		var dot = localUp.dot(poleDir);
		poleDir.subVectors(poleDir , localUp.clone().multiplyScalar(dot));

	    var cameraTransform = new THREE.Matrix4();
	    cameraTransform.set(	poleDir.x,localUp.x,cross.x,cameraPosition.x,
	    			poleDir.y,localUp.y,cross.y,cameraPosition.y,
	    			poleDir.z,localUp.z,cross.z,cameraPosition.z,
	    			0,0,0,1);

	 	this.camera.matrixAutoUpdate = false;

		var cameraPlace = new THREE.Matrix4();
	    cameraPlace.makeTranslation ( 0, curCamHeight * scope.scale * .65, curCamZoom * scope.scale * .65) 
	  
	    var cameraRot = new THREE.Matrix4();
	    cameraRot.makeRotationX(-0.32 - (playerPosition.length()/1200));

	    var oneTwo = new THREE.Matrix4();
	    oneTwo.multiplyMatrices(cameraTransform , cameraPlace);

		var oneTwoThree = new THREE.Matrix4();
	    oneTwoThree.multiplyMatrices(oneTwo, cameraRot);

	    this.camera.matrix = oneTwoThree;
	};


	this.checkKeyStates = function () {

		if(this.speedMult < 1){ this.speedMult = 1}

		// get quaternion and position to apply impulse
		var playerPositionCannon = new CANNON.Vec3(scope.cannonMesh.position.x, scope.cannonMesh.position.y, scope.cannonMesh.position.z);

		// get unit (directional) vector for position
	    var norm = playerPositionCannon.normalize();

	   	var localTopPoint = new CANNON.Vec3(0,0,500);
	   	var topVec = new CANNON.Vec3(0,0,1);
	   	var quaternionOnPlanet = new CANNON.Quaternion();
	    quaternionOnPlanet.setFromVectors(topVec, playerPositionCannon);
	    var topOfBall = quaternionOnPlanet.vmult(new CANNON.Vec3(0,0,norm).vadd(new CANNON.Vec3(0,0, scope.scale * 10)));

		// find direction on planenormal by crossing the cross prods of localUp and camera dir
		var camVec = new THREE.Vector3();
	    camera.getWorldDirection( camVec );
	    camVec.normalize();

	    // apply downward force to keep ball rolling
	    var downforce = new THREE.Vector3(0,-1,0);
	    var dfQuat = new THREE.Quaternion()
	    camera.getWorldQuaternion( dfQuat );
	    downforce.applyQuaternion(dfQuat);

	    camVec.add(downforce.divideScalar(2));
	    camVec.normalize()

		var playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
		playerPosition.normalize();

		// lateral directional vector
		var cross1 = new THREE.Vector3();
		cross1.crossVectors(playerPosition, camVec);

		// front/back vector
		var cross2 = new THREE.Vector3();
		cross2.crossVectors(playerPosition, cross1);
	
		if (keyState[32]) {
			if(store.getState().abilities.launch){
				// build up launchMult if spacebar down
				if(this.launchMult < 6) this.launchMult += 1/(this.i++ * 1.1);
				var buildLaunch = ~~(this.launchMult * 3 - 3);
				store.dispatch(buildUp(buildLaunch));
			}
	    }

	    if (keyState[38] || keyState[87]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // up arrow or 'w' - move forward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(-cross2.x * 150 * (0.833 + this.scale/6) *this.speedMult, -cross2.z * 150 * (0.833 + this.scale/6) *this.speedMult, -cross2.y * 150 * (0.833 + this.scale/6) *this.speedMult) ,topOfBall);
	    }

	    if (keyState[40] || keyState[83]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // down arrow or 's' - move backward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(cross2.x * 150 * (0.833 + this.scale/6) *this.speedMult, cross2.z * 150 * (0.833 + this.scale/6) *this.speedMult, cross2.y * 150 * (0.833 + this.scale/6) *this.speedMult) ,topOfBall);
	    }

	    if (keyState[37] || keyState[65]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // left arrow or 'a' - rotate left
	        this.cannonMesh.applyImpulse(new CANNON.Vec3(cross1.x * 100 * (0.833 + this.scale/6) * this.speedMult, cross1.z * 100 * (0.833 + this.scale/6) * this.speedMult, cross1.y * 100 * (0.833 + this.scale/6) * this.speedMult) ,topOfBall);
	        this.left = true;
	    }

	    if (keyState[39] || keyState[68]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // right arrow or 'd' - rotate right
            this.cannonMesh.applyImpulse(new CANNON.Vec3(-cross1.x * 100 * (0.833 + this.scale/6) * this.speedMult,-cross1.z * 100 * (0.833 + this.scale/6) * this.speedMult,-cross1.y * 100 * (0.833 + this.scale/6) * this.speedMult), topOfBall);
            this.right = true;
	    }
	    if(!(keyState[38] || keyState[87] || keyState[40] || keyState[83] || keyState[37] || keyState[65] || keyState[39] || keyState[68])){
	    	// decrement speedMult when no keys down
	    	this.speedMult -= .06;
	    }

	    // launch if spacebar up and launchMult greater than 1
	    if (!keyState[32] && this.launchMult > 1) {
			
			var camVec2 = new THREE.Vector3();
		    camera.getWorldDirection( camVec2 );
		    camVec2.normalize();

		    // apply upward force to launch
		    var upforce = new THREE.Vector3(0,1,0);
		    var ufQuat = new THREE.Quaternion()
		    camera.getWorldQuaternion( ufQuat );
		    upforce.applyQuaternion(ufQuat);

		    camVec2.add(upforce.divideScalar(1));
		    camVec2.normalize();

		    var cross1o = new THREE.Vector3();
			cross1o.crossVectors(playerPosition, camVec2);
			var cross2o = new THREE.Vector3();
			cross2o.crossVectors(playerPosition, cross1o);

		    var launchIntoOrbit = new THREE.Vector3();
		     if(keyState[38] || keyState[87]){
				launchIntoOrbit.copy(cross2o).negate();
		    }else
		    if (keyState[40] || keyState[83]) {
		    	launchIntoOrbit.copy(cross2o);
		    }else
		    if (keyState[37] || keyState[65]) {
		    	launchIntoOrbit.copy(cross1o);
		    }else
		    if (keyState[39] || keyState[68]) {
		    	launchIntoOrbit.copy(cross1o).negate();
		    }
		    else{
		    	launchIntoOrbit.copy(playerPosition).normalize().divideScalar(1);
		    }

		    store.dispatch(launch());

	        this.cannonMesh.applyImpulse(new CANNON.Vec3(launchIntoOrbit.x * 3000 * this.launchMult , launchIntoOrbit.z * 3000 * this.launchMult , launchIntoOrbit.y * 3000 * this.launchMult ), topOfBall);
	        scope.cooldown = Date.now();

	        this.launchMult = 1;
	        this.i = 1;
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