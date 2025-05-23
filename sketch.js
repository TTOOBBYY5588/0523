// Face Mesh with Distorted Triangles
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh
// https://youtu.be/R5UZsIwPbJA

let video;
let faceMesh;
let faces = [];
let triangles;

let angle = 0;

function preload() {
  // Initialize FaceMesh model with a maximum of one face
  faceMesh = ml5.faceMesh({ maxFaces: 1 });
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480, WEBGL);
  video = createCapture(VIDEO);
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);

  // Retrieve face mesh triangles for texture mapping
  triangles = faceMesh.getTriangles();
  textureMode(NORMAL);
}

function draw() {
  translate(-width / 2, -height / 2);
  background(0);

  angle += 0.03;

  if (faces.length > 0) {
    let face = faces[0];

    // Compute face center and maximum distance from center
    let centerX = (face.box.xMin + face.box.xMax) / 2;
    let centerY = (face.box.yMin + face.box.yMax) / 2;
    let maxDist = dist(face.box.xMin, face.box.yMin, centerX, centerY);

    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let keypointsOff = [];

      // Apply distortion effect to each keypoint
      for (let j = 0; j < face.keypoints.length; j++) {
        let keypoint = face.keypoints[j];
        let d = dist(keypoint.x, keypoint.y, centerX, centerY);

        // Compute distortion factor based on distance and oscillation
        let factor = map(d, 0, maxDist, 1, 0) * map(sin(angle), -1, 1, 0, 4);
        let offX = (keypoint.x - centerX) * factor;
        let offY = (keypoint.y - centerY) * factor;

        keypointsOff[j] = { x: keypoint.x + offX, y: keypoint.y + offY };
      }

      // Apply video texture to distorted face mesh
      texture(video);
      stroke(255);
      beginShape(TRIANGLES);

      // Draw triangles with distorted keypoints
      for (let i = 0; i < triangles.length; i++) {
        let tri = triangles[i];
        let [a, b, c] = tri;
        let offA = keypointsOff[a];
        let offB = keypointsOff[b];
        let offC = keypointsOff[c];
        let pointA = face.keypoints[a];
        let pointB = face.keypoints[b];
        let pointC = face.keypoints[c];

        vertex(offA.x, offA.y, pointA.x / width, pointA.y / height);
        vertex(offB.x, offB.y, pointB.x / width, pointB.y / height);
        vertex(offC.x, offC.y, pointC.x / width, pointC.y / height);
      }

      endShape();
    }
  }
}
