// player spawn function
const initPos = () => {
  let x = Math.random() * 1000 - 500;
  let y = Math.random() * 1000 - 500;
  let z = Math.random() * 1000 - 500;
  // Constant start position for debugging/testing
  // let x = - 500;
  // let y = - 500;
  // let z = - 500;
  return {
    x,
    y,
    z,
    qx: 0,
    qy: 0,
    qz: 0,
    qw: 1,
    scale: 1,
    volume: 4000,
    foodEaten: 0,
    playersEaten: 0
  };
};

const getDivisor = (numberPeople, place) => {
  if (numberPeople === 1)  {
    return 1;
  } else if (numberPeople === 2) {
    switch (place) {
      case 1: return 3;
      case 2: return 1;
      default: return 1;
    }
  } else if (numberPeople === 3) {
    switch (place){
      case 1: return 9;
      case 2: return 3;
      case 3: return 1;
      default: return 1;
    }
  } else if (numberPeople === 4){
    switch (place){
      case 1: return 27;
      case 2: return 9;
      case 3: return 3;
      case 4: return 1;
      default: return 1;
    }
  } else if (numberPeople === 5){
    switch (place){
      case 1: return 27 * 3;
      case 2: return 27;
      case 3: return 9;
      case 4: return 3;
      case 5: return 1;
      default: return 1;
    }
  } else {
    switch (place){
      case 1: return 27 * 9;
      case 2: return 27 * 3;
      case 3: return 27;
      case 4: return 9;
      case 5: return 3;
      case 6: return 1;
      default: return 1;
    }
  }
};

module.exports = { initPos, getDivisor };
