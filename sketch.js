// Face Mesh with Distorted Triangles
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh
// https://youtu.be/R5UZsIwPbJA

let video;
let faceMesh;
let predictions = [];
let angle = 0;
let triangles;

function setup() {
  createCanvas(640, 480); // 2D 畫布
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  faceMesh = ml5.facemesh(video, modelReady);
  faceMesh.on('predict', gotFaces);

  // 取得三角形索引
  triangles = ml5.facemesh.triangulation;
}

function modelReady() {
  console.log('FaceMesh ready!');
}

function gotFaces(results) {
  predictions = results;
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  angle += 0.03;

  if (predictions.length > 0) {
    let face = predictions[0];
    let keypoints = face.scaledMesh;

    // 計算臉中心
    let centerX = 0,
      centerY = 0;
    for (let i = 0; i < keypoints.length; i++) {
      centerX += keypoints[i][0];
      centerY += keypoints[i][1];
    }
    centerX /= keypoints.length;
    centerY /= keypoints.length;

    // 計算最大距離
    let maxDist = 0;
    for (let i = 0; i < keypoints.length; i++) {
      let d = dist(keypoints[i][0], keypoints[i][1], centerX, centerY);
      if (d > maxDist) maxDist = d;
    }

    // 產生扭曲後的點
    let keypointsOff = [];
    for (let j = 0; j < keypoints.length; j++) {
      let [x, y] = keypoints[j];
      let d = dist(x, y, centerX, centerY);
      let factor = map(d, 0, maxDist, 1, 0) * map(sin(angle), -1, 1, 0, 4);
      let offX = (x - centerX) * factor;
      let offY = (y - centerY) * factor;
      keypointsOff[j] = [x + offX, y + offY];
    }

    // 畫三角形
    noFill();
    stroke(255);
    beginShape(TRIANGLES);
    for (let i = 0; i < triangles.length; i += 3) {
      let a = triangles[i];
      let b = triangles[i + 1];
      let c = triangles[i + 2];
      let offA = keypointsOff[a];
      let offB = keypointsOff[b];
      let offC = keypointsOff[c];
      vertex(offA[0], offA[1]);
      vertex(offB[0], offB[1]);
      vertex(offC[0], offC[1]);
    }
    endShape();
  }
}
