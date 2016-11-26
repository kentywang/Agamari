const THREE = require('three');

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
