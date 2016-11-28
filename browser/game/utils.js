const THREE = require('three');
const CANNON = require('../../public/cannon.min.js');
import { scene,
         world } from '../game/main';

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

  ctx.font = 'Bold ' + fontsize / 2 + 'px Quicksand';
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillText(message, canvas.width / 2, fontsize / 2);

  texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter; // NearestFilter;
  texture.needsUpdate = true;

  spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
};

export const attachFood = (id, playerId, playerData) => {
  playerId = playerId.toString();
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

    let vec1 = new CANNON.Vec3((foodObject.position.x - playerData.x) * 0.8,
                               (foodObject.position.z - playerData.z) * 0.8,
                               (foodObject.position.y - playerData.y) * 0.8);
    let vmult = newQuat.inverse().vmult(vec1);
    player.cannon.addShape(foodObject.cannon.shapes[0], vmult, newQuat.inverse());

    let invQuat = threeQuat.inverse();
    let vec2 = new THREE.Vector3((foodObject.position.x - playerData.x) * 0.8,
                                (foodObject.position.y - playerData.y) * 0.8,
                                (foodObject.position.z - playerData.z) * 0.8);
    let vecRot = vec2.applyQuaternion(invQuat);

    foodObject.position.set(vecRot.x, vecRot.y, vecRot.z);
    foodObject.quaternion.set(invQuat.x, invQuat.y, invQuat.z, invQuat.w);

    // add to pivot obj of player
    player.children[0].add(foodObject);

    // throw out older food
    if (player.cannon.shapes.length > 200) {
       player.cannon.shapes.splice(1, 1);
       player.cannon.shapeOffsets.splice(1, 1);
       player.cannon.shapeOrientations.splice(1, 1);
       player.children[0].children.splice(0, 1);
     }
  }
};
