import { scene,
         world } from '../game/main';

const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');

export const setCannonPosition = mesh => {
  mesh.cannon.position.x = mesh.position.x;
  mesh.cannon.position.z = mesh.position.y;
  mesh.cannon.position.y = mesh.position.z;
  mesh.cannon.quaternion.x = -mesh.quaternion.x;
  mesh.cannon.quaternion.z = -mesh.quaternion.y;
  mesh.cannon.quaternion.y = -mesh.quaternion.z;
  mesh.cannon.quaternion.w = mesh.quaternion.w;
};

export const setMeshPosition = mesh => {
    mesh.position.x = mesh.cannon.position.x;
    mesh.position.z = mesh.cannon.position.y;
    mesh.position.y = mesh.cannon.position.z;
    mesh.quaternion.x = -mesh.cannon.quaternion.x;
    mesh.quaternion.z = -mesh.cannon.quaternion.y;
    mesh.quaternion.y = -mesh.cannon.quaternion.z;
    mesh.quaternion.w = mesh.cannon.quaternion.w;
};

export const getMeshData = mesh => {
      return {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
        qx: mesh.quaternion.x,
        qy: mesh.quaternion.y,
        qz: mesh.quaternion.z,
        qw: mesh.quaternion.w
      };
    };

export const makeTextSprite = (message, fontsize) => {
  let ctx, texture, sprite, spriteMaterial,
      canvas = document.createElement('canvas');

  ctx = canvas.getContext('2d');

  let metrics = ctx.measureText(message);
  let textWidth = metrics.width;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'Bold ' + fontsize/2 + 'px Quicksand';
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillText(message, canvas.width / 2, fontsize/2);

  texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter; // NearestFilter;
  texture.needsUpdate = true;

  spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
};

export const attachFood = (id, playerId, playerData) => {
  let foodObject = scene.getObjectByName(id);
  let player = scene.getObjectByName(playerId);
  let newQuat = new CANNON.Quaternion(-playerData.qx,
                                      -playerData.qz,
                                      -playerData.qy,
                                      playerData.qw);
  let threeQuat = new THREE.Quaternion(playerData.qx,
                                       playerData.qy,
                                       playerData.qz,
                                       playerData.qw);

  // attach food to player
  if (foodObject) {
    world.remove(foodObject.cannon);

    // scale attachment point according to scale (larger players have farther attachment point)
    var scaled = Math.min(.4 + player.scale.x/20, .75);

    // figure out where and in what orientation to attach object to player
    let vec1 = new CANNON.Vec3((foodObject.position.x - playerData.x) * scaled,
                               (foodObject.position.z - playerData.z) * scaled,
                               (foodObject.position.y - playerData.y) * scaled);
    let vmult = newQuat.inverse().vmult(vec1);
    player.cannon.addShape(foodObject.cannon.shapes[0], vmult, newQuat.inverse());

    let invQuat = threeQuat.inverse();
    let vec2 = new THREE.Vector3((foodObject.position.x - playerData.x) * scaled,
                                (foodObject.position.y - playerData.y) * scaled,
                                (foodObject.position.z - playerData.z) * scaled);
    let vecRot = vec2.applyQuaternion(invQuat);

    foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
    foodObject.quaternion.set(invQuat.x, invQuat.y, invQuat.z, invQuat.w);

    // add food to pivot obj of player
    player.children[0].add(foodObject);

    // throw out older food
    while (player.cannon.shapes.length > 80) {
       player.cannon.shapes.splice(1, 1);
       player.cannon.shapeOffsets.splice(1, 1);
       player.cannon.shapeOrientations.splice(1, 1);
       player.children[0].children.splice(0, 1);
     }
  }
};

export const attachPlayer = (id, playerId, eaterData, eatenData) => {
  let foodObject = scene.getObjectByName(id);
  let player = scene.getObjectByName(playerId);
  let newQuat = new CANNON.Quaternion(-eaterData.qx,
                                      -eaterData.qz,
                                      -eaterData.qy,
                                      eaterData.qw);
  let newEatenQuat = new CANNON.Quaternion(-eatenData.qx,-eatenData.qz,-eatenData.qy,eatenData.qw);
  let threeQuat = new THREE.Quaternion(eaterData.qx,
                                       eaterData.qy,
                                       eaterData.qz,
                                       eaterData.qw);
  let threeEatenQuat = new CANNON.Quaternion(-eaterData.qx,-eaterData.qz,-eaterData.qy, eaterData.qw);

  // attach player to eater
  if (foodObject) {
    world.remove(foodObject.cannon);

    // scale attachment point according to scale (larger players have farther attachment point)
    var scaled = Math.min(.3 + player.scale.x/20, .6);

    // figure out where and in what orientation to attach object to player
    let vec1 = new CANNON.Vec3((eatenData.x - eaterData.x) * scaled,
                               (eatenData.z - eaterData.z) * scaled,
                               (eatenData.y - eaterData.y) * scaled);
    let vmult = newQuat.inverse().vmult(vec1);
    player.cannon.addShape(foodObject.cannon.shapes[0], vmult, newQuat.inverse());

    let invQuat = threeQuat.inverse();
    let vec2 = new THREE.Vector3((eatenData.x - eaterData.x) * scaled,
                                (eatenData.y - eaterData.y) * scaled,
                                (eatenData.z - eaterData.z) * scaled);
    let vecRot = vec2.applyQuaternion(invQuat);

    // create new clone of player to add
    var clone = foodObject.clone();
    clone.name = "";

    clone.position.set(vecRot.x, vecRot.y, vecRot.z);
    clone.quaternion.multiply(invQuat);

    // add to pivot obj of player
    player.children[0].add(clone);

    // throw out older food
    if (player.cannon.shapes.length > 80) {
       player.cannon.shapes.splice(1, 1);
       player.cannon.shapeOffsets.splice(1, 1);
       player.cannon.shapeOrientations.splice(1, 1);
       player.children[0].children.splice(0, 1);
     }
  }
};
