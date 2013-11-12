//BEGIN LIBRARY CODE
console.clear();
VMX.config.useMagicCanvas = true;
VMX.storage.inited = false;

var left_model  = window.prompt("model for left side", 'lhand');
var right_model = window.prompt("model for right side", 'rhand');

var scores = {'left': 0, 'right': 0}
var POINTS_TO_WIN = 7;

var canvas;

var config = {
  minTime: 5000,
}

VMX.callback=function(detections){
  var modelName = detections[0].cls;
  var score     = detections[0].score;
  if(!VMX.storage.inited || !canvas){
    try{
      canvas = VMX.getMagicCanvas();
    } catch(e){
      return;
    }
    if(canvas){
      VMX.storage.inited = true;
      init();
    }
    return;
  }
  return;

  if(modelName == left_model && score > .1){ 
    myy = VMX.storage.scaled_y(detections[0].bb);
    paddleLeftY = myy;
  }
  else if(modelName == right_model && score > .1){ 
    myy = VMX.storage.scaled_y(detections[0].bb);
    paddleRightY = myy;
  }
}


VMX.storage.scaled_y = function(bb){
  var y0 = bb.y1;
  var y1 = bb.y2;
  var det_height = y1 - y0;
  var dCanvasHeight = bb.trackerHeight;
  var in_height = dCanvasHeight - det_height;
  var scaleh = (canvas.height/in_height);
  var normalized_detection = y0 / in_height;
  var normalized_draw = normalized_detection * (canvas.height - paddleh);
  return normalized_draw;
  if (normalized_detection < .08) {
    normalized_detection = 0;
  }
  else if( normalized_detection > .92 ) {
    normalized_detection = 1;
  }
}

var WIDTH;
var HEIGHT;
var ctx;
var paddleRightY;
var paddleh;
var paddlew;
var intervalId;
var rightDown = false;
var leftDown = false;
var radius;
var paddleLeftY;
dx = 2;



function init_paddles() {
  paddleRightY = HEIGHT / 2;
  //paddleLeftY = paddleRightY;
  paddleh = 30;
  paddlew = 10;
}



function init() {
  if(dx < 0 ){
    dx *= -1;
  }
  ctx = canvas.getContext("2d");  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  x = 50;
  y = 50;
  dy = .4;
  radius = 5;
  rightDown = false;
  leftDown = false;
  intervalId = 0;

  intervalId = setInterval(draw, 10);
  init_paddles();

}

function circle(x,y,r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

function rect(x,y,w,h) {
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.closePath();
  ctx.fill();
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawSideLines() {
  ctx.beginPath();
  ctx.rect(0,0,WIDTH,10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(0,HEIGHT - 10,WIDTH,10);
  ctx.closePath();
  ctx.fill();
}

//END LIBRARY CODE

function draw() {
  var left_pos  =  vmxApi(left_model).getSmooth();
  var right_pos = vmxApi(right_model).getSmooth();
    
    
  paddleRightY = VMX.storage.scaled_y(right_pos);
  paddleLeftY  =  VMX.storage.scaled_y(left_pos);
  console.log(left_pos.y, paddleLeftY);
  clear();
  circle(x, y, radius);

  

  drawSideLines();
  //right paddle
  rect(WIDTH-paddlew, paddleRightY, paddlew, paddleh);
  //left paddle
  rect(0,paddleLeftY, paddlew, paddleh);

  //bouncing against top or bottom
  if (y + dy + radius > HEIGHT || y + dy - radius < 0)
    dy = -dy;

  //left side
  if (x + dx - radius <= 0) {

    if (y <= paddleLeftY || y >= paddleLeftY + paddleh) {
      clearInterval(intervalId);
      console.log('point for right');
      scores.right += 1;
      dx = dx / 1.1;
      if(scores.right > POINTS_TO_WIN){
        alert("right wins");
        return;
      }
      console.log(scores);
      init();
    }

    else {
      dx = -dx;
      dx = 1.1 * dx;
    }
  }
  //right right side
  else if (x + dx + radius > WIDTH) {
    if (y > paddleRightY && y < paddleRightY + paddleh) {
      //dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
      dx = -dx;
      dx = dx * 1.1;
    }
    else {
      clearInterval(intervalId);
      console.log('point for left');
      scores.left += 1;
      dx = dx / 1.1;
      if(scores.left > POINTS_TO_WIN){
        alert("left wins");
        return;

      }
      console.log(scores);
      init();
    }
  }

  //move ball
  x += dx;
  y += dy;
}

