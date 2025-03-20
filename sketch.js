let song;
let fft;
let branchAngles = [];
let numBranches = 10;
let audioStarted = false;
let playButton;

function preload() {
  song = loadSound("https://lili81323.github.io/P5.js/ForestNoise2.MP3");
}

function setup() {
  createCanvas(1024, 798);

  playButton = createButton("Click to Play");
  playButton.position(width / 2 - 50, height / 2);
  playButton.mousePressed(startAudio);

  fft = new p5.FFT(0.8, 64);
  fft.smooth(0.85);

  for (let i = 0; i < numBranches; i++) {
    branchAngles.push(random(-PI / 12, PI / 12));
  }
}

function startAudio() {
  userStartAudio().then(() => {
    if (song.isLoaded()) {
      song.loop();
    }
    audioStarted = true;
    playButton.hide();
  });
}

let smoothedBass = 0;
let smoothedMid = 0;
let smoothedTreble = 0;
let smoothedTrunkThickness = 15;
let highTreble = 0;
let leafColorFactor = 0;

function draw() {
  background(255);
  translate(width / 2, height);

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
