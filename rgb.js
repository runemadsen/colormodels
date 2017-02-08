var scene = new THREE.Scene();
var group = new THREE.Object3D();
var sphere = new THREE.SphereGeometry(7, 32, 32);
var ring = new THREE.RingGeometry(8, 7, 32);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(50, 600/400, 0.1, 1000);
var model, wireframe, modelMesh, wireframeMesh, sphereMesh, ringMesh;
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
  blue: 150,
  blueChanged: true
}

var cube = {
  resolution: 20
}

// Init Scene
// ---------------------------------------------

function initScene() {

  group.rotation.x = 0.7;
  group.rotation.y = -0.7;

  scene.background = new THREE.Color(0x222222);
  camera.position.z = 550;
  camera.position.y = -20;

  var light = new THREE.AmbientLight(0xFFFFFF)
  scene.add(light);

  // sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffff00}));
  // sphereMesh.position.y = 2;
  // group.add(sphereMesh)
  //
  // ringMesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
  // ringMesh.material.opacity = 0.2;
  // ringMesh.material.transparent = true;
  // ringMesh.rotation.x = Math.PI/2;
  // ringMesh.position.y = 1;
  // group.add(ringMesh)

  // var axisHelper = new THREE.AxisHelper(400);
  // group.add(axisHelper);

  scene.add(group)

  updateScene(color)
}

// Update Scene
// ---------------------------------------------

function updateScene(color) {

  if(color.blueChanged) {

    // render wireframe
    if(wireframeMesh) group.remove(wireframeMesh)

    if(color.blue != 255) {
      wireframe = new THREE.EdgesGeometry(new THREE.BoxGeometry(255, 255, 255 - color.blue, 1, 1, 1));
      var wireframeMat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 2 } );
      wireframeMesh = new THREE.LineSegments( wireframe, wireframeMat );
      wireframeMesh.position.z = color.blue/2;
      group.add(wireframeMesh);
    }

    // render colored cube
    if(modelMesh) group.remove(modelMesh)

    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    var realRes = Math.round((color.blue / 255) * cube.resolution);
    model = new THREE.BoxGeometry(255, 255, color.blue, realRes, realRes, realRes)
    modelMesh = new THREE.Mesh(model, material);
    modelMesh.position.z = -(255 - color.blue) / 2;

    var facevars = ['a', 'b', 'c'];
    for(var i = 0; i < model.faces.length; i++) {
      for(var j = 0; j < 3; j++) {
        var vec = model.vertices[model.faces[i][facevars[j]]];
        model.faces[i].vertexColors[j] = new THREE.Color(vec.x / 255, vec.y / 255, vec.z / 255);
      }
    }

    group.add(modelMesh);

    color.blueChanged = false;
  }

  // if(hsl) {
  //   sphereMesh.material.color.setHSL(color.hue / 360, color.saturation / 100, color.brightness / 100)
  // } else {
  //   var rgb = HSVtoRGB(color.hue / 360, color.saturation / 100, color.brightness / 100);
  //   sphereMesh.material.color.setRGB(rgb[0], rgb[1], rgb[2]);
  // }
  //
  // sphereMesh.position.x = color.saturation;
  // sphereMesh.position.z = -color.brightness;
  // ringMesh.position.x = color.saturation;
  // ringMesh.position.z = -color.brightness;
  //
  // // if hue changed, change the model vector colors
  // // making it appear like the model rotated.
  // if(color.hueChanged) {
  //   var facevars = ['a', 'b', 'c'];
  //   var h, s, b;
  //   for(var i = 0; i < model.faces.length; i++) {
  //     for(var j = 0; j < 3; j++) {
  //       var vec = model.vertices[model.faces[i][facevars[j]]];
  //       h = (vec.h + color.hue) / 360;
  //       s = vec.s / 100;
  //       b = Math.abs(vec.z) / 100;
  //
  //       if(hsl) {
  //         model.faces[i].vertexColors[j].setHSL(h, s, b);
  //       }
  //       else {
  //         var rgb = HSVtoRGB(h, s, b)
  //         model.faces[i].vertexColors[j].setRGB(rgb[0], rgb[1], rgb[2])
  //       }
  //     }
  //   }
  //   model.colorsNeedUpdate = true;
  //   color.hueChanged = false;
  // }
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
  // group.rotation.z = e.pageX / 100;
  // group.rotation.y = e.pageY / 100;
  // console.log(group.rotation)
}

initScene();
render();
