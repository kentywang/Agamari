export const mapPosition = (obj, data) => {
  obj.position.x = data.x;
  obj.position.y = data.y;
  obj.position.z = data.z;
  obj.rotation.x = data.rx;
  obj.rotation.y = data.ry;
  obj.rotation.z = data.rz;
  return obj;
};

export const mapQuaternion = (obj, data) => {
  obj.position.x = data.position.x;
  obj.position.z = data.position.y;
  obj.position.y = data.position.z;
  obj.quaternion.x = data.quaternion.x;
  obj.quaternion.y = data.quaternion.y;
  obj.quaternion.z = data.quaternion.z;
  obj.quaternion.w = data.quaternion.w;
  return obj;
};

export const reverseMapQuaternion = (obj, data) => {
  obj.position.x = data.position.x;
  obj.position.z = data.position.y;
  obj.position.y = data.position.z;
  obj.quaternion.x = -data.quaternion.x;
  obj.quaternion.z = -data.quaternion.y;
  obj.quaternion.y = -data.quaternion.z;
  obj.quaternion.w = data.quaternion.w;
  return obj;
}

export const mapRotation = (obj, data) => {
  obj.rotation.x = data.rx;
  obj.rotation.y = data.ry;
  obj.rotation.z = data.rz;
  return obj;
}
