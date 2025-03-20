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

function draw() {
  background(255);
  translate(width / 2, height);

  if (!audioStarted) return; 

  let spectrum = fft.analyze();

  let bass = lerp(fft.getEnergy("bass"), fft.getEnergy("lowMid"), 0.5);
  let mid = lerp(fft.getEnergy("mid"), fft.getEnergy("highMid"), 0.5);
  let treble = fft.getEnergy("treble");

  let smoothedBass = lerp(0, bass, 0.05);
  let smoothedMid = lerp(0, mid, 0.05);
  let smoothedTreble = lerp(0, treble, 0.05);

  let branchAngle = map(smoothedMid, 0, 255, PI / 10, PI / 4);
  let leafOpacity = map(smoothedTreble, 0, 255, 100, 255);

  recursiveBranch(180, 15, branchAngle, leafOpacity, 0);
}

function recursiveBranch(len, weight, angle, leafAlpha, depth) {
  if (len < 10) return;

  stroke(100, 50, 0);
  strokeWeight(weight);
  line(0, 0, 0, -len);
  translate(0, -len);

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
    fill(34, 139, 34, leafAlpha);
    noStroke();
    ellipse(0, 0, random(5, 18), random(5, 18));
  }
}
