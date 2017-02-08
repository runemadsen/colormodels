var scene = new THREE.Scene();
var group = new THREE.Object3D();
var model = new THREE.Geometry();
var sphere = new THREE.SphereGeometry(7, 32, 32);
var ring = new THREE.RingGeometry(8, 7, 32);
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(38, 600/400, 0.1, 1000);
var modelMesh, sphereMesh, ringMesh;
var hsl = true;
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
  start: 110,
  hueResolution: 40,
  restResolution: 20
}

circle.hueStep = (360 - circle.start) / circle.hueResolution;
circle.restStep = 100 / circle.restResolution

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

function Vec3WithCol(x, y, z, h, s) {
  var vec = new Vec3(x, y, z);
  vec.h = h;
  vec.s = s;
  return vec;
}

function makeZPlane(x1, y1, h1, s1, x2, y2, h2, s2) {

  for(var j = 0; j > -100; j -= circle.restStep) {

    var next = j - circle.restStep;

    model.vertices.push(
      Vec3WithCol(x1, y1, j, h1, s1),
      Vec3WithCol(x2, y2, j, h2, s2),
      Vec3WithCol(x2, y2, next, h2, s2)
    )

    model.vertices.push(
      Vec3WithCol(x2, y2, next, h2, s2),
      Vec3WithCol(x1, y1, next, h1, s1),
      Vec3WithCol(x1, y1, j, h1, s1)
    )

  }
}

// Init Scene
// ---------------------------------------------

function initScene() {

  group.rotation.x = 8.34;
  group.rotation.z = 6.57;

  scene.background = new THREE.Color(0x222222);
  camera.position.z = 330;
  camera.position.y = 30;

  var light = new THREE.AmbientLight(0xFFFFFF)
  scene.add(light);

  var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

  var next, x1, y1, x2, y2;
  for(var i = circle.start; i < 360; i += circle.hueStep) {

    next = i + circle.hueStep;

    x1 = Math.cos(radians(i)) * 100;
    y1 = Math.sin(radians(i)) * 100;
    x2 = Math.cos(radians(next)) * 100;
    y2 = Math.sin(radians(next)) * 100;

    // circle slice
    model.vertices.push(
      Vec3WithCol(0, 0, -100, i, 0),
      Vec3WithCol(x2, y2, -100, next, 100),
      Vec3WithCol(x1, y1, -100, i, 100)
    )

    makeZPlane(x2, y2, next, 100, x1, y1, i, 100)
  }

  // Make the two end planes
  var x1 = Math.cos(radians(circle.start));
  var y1 = Math.sin(radians(circle.start));
  var x2 = Math.cos(radians(360));
  var y2 = Math.sin(radians(360));
  for(var i = 0; i < 100; i += circle.restStep) {
    var next = i + circle.restStep;
    makeZPlane(x1 * next, y1 * next, circle.start, next, x1 * i, y1 * i, circle.start, i )
    makeZPlane(x2 * i, y2 * i, 360, i, x2 * next, y2 * next, 360, next)
  }

  for(var i = 0; i < model.vertices.length - 2; i += 3) {
    var face = new THREE.Face3(i, i+1, i+2);
    face.vertexColors = [new THREE.Color(0xFF0000), new THREE.Color(0xFF0000), new THREE.Color(0xFF0000)]
    model.faces.push(face);
  }

  model.computeFaceNormals();
  model.computeVertexNormals();

  modelMesh = new THREE.Mesh(model, material);
  group.add(modelMesh);

  sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffff00}));
  sphereMesh.position.y = 2;
  group.add(sphereMesh)

  ringMesh = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
  ringMesh.material.opacity = 0.2;
  ringMesh.material.transparent = true;
  ringMesh.rotation.x = Math.PI/2;
  ringMesh.position.y = 1;
  group.add(ringMesh)

  scene.add(group)

  updateScene(color)
}

// Update Scene
// ---------------------------------------------

function updateScene(color) {

  if(hsl) {
    sphereMesh.material.color.setHSL(color.hue / 360, color.saturation / 100, color.brightness / 100)
  } else {
    var rgb = HSVtoRGB(color.hue / 360, color.saturation / 100, color.brightness / 100);
    sphereMesh.material.color.setRGB(rgb[0], rgb[1], rgb[2]);
  }

  sphereMesh.position.x = color.saturation;
  sphereMesh.position.z = -color.brightness;
  ringMesh.position.x = color.saturation;
  ringMesh.position.z = -color.brightness;

  // if hue changed, change the model vector colors
  // making it appear like the model rotated.
  if(color.hueChanged) {
    var facevars = ['a', 'b', 'c'];
    var h, s, b;
    for(var i = 0; i < model.faces.length; i++) {
      for(var j = 0; j < 3; j++) {
        var vec = model.vertices[model.faces[i][facevars[j]]];
        h = (vec.h + color.hue) / 360;
        s = vec.s / 100;
        b = Math.abs(vec.z) / 100;

        if(hsl) {
          model.faces[i].vertexColors[j].setHSL(h, s, b);
        }
        else {
          var rgb = HSVtoRGB(h, s, b)
          model.faces[i].vertexColors[j].setRGB(rgb[0], rgb[1], rgb[2])
        }
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

document.getElementById('container').onmousemove = function(e) {
  group.rotation.z = e.pageX / 100;
}

initScene();
render();
