var scene = new THREE.Scene();
var model = new THREE.Geometry();
var sphere = new THREE.SphereGeometry(5, 32, 32);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(38, 600/400, 0.1, 1000);
var modelMesh, sphereMesh;
renderer.setSize(600, 400);
document.getElementById('container').appendChild(renderer.domElement);

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

var Vec2 = THREE.Vector2;
var Vec3 = THREE.Vector3;

var color = {
  hue: 0,
  saturation: 50,
  brightness: 70,
  hueChanged: true
}

var circle = {
  start: 100,
  end: 360,
  resolution: 5,
}

// cache sin and cos value for reuse
var xs = [];
var ys = [];
for(var i = 0; i < 361; i++) {
  xs[i] = Math.cos(radians(i))
  ys[i] = Math.sin(radians(i))
}

// Helpers
// ---------------------------------------------

function HSVtoRGB(h, s, v) {
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
  return [r, g, b];
}

function degrees(angle) {
  return angle * (180 / Math.PI);
}

function radians(angle) {
  return angle * (Math.PI / 180);
}

function makePlane(x1, y1, x2, y2, flip) {
  for(var j = 0; j < 100; j += circle.resolution) {
    model.vertices.push(
      new Vec3(x1, y1, j),
      flip ? new Vec3(x2, y2, j + circle.resolution) : new Vec3(x2, y2, j),
      flip ? new Vec3(x2, y2, j) : new Vec3(x2, y2, j + circle.resolution)
    );
    model.vertices.push(
      new Vec3(x2, y2, j + circle.resolution),
      flip ? new Vec3(x1, y1, j) : new Vec3(x1, y1, j + circle.resolution),
      flip ? new Vec3(x1, y1, j + circle.resolution) : new Vec3(x1, y1, j)
    );
  }
}

// Init Scene
// ---------------------------------------------

function initScene() {

  var group = new THREE.Object3D();
  group.rotation.x = 5.22;
  group.rotation.z = 10.52;

  scene.background = new THREE.Color(0x222222);
  camera.position.z = 330;
  camera.position.y = 30;

  var light = new THREE.AmbientLight(0xFFFFFF)
  scene.add(light);

  var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

  var a1, a2, x1, y1, x2, y2;
  for(var i = circle.start; i < circle.end; i += circle.resolution) {

    a1 = i % 360;
    a2 = (i + circle.resolution) % 360;
    x1 = xs[a1] * 100;
    y1 = ys[a1] * 100;
    x2 = xs[a2] * 100;
    y2 = ys[a2] * 100;

    // circle slice
    model.vertices.push(new Vec3(0, 0, 100), new Vec3(x1, y1, 100), new Vec3(x2, y2, 100))

    // slice plan down z axis
    makePlane(x1, y1, x2, y2)
  }

  for(var i = 0; i < 100; i += circle.resolution) {
    // Start plane
    makePlane(
      xs[circle.start] * i,
      ys[circle.start] * i,
      xs[circle.start] * (i + circle.resolution),
      ys[circle.start] * (i + circle.resolution)
    )
    // End plane
    makePlane(
      xs[circle.end] * i,
      ys[circle.end] * i,
      xs[circle.end] * (i + circle.resolution),
      ys[circle.end] * (i + circle.resolution),
      true
    )
  }

  // make faces
  for(var i = 0; i < model.vertices.length - 2; i += 3) {
    var face = new THREE.Face3(i, i+1, i+2);
    face.vertexColors = [new THREE.Color(0xFF0000), new THREE.Color(0xFF0000), new THREE.Color(0xFF0000)]
    model.faces.push(face);
  }

  model.computeFaceNormals();
  model.computeVertexNormals();

  modelMesh = new THREE.Mesh( model, material )
  group.add(modelMesh);

  // Add color sphere
  sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffff00}));
  group.add(sphereMesh)

  scene.add(group)

  updateScene(color)
}

// Update Scene
// ---------------------------------------------

function updateScene(color) {

  // Check whether it updated
  var rgb = HSVtoRGB(color.hue / 360, color.saturation / 100, color.brightness / 100);
  sphereMesh.material.color.setRGB(rgb[0], rgb[1], rgb[2]);
  sphereMesh.position.x = color.saturation;
  sphereMesh.position.z = color.brightness;

  // if hue changed, change the model vector colors
  // making it appear like the model rotated.
  if(color.hueChanged) {
    var facevars = ['a', 'b', 'c']
    for(var i = 0; i < model.faces.length; i++) {
      for(var j = 0; j < 3; j++) {
        var vec = model.vertices[model.faces[i][facevars[j]]];
        var rgb = HSVtoRGB(
          (360 - degrees(Math.atan2(vec.y, vec.x)) + color.hue + circle.start) / 360,
          Math.sqrt(vec.x * vec.x + vec.y * vec.y) / 100,
          vec.z / 100
        )
        model.faces[i].vertexColors[j].setRGB(rgb[0], rgb[1], rgb[2])
      }
    }
    model.colorsNeedUpdate = true;
    color.hueChanged = false;
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
    if(dimension == 'hue') {
      color.hueChanged = true;
    }
  })
}

//document.body.onmousemove = function(e){
  // changeColor(e.pageX % 360, 100, 100);
  // modelMesh.rotation.z = e.pageX / 50;
	// modelMesh.rotation.x = e.pageY / 50;
  // console.log(modelMesh.rotation)
//}

initScene();
render();
