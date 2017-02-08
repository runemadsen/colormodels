var scene = new THREE.Scene();
var group = new THREE.Object3D();
var sphere = new THREE.SphereGeometry(10, 32, 32);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(50, 600/400, 0.1, 1000);
var model, wireframe, modelMesh, wireframeMesh, sphereMesh;
renderer.setSize(600, 400);
document.getElementById('container').appendChild(renderer.domElement);

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

var Vec2 = THREE.Vector2;
var Vec3 = THREE.Vector3;

var color = {
  red: 150,
  green: 150,
  blue: 255,
  blueChanged: true
}

var cube = {
  resolution: 40
}

// Init Scene
// ---------------------------------------------

function initScene() {

  group.rotation.x = 0.5;
  group.rotation.y = -0.5;

  scene.background = new THREE.Color(0x222222);
  camera.position.z = 500;
  camera.position.y = -35;

  sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffff00}));
  group.add(sphereMesh)

  // var axisHelper = new THREE.AxisHelper(400);
  // group.add(axisHelper);

  scene.add(group)

  updateScene(color)
}

// Update Scene
// ---------------------------------------------

function updateScene(color) {

  sphereMesh.material.color.setRGB(color.red / 255, color.green / 255, color.blue / 255);
  sphereMesh.position.x = color.red - 127.5;
  sphereMesh.position.y = color.green - 127.5;
  sphereMesh.position.z = color.blue - 127.5;

  if(color.blueChanged) {

    // render wireframe
    if(wireframeMesh) group.remove(wireframeMesh)

    if(color.blue != 255) {
      wireframe = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(255, 255, 255 - color.blue, 1, 1, 1));
      var wireframeMat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 2 } );
      wireframeMesh = new THREE.LineSegments( wireframe, wireframeMat );
      wireframeMesh.position.z = color.blue/2;
      group.add(wireframeMesh);
    }

    // render colored cube
    if(modelMesh) group.remove(modelMesh)

    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    // material.wireframe = true;
    var realRes = Math.round((color.blue / 255) * cube.resolution);
    model = new THREE.BoxBufferGeometry(255, 255, color.blue, realRes, realRes, realRes)
    modelMesh = new THREE.Mesh(model, material);
    modelMesh.position.z = -(255 - color.blue) / 2;
    var colors = new Float32Array(model.attributes.position.array.length);
    for(var i = 0; i < model.attributes.position.count; i ++ ) {
			var x = model.attributes.position.array[i * 3];
			var y = model.attributes.position.array[i * 3 + 1];
			var z = model.attributes.position.array[i * 3 + 2];
			colors[ i * 3 ] = (x + 127.5) / 255;
			colors[ i * 3 + 1 ] = (y + 127.5) / 255;
			colors[ i * 3 + 2 ] = (modelMesh.position.z + z + 127.5) / 255;
		}
    model.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    group.add(modelMesh);

    color.blueChanged = false;
  }

}

// Go baby go
// ---------------------------------------------

var render = function () {
  stats.begin();
  requestAnimationFrame(render);
  updateScene(color)
  renderer.render(scene, camera);
  stats.end();
};

var ranges = document.querySelectorAll("input[type=range]");
for(var i = 0; i < ranges.length; i++) {
  ranges[i].addEventListener('input', function(e) {
    var dimension = e.target.name;
    var value = parseInt(e.target.value);
    color[dimension] = value;
    if(dimension == 'blue') {
      color.blueChanged = true;
    }
  })
}

document.getElementById('container').onmousemove = function(e) {
  group.rotation.z = e.pageX / 100;
  group.rotation.x = e.pageY / 100;
  // console.log(group.rotation)
}

initScene();
render();
