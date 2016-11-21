// function bot(){
  // const bot_geometry = new THREE.BoxGeometry(1,1,1);
  // const bot_material = new THREE.MeshBasicMaterial( {color: 0x7777ff, wireframe: false} );
  // const bot = new THREE.Mesh( bot_geometry, bot_material );



  // bot.position.x = 1;
  // bot.position.y = 0;
  // bot.position.z = 1;
  // scene.add(bot);

  // //create random directions for bot
  //   let reverseDirectionX;
  //   let reverseDirectionY;
  //   let direction;
  //   let counter = 0;
  //   function animate() {
  //     //counter 300 lopps then change direction
  //         if(counter%300===0){
  //           reverseDirectionX = Math.floor(Math.random()*2) == 1 ? 1 : -1;
  //           reverseDirectionY = Math.floor(Math.random()*2) == 1 ? 1 : -1;

  //           direction =  new THREE.Vector3(0.1*reverseDirectionX, 0, 0.2*reverseDirectionY); // amount to move per frame
  //           //counter=0;
  //         }
  //          console.log(direction);
  //         bot.position.add(direction); // add to position
  //         requestAnimationFrame(animate); // keep looping
  //         counter++
  //       }
  // requestAnimationFrame(animate);
// }

function makeFood(){
	// const food_plane_geometry = new THREE.planeGeometry( 0.3 );
	// const food_plane_material = new THREE.MeshBasicMaterial( {color: 0x66669, wireframe: false} );

	// let gameBorderPosition = 100;

	// for (var i = 0; i < 10; i++) {
	// 	const food = new THREE.Mesh( food_plane_geometry, food_plane_material );

	// 	let xPostion = Math.floor(Math.random()*gameBorderPosition);
	// 	xPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

	// 	let zPostion = Math.floor(Math.random()*gameBorderPosition);
	// 	zPostion *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

	// 	food.position.x = xPostion;
	// 	food.position.y = 0;
	// 	food.position.z = zPostion;
	// 	scene.add( food );
	// }
};

module.exports = { makeFood }