//BEGIN LIBRARY CODE
console.clear();
VMX.config.useMagicCanvas = true;
VMX.storage.inited = false;

var left_model  = 'lhand';
var right_model = 'rhand';

var scores = {'left': 0, 'right': 0}
var POINTS_TO_WIN = 50;

var canvas;
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

  if(modelName == left_model && score > .1){ 
    myy = VMX.storage.scaled_y(detections[0].bb);
    paddleyAI = myy;
  }
  else if(modelName == right_model && score > .1){ 
    myy = VMX.storage.scaled_y(detections[0].bb);
    paddley = myy;
  }
}

VMX.storage.scaled_x = function(bb){
  var x0 = bb[0];
  //canvasWidth/Height refers to the video canvas
  var canvasWidth = 320;
  var scalew = canvas.width  / canvasWidth;
  return x0 * scalew;
}

VMX.storage.scaled_y = function(bb){
  var y0 = bb[1];
  var y1 = bb[3];
  var det_height = y1 -y0;
  var dCanvasHeight = 240;
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
var paddley;
var paddleh;
var paddlew;
var intervalId;
var rightDown = false;
var leftDown = false;
var radius;
var paddleyAI;


//set rightDown or leftDown if the right or left keys are down
function onKeyDown(evt) {
  if (evt.keyCode == 39) rightDown = true;
  else if (evt.keyCode == 37) leftDown = true;
}

//and unset them when the right or left key is released
function onKeyUp(evt) {
  if (evt.keyCode == 39) rightDown = false;
  else if (evt.keyCode == 37) leftDown = false;
}


$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);

function init_paddles() {
  paddley = HEIGHT / 2;
  //paddleyAI = paddley;
  paddleh = 30;
  paddlew = 10;
}



function init() {
  ctx = canvas.getContext("2d");  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  x = 50;
  y = 50;
  dx = .8;
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
  clear();
  circle(x, y, radius);

  //move the paddle if left or right is currently pressed

  if (rightDown) {
    if(paddley + paddlew + 5 <= WIDTH) {
      paddley += 5;
    }
  }

  else if (leftDown) {
    if(paddley - 5 >= 0) {
      paddley -= 5;
    }
  }

  //followBallAI();

  drawSideLines();
  rect(WIDTH-paddlew,paddley, paddlew, paddleh);
  rect(0,paddleyAI, paddlew, paddleh);

  if (y + dy + radius > HEIGHT || y + dy - radius < 0)
    dy = -dy;

  //left side
  if (x + dx - radius <= 0) {

    if (y <= paddleyAI || y >= paddleyAI + paddleh) {
      clearInterval(intervalId);
      //console.log('You WIN ! :)');
      console.log('point for right');
      scores.right += 1;
      if(scores.right > POINTS_TO_WIN){
        console.log("right wins");
        return;
      }
      console.log(scores);
      init();
    }

    else {
      dx = -dx;
    }
  }
  //right lane
  else if (x + dx + radius > WIDTH) {
    if (y > paddley && y < paddley + paddleh) {
      //dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
      dx = -dx;
    }
    else {
      clearInterval(intervalId);
      console.log('point for left');
      scores.left += 1;
      if(scores.left > POINTS_TO_WIN){
        console.log("left wins");
        return;
      }
      console.log(scores);
      init();
    }
  }
  x += dx;
  y += dy;
}

