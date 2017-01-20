var scene = new THREE.Scene();
var geometry = new THREE.Geometry();
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);
var theMesh;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var Vec2 = THREE.Vector2;
var Vec3 = THREE.Vector3;

var color = {
  hue: 0,
  saturation: 50,
  brightness: 70,
  hueChange: 0
}

var circle = {
  start: 70,
  end: 360,
  resolution: 1,
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

// Converts RGB to HSV expecting values 0-1
function RGBtoHSV(r, g, b) {
  var rr, gg, bb,
    h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c){
        return (v - c) / 6 / diff + 1 / 2;
    };

  if (diff == 0) {
      h = s = 0;
  } else {
      s = diff / v;
      rr = diffc(r);
      gg = diffc(g);
      bb = diffc(b);

      if (r === v) {
          h = bb - gg;
      }else if (g === v) {
          h = (1 / 3) + rr - bb;
      }else if (b === v) {
          h = (2 / 3) + gg - rr;
      }
      if (h < 0) {
          h += 1;
      }else if (h > 1) {
          h -= 1;
      }
  }
  return [h, s, v];
}

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
    geometry.vertices.push(
      new Vec3(x1, y1, j),
      flip ? new Vec3(x2, y2, j + circle.resolution) : new Vec3(x2, y2, j),
      flip ? new Vec3(x2, y2, j) : new Vec3(x2, y2, j + circle.resolution)
    );
    geometry.vertices.push(
      new Vec3(x2, y2, j + circle.resolution),
      flip ? new Vec3(x1, y1, j) : new Vec3(x1, y1, j + circle.resolution),
      flip ? new Vec3(x1, y1, j + circle.resolution) : new Vec3(x1, y1, j)
    );
  }
}

// Init Scene
// ---------------------------------------------

function initScene() {

  scene.background = new THREE.Color(0x111111);
  camera.position.z = 300;
  camera.position.y = 50;

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
    geometry.vertices.push(new Vec3(0, 0, 100), new Vec3(x1, y1, 100), new Vec3(x2, y2, 100))

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
  for(var i = 0; i < geometry.vertices.length - 2; i += 3) {
    var face = new THREE.Face3(i, i+1, i+2);
    face.vertexColors = [new THREE.Color(0xFF0000), new THREE.Color(0xFF0000), new THREE.Color(0xFF0000)]
    geometry.faces.push(face);
  }
  updateScene(color)

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  theMesh = new THREE.Mesh( geometry, material )
  theMesh.rotation.x = 5.26;
  theMesh.rotation.z = 4.04;
  scene.add(theMesh);
}

// Update Scene
// ---------------------------------------------

function updateColors(color) {
  var facevars = ['a', 'b', 'c']
  for(var i = 0; i < geometry.faces.length; i++) {
    for(var j = 0; j < 3; j++) {
      var vec = geometry.vertices[geometry.faces[i][facevars[j]]];
      var rgb = HSVtoRGB(
        (360 - degrees(Math.atan2(vec.y, vec.x)) + color.hue + circle.start) / 360,
        Math.sqrt(vec.x * vec.x + vec.y * vec.y) / 100,
        vec.z / 100
      )
      geometry.faces[i].vertexColors[j].setRGB(rgb[0], rgb[1], rgb[2])
    }
  }
  geometry.colorsNeedUpdate = true;
}

function updateScene(color) {
  if(color.hueChanged) {
    updateColors(color);
    color.hueChanged = false;
  }
}

function changeColor(h, s, v) {
  color.hueChanged = h != color.hue;
  color.hue = h;
  color.saturation = s;
  color.brightness = v;
}

// Go baby go
// ---------------------------------------------

var render = function () {
  requestAnimationFrame(render);
  updateScene(color)
  renderer.render(scene, camera);
};

document.body.onmousemove = function(e){
  changeColor(e.pageX % 360, 100, 100);
}

initScene();
render();
