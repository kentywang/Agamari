import store from '../store';


import { scene } from './main';
const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

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


	var curCamZoom = 50;
	var curCamHeight = 40;

	// helpful dev tool, yo
	// var geometry = new THREE.BoxGeometry( 30,3,2 );
 //    var material = new THREE.MeshPhongMaterial({ 
 //                                             shading: THREE.FlatShading });
 //    this.devTestMesh = new THREE.Mesh( geometry, material );
 //    scene.add(this.devTestMesh)

 	this.playerRotation = new THREE.Quaternion();
	
	var cameraReferenceOrientation = new THREE.Quaternion();
	var poleDir = new THREE.Vector3(1,0,0);


	this.update = function() { 

		scope.scale = store.getState().players[scope.id].scale;

		this.checkKeyStates();

	    var playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);

			var cameraReferenceOrientation = new THREE.Quaternion();
			var cameraPosition = this.player.position.clone();
			var poleDirection = new THREE.Vector3(1,0,0)

		    var localUp = cameraPosition.clone().normalize();

		 // no orientation for now, change cameraReforient if necessary
		var referenceForward = new THREE.Vector3(0, 0, 1);
		referenceForward.applyQuaternion(cameraReferenceOrientation);
		var correctionAngle = Math.atan2(referenceForward.x, referenceForward.z)
		var cameraPoru = new THREE.Vector3(0,-1,0);
		cameraReferenceOrientation.setFromAxisAngle(cameraPoru,correctionAngle);
		poleDir.applyAxisAngle(localUp,correctionAngle).normalize(); 
		
		var cross = new THREE.Vector3();
		cross.crossVectors(poleDir,localUp);	
		
		var dot = localUp.dot(poleDir);
		poleDir.subVectors(poleDir , localUp.clone().multiplyScalar(dot));

	    var noClue = new THREE.Matrix4();
	    noClue.set(	poleDir.x,localUp.x,cross.x,cameraPosition.x,
	    			poleDir.y,localUp.y,cross.y,cameraPosition.y,
	    			poleDir.z,localUp.z,cross.z,cameraPosition.z,
	    			0,0,0,1);

	    var cameraPlace = new THREE.Matrix4();
	    cameraPlace.makeTranslation ( 0, curCamHeight * scope.scale, curCamZoom * scope.scale ) 
	  
	    var cameraRot = new THREE.Matrix4();
	    cameraRot.makeRotationX(0.1 - (playerPosition.length()/1000));// scale this with height to planet!


	    var oneTwo = new THREE.Matrix4();
	    oneTwo.multiplyMatrices(noClue , cameraPlace);

		var oneTwoThree = new THREE.Matrix4();
	    oneTwoThree.multiplyMatrices(oneTwo, cameraRot);

	 	this.camera.matrixAutoUpdate = false;
		this.camera.matrix = oneTwoThree;
	};

	this.checkKeyStates = function () {

	// get quaternion and position to apply impulse
	var playerPositionCannon = new CANNON.Vec3(scope.cannonMesh.position.x, scope.cannonMesh.position.y, scope.cannonMesh.position.z);

	// get unit (directional) vector for position
    var norm = playerPositionCannon.normalize();

   	var localTopPoint = new CANNON.Vec3(0,0,1200);
   	var topVec = new CANNON.Vec3(0,0,1);
   	var quaternionOnPlanet = new CANNON.Quaternion();
    quaternionOnPlanet.setFromVectors(topVec, playerPositionCannon);
    var newPosition = quaternionOnPlanet.vmult(new CANNON.Vec3(0,0,norm).vadd(new CANNON.Vec3(0,0, scope.scale * 10)));

	// this.devTestMesh.position.set(newPosition.x, newPosition.z, newPosition.y)

	// find direction on planenormal by crossing the cross cross prods of localUp and camera dir
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
	//cross1.multiplyScalar(10);
	//cross1.addScalar(20 + Math.pow(this.scale, 3));


	// front/back vector
	var cross2 = new THREE.Vector3();
	cross2.crossVectors(playerPosition, cross1);
	//cross2.multiplyScalar(10);
	//cross2.addScalar(20 + Math.pow(this.scale, 3));



		if (keyState[32]) {

			if(Date.now() - scope.cooldown > 5000){

		        // spacebar - dash/push

	            this.cannonMesh.applyImpulse(new CANNON.Vec3(-cross2.x * 15000 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, -cross2.z * 15000 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, -cross2.y * 15000 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/), newPosition);
	            scope.cooldown = Date.now();
	            //this.cannonMesh.position.y -= 2;
			}
	    }

	    if (keyState[38] || keyState[87]) {

	        // up arrow or 'w' - move forward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(-cross2.x * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, -cross2.z * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, -cross2.y * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/) ,newPosition);
	    }

	    if (keyState[40] || keyState[83]) {

	        // down arrow or 's' - move backward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(cross2.x * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, cross2.z * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, cross2.y * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/) ,newPosition);
	    
	    }

	    if (keyState[37] || keyState[65]) {

	        // left arrow or 'a' - rotate left
	        this.cannonMesh.applyImpulse(new CANNON.Vec3(cross1.x * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, cross1.z * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/, cross1.y * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/) ,newPosition);
	    }

	    if (keyState[39] || keyState[68]) {

	        // right arrow or 'd' - rotate right
            this.cannonMesh.applyImpulse(new CANNON.Vec3(-cross1.x * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/,-cross1.z * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/,-cross1.y * 300 /*Math.pow(scope.scale, 1 + (scope.scale * 1))*/), newPosition);

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