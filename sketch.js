// IAT 806 · Lab 04 starter: the dancer grid from Week 4, ready for your website.
// Run with Live Server. Uses p5 2.x (async setup, await loadImage).

// Physical constants
const minVel = 2.0;
const maxVel = 20.0;
const drag = 0.01; // Drag coefficient (0-1)
const elast = 0.9; // Collision elasticity (0-1)
const grav = 1.0; // Acceleration due to gravity (pixels per frame^2)

class Ball {
  constructor(randomize = false) {
    // Radius
    this.r = 10;

    // Spatial vectors
    this.pos = createVector(0.0, 0.0);
    this.vel = createVector(0.0, 0.0);

    // Color
    this.red = 0;
    this.blue = 0;
    this.green = 0;

    this.acc = 0.1; // Click acceleration factor
    this.var = 100; // Random variability of click location

    if (randomize) {
      // Random position
      this.pos.x = random(this.r, width - this.r);
      this.pos.y = random(this.r, height - this.r);
    }
  }

  update() {
    // Move
    this.pos.add(this.vel);

    // Gravity (deactivates when ball is roughly in contact with ground)
    if (this.pos.y < height - this.r * 1.2) {
      this.vel.y += grav;
    }

    // Drag
    this.vel.mult(1.0 - drag);
  }

  render() {
    noStroke();
    fill(color(this.red, this.green, this.blue));
    circle(this.pos.x, this.pos.y, this.r * 2);
  }

  launch() {
      this.vel.x += (mouseX - this.pos.x + random(-this.var, this.var)) * this.acc;
      this.vel.y += (mouseY - this.pos.y + random(-this.var, this.var)) * this.acc;
  }
}

function staticCollision(ball) {
  // x bounds
  if (ball.pos.x >= width - ball.r) {
    ball.vel.x = -ball.vel.x * elast;
    ball.pos.x = width - ball.r;
  }
  if (ball.pos.x <= ball.r) {
    ball.vel.x = -ball.vel.x * elast;
    ball.pos.x = ball.r;
  }

  // y bound (no top edge)
  if (ball.pos.y >= height - ball.r) {
    // Clamp velocity to avoid infinite bouncing
    if (Math.abs(ball.vel.y) < minVel) {
      ball.vel.y = 0;
    }
    ball.vel.y = -ball.vel.y * elast;
    ball.pos.y = height - ball.r;
  }
}

let frames = []; // the 8 dance poses
let frames2 = []; // TODO: load the jump poses into this array
let numFrames = 8;

let numCols = 20;
let numRows = 10;
let colWidth;
let rowHeight;

// 2D arrays: one color and one speed for every cell in the grid
let colors = [];

let balls = [];
let speedBall;
let flipBall;
let scaleBall;

async function setup() {
  const canvas = createCanvas(800, 420);

  // puts the canvas inside <div id="sketch-holder"> in index.html
  //canvas.parent("sketch-holder");

  speedBall = new Ball(true);
  speedBall.red = 255;
  balls.push(speedBall);

  jumpBall = new Ball(true);
  jumpBall.green = 255;
  balls.push(jumpBall);

  scaleBall = new Ball(true);
  scaleBall.blue = 255;
  balls.push(scaleBall);


  for (let i = 0; i < numCols; i++) {
    colors[i] = [];
    for (let j = 0; j < numRows; j++) {
      colors[i][j] = [random(1, 255), random(1, 255), random(1, 255)];
    }
  }

  rowHeight = height / numRows;

  for (let i = 0; i < numFrames; i++) {
    let fileName = "dance_frames/dance" + i + ".png";
    frames.push(await loadImage(fileName));
  }
  for (let i = 0; i < numFrames; i++) {
    let fileName = "jump_frames/jump" + i % 4 + ".png";
    frames2.push(await loadImage(fileName));
  }
}

function draw() {
  background(120);

  colWidth = width / numCols;

  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      let speedBallDist = dist(i * colWidth, j * rowHeight, speedBall.pos.x, speedBall.pos.y);
      let speed = map(speedBallDist, 0, 500, 2, 20, true);

      let jumpBallDist = dist(i * colWidth, j * rowHeight, jumpBall.pos.x, jumpBall.pos.y);
      let cellFrames = frames;
      if (jumpBallDist < 200) {
        cellFrames = frames2;
      }

      let scaleBallDist = dist(i * colWidth, j * rowHeight, scaleBall.pos.x, scaleBall.pos.y);
      let scale = map(scaleBallDist, 0, 500, 2, 1, true);

      fill(colors[i][j][0], colors[i][j][1], colors[i][j][2], 120);
      rect(i * colWidth, j * rowHeight, colWidth, rowHeight);
      animate(cellFrames, int(speed), i * colWidth, j * rowHeight, colWidth * scale);
    }
  }

  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
    staticCollision(balls[i]);
    balls[i].render();
  }
}

// draws one dancer: which poses, how fast, where, and how big
function animate(frames, speed, xPosition, yPosition, imageWidth) {
  let index = getFrameIndex(speed);
  let currentFrame = frames[index];
  let origWidth = currentFrame.width;
  let origHeight = currentFrame.height;

  // I am just getting rid of the imageHeight parameter
  let scale = imageWidth / origWidth;
  let imageHeight = scale * origHeight;
  image(currentFrame, xPosition, yPosition, imageWidth, imageHeight);
}

// which pose to show right now. speed = draw-frames per pose: smaller = faster
function getFrameIndex(speed) {
  let slowFrame = Math.floor(frameCount / speed);
  let index = slowFrame % frames.length;

  return index;
}

function mousePressed() {
  for (let i = 0; i < balls.length; i++) {
    balls[i].launch();
  }
}