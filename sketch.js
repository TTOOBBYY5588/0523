let video;
let facemesh;
let predictions = [];
const indices = [409,270,269,267,0,37,39,40,185,61,146,91,181,84,17,314,405,321,375,291];
const indices2 = [76,77,90,180,85,16,315,404,320,307,306,408,304,303,302,11,72,73,74,184];

// --- FaceMesh Triangulated Mosaic Functionality ---
let triangles = null;

// 取得三角形連接資訊（只需取得一次）
function getTriangles(facemeshModel) {
  if (facemeshModel && facemeshModel.triangulation) {
    return facemeshModel.triangulation;
  }
  // ml5.js 沒有直接提供 getTriangles，這裡用 facemesh.triangulation
  return null;
}

// 畫三角形馬賽克
function drawFaceTriangles(keypoints, video) {
  if (!triangles) {
    // 取得三角形連接資訊
    triangles = ml5.facemesh.triangulation;
  }
  if (!triangles) return;

  video.loadPixels();
  noStroke();
  for (let i = 0; i < triangles.length; i += 3) {
    let a = triangles[i];
    let b = triangles[i + 1];
    let c = triangles[i + 2];
    let pa = keypoints[a];
    let pb = keypoints[b];
    let pc = keypoints[c];

    // 計算三角形中心
    let cx = (pa[0] + pb[0] + pc[0]) / 3;
    let cy = (pa[1] + pb[1] + pc[1]) / 3;

    // 取樣顏色
    let ix = constrain(floor(cx), 0, video.width - 1);
    let iy = constrain(floor(cy), 0, video.height - 1);
    let idx = (ix + iy * video.width) * 4;
    let pixels = video.pixels;
    let rr = pixels[idx];
    let gg = pixels[idx + 1];
    let bb = pixels[idx + 2];

    fill(rr, gg, bb);
    beginShape();
    vertex(pa[0], pa[1]);
    vertex(pb[0], pb[1]);
    vertex(pc[0], pc[1]);
    endShape(CLOSE);
  }
}

// 按下 't' 顯示三角形馬賽克
function keyPressed() {
  if (key === 't' && predictions.length > 0) {
    drawFaceTriangles(predictions[0].scaledMesh, video);
  }
}

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });
}

function modelReady() {
  // 模型載入完成，可選擇顯示訊息
}

const leftEye = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 157, 158, 159, 160, 161, 162,
  246, 243, 240, 239, 38, 37, 36, 35, 34, 33
];

// 新增右眼索引
const rightEye = [
  359,467,260,259,257,258,286,414,463,341,256,252,253,254,339,255,
  263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249
];

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 先畫第一組紅色線
    stroke(255, 0, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
    }
    endShape();

    // 再畫第二組紅色線並填滿黃色
    stroke(255, 0, 0);
    strokeWeight(2);
    fill(255, 255, 0, 200); // 半透明黃色
    beginShape();
    for (let i = 0; i < indices2.length; i++) {
      const idx = indices2[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
    }
    endShape(CLOSE);

    // 在第一組與第二組之間充滿綠色
    fill(0, 255, 0, 150); // 半透明綠色
    noStroke();
    beginShape();
    // 先畫第一組
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
    }
    // 再畫第二組（反向，避免交錯）
    for (let i = indices2.length - 1; i >= 0; i--) {
      const idx = indices2[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
    }
    endShape(CLOSE);

    // 左眼藍色線條與圓點特效
    stroke(0, 150, 255);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let i = 0; i < leftEye.length; i++) {
      const idx = leftEye[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
      // 藍色圓點特效
      fill(0, 150, 255, 180);
      noStroke();
      ellipse(x, y, 14, 14); // 放大圓點
      noFill();
      stroke(0, 150, 255);
    }
    endShape(CLOSE);

    // 右眼紫色線條與圓點特效
    stroke(180, 0, 255);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let i = 0; i < rightEye.length; i++) {
      const idx = rightEye[i];
      const [x, y] = keypoints[idx];
      vertex(x, y);
      // 紫色圓點特效
      fill(180, 0, 255, 180);
      noStroke();
      ellipse(x, y, 14, 14); // 放大圓點
      noFill();
      stroke(180, 0, 255);
    }
    endShape(CLOSE);

    // 你可以在這裡加更多特效（如光暈、閃爍等）
  }
}
