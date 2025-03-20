let song;
let fft;
let branchAngles = [];
let numBranches = 10;

let smoothedBass = 0;
let smoothedMid = 0;
let smoothedTreble = 0;
let smoothedTrunkThickness = 15;
let highTreble = 0;
let leafColorFactor = 0;

let playButton; // 按钮变量
let audioStarted = false; // 追踪音频是否已开始

function preload() {
  // 确保这个链接可以访问到音频
  song = loadSound("https://lili81323.github.io/P5.js/ForestNoise2.MP3", soundLoaded, loadError);
}

function soundLoaded() {
  console.log("音频文件已加载 🎵");
}

function loadError(err) {
  console.log("⚠️ 音频加载失败:", err);
}

function setup() {
  createCanvas(1024, 798);

  // 创建按钮
  playButton = createButton("🎵 点击播放声音 🎵");
  playButton.position(width / 2 - 50, height / 2);
  playButton.style("font-size", "16px");
  playButton.style("padding", "10px");
  playButton.style("background-color", "#4CAF50");
  playButton.style("color", "white");
  playButton.mousePressed(startAudio); // 绑定点击事件

  fft = new p5.FFT(0.8, 64);
  fft.smooth(0.85);

  for (let i = 0; i < numBranches; i++) {
    branchAngles.push(random(-PI / 12, PI / 12));
  }
}

function draw() {
  background(255);
  translate(width / 2, height);

  if (!audioStarted) {
    textSize(20);
    fill(0);
    textAlign(CENTER, CENTER);
    text("点击按钮开始声音", width / 2, height / 3);
    return; // 还没开始播放音频时，不执行视觉化
  }

  let spectrum = fft.analyze();

  let bass = lerp(fft.getEnergy("bass"), fft.getEnergy("lowMid"), 0.5);
  let mid = lerp(fft.getEnergy("mid"), fft.getEnergy("highMid"), 0.5);
  let treble = fft.getEnergy("treble");
  highTreble = fft.getEnergy(8000, 16000);
  smoothedBass = lerp(smoothedBass, bass, 0.05);
  smoothedMid = lerp(smoothedMid, mid, 0.05);
  smoothedTreble = lerp(smoothedTreble, treble, 0.05);

  let isHarshSound = highTreble > 120;

  let targetThickness = map(
    smoothedBass,
    0,
    255,
    isHarshSound ? 5 : 15,
    isHarshSound ? 10 : 30
  );
  smoothedTrunkThickness = lerp(smoothedTrunkThickness, targetThickness, 0.1);

  let branchAngle = map(smoothedMid, 0, 255, PI / 10, PI / 4);
  let leafOpacity = map(smoothedTreble, 0, 255, 100, 255);

  if (isHarshSound) {
    leafColorFactor = 1;
  } else {
    leafColorFactor = lerp(leafColorFactor, 0, 0.03);
  }

  recursiveBranch(180, smoothedTrunkThickness, branchAngle, leafOpacity, 0);
}

// 递归画分支
function recursiveBranch(len, weight, angle, leafAlpha, depth) {
  if (len < 10) return;

  let trunkColor = color(100, 50, 0);
  stroke(trunkColor);
  strokeWeight(weight);

  let xOffset = random(-0.5, 0.5);
  line(xOffset, 0, xOffset, -len);
  translate(xOffset, -len);

  let angleOffset = branchAngles[depth % numBranches];

  push();
  rotate(-angle + angleOffset);
  recursiveBranch(len * 0.7, weight * 0.8, angle, leafAlpha, depth + 1);
  pop();

  push();
  rotate(angle + angleOffset);
  recursiveBranch(len * 0.7, weight * 0.8, angle, leafAlpha, depth + 1);
  pop();

  if (len < 25) {
    let leafColor = color(
      lerp(34, 255, leafColorFactor),
      lerp(139, 204, leafColorFactor),
      lerp(34, 0, leafColorFactor),
      leafAlpha
    );

    fill(leafColor);
    noStroke();

    let leafSize = random(5, 18);
    let leafCount = int(random(2, 6));

    for (let i = 0; i < leafCount; i++) {
      let x = random(-6, 6);
      let y = random(-6, 6);
      ellipse(x, y, leafSize, leafSize);
    }
  }
}

// 用户点击按钮后开始音频
function startAudio() {
  userStartAudio(); // 解锁音频播放
  if (song.isLoaded() && !song.isPlaying()) {
    song.loop();
    console.log("🎶 开始播放音乐 🎶");
  } else {
    console.log("⚠️ 音频未正确加载");
  }
  audioStarted = true;
  playButton.hide(); // 隐藏按钮
}

