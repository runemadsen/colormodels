function HSVColor(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return new THREE.Color(r, g, b);
}

function degrees(angle) {
  return angle * (180 / Math.PI);
}

function radians(angle) {
  return angle * (Math.PI / 180);
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 300;
camera.position.y = 50;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.AmbientLight(0xFFFFFF)
scene.add(light);

var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
var geometry = new THREE.Geometry();

var color = {
  hue: 0,
  saturation: 50,
  brightness: 70
}

var circle = {
  slice: 100,
  resolution: 10
}

// Make the color circle
for(var angle = color.hue; angle < color.hue + 360 - circle.slice; angle += circle.resolution) {
  var x1 = Math.cos(radians(angle)) * 100;
  var y1 = Math.sin(radians(angle)) * 100;
  var x2 = Math.cos(radians(angle + circle.resolution)) * 100;
  var y2 = Math.sin(radians(angle + circle.resolution)) * 100;
  geometry.vertices.push( new THREE.Vector3(0, 0, 100));
  geometry.vertices.push( new THREE.Vector3(x1, y1, 100));
  geometry.vertices.push( new THREE.Vector3(x2, y2, 100));
}

// Hue wall
for(var i = 0; i < 100; i += circle.resolution) {
  for(var j = 0; j < 100; j += circle.resolution) {

    var leftX = Math.cos(radians(color.hue)) * j;
    var leftY = Math.sin(radians(color.hue)) * j;
    var rightX = Math.cos(radians(color.hue)) * (j + circle.resolution);
    var rightY = Math.sin(radians(color.hue)) * (j + circle.resolution);

    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i + circle.resolution));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i + circle.resolution));

    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i + circle.resolution));
    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i));
  }
}

// opposite hue wall
for(var i = 0; i < 100; i += circle.resolution) {
  for(var j = 0; j < 100; j += circle.resolution) {

    var leftX = Math.cos(radians(color.hue - circle.slice)) * j;
    var leftY = Math.sin(radians(color.hue - circle.slice)) * j;
    var rightX = Math.cos(radians(color.hue - circle.slice)) * (j + circle.resolution);
    var rightY = Math.sin(radians(color.hue - circle.slice)) * (j + circle.resolution);

    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i + circle.resolution));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i + circle.resolution));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i));

    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i + circle.resolution));
    geometry.vertices.push( new THREE.Vector3(rightX, rightY, i));
    geometry.vertices.push( new THREE.Vector3(leftX, leftY, i));
  }
}

// Make faces and color them from position within 3D space
for(var i = 0; i < geometry.vertices.length - 2; i += 3) {
  var cols = [];
  for(var j = i; j < i+3; j++) {
    var vec = geometry.vertices[j];
    var hue = 360 - degrees(Math.atan2(vec.y, vec.x)); // this somehow works
    var sat = Math.sqrt(vec.x * vec.x + vec.y * vec.y); // saturation is length of vector
    var bri = vec.z;
    cols.push(HSVColor(hue / 360, sat / 100, bri / 100))
  }
  var face = new THREE.Face3(i, i+1, i+2);
  face.vertexColors = cols;
  geometry.faces.push(face);
}

geometry.computeFaceNormals();
geometry.computeVertexNormals();

theMesh = new THREE.Mesh( geometry, material )
scene.add(theMesh);

// render loop
var render = function () {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
};

// Rotate the mesh based on mouse position
document.body.onmousemove = function(e){
	theMesh.rotation.z = e.pageX / 100;
	theMesh.rotation.x = e.pageY / 100;
}

// Click to toggle wireframe mode
document.body.onclick = function(e){
	theMesh.material.wireframe = !theMesh.material.wireframe;
}

render(); // initiate render loop
