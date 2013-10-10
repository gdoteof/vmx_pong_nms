//BEGIN LIBRARY CODE
console.clear();
VMX.config.useMagicCanvas = true;
VMX.storage.inited = false;

var left_model  = 'lhand';
var right_model = 'hhand';

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
    myx = VMX.storage.scaled_x(detections[0].bb);
    paddlexAI = myx;
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
  var x0 = bb[0];
  var x1 = bb[2];
  var y0 = bb[1];
  var y1 = bb[3];
  //canvasWidth/Height refers to the video canvas
  var canvasWidth = 320;
  var canvasHeight = 240;
  var scalew = canvas.width  / canvasWidth;
  var scaleh = canvas.height / canvasHeight;
  return x0 * scalew;
}

var WIDTH;
var HEIGHT;
var ctx;
var paddlex;
var paddleh;
var paddlew;
var intervalId;
var rightDown = false;
var leftDown = false;
var radius;
var paddlexAI;


//set rightDown or leftDown if the right or left keys are down
function onKeyDown(evt) {
  console.log("KEY DOWN WITH",evt);
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
  paddlex = WIDTH / 2;
  //paddlexAI = paddlex;
  paddleh = 10;
  paddlew = 75;
}



function init() {
  ctx = canvas.getContext("2d");  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  x = 50;
  y = 50;
  dx = .4;
  dy = .8;
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
  ctx.rect(HEIGHT - 10,0,WIDTH,10);
  ctx.closePath();
  ctx.fill();
}

//END LIBRARY CODE

function draw() {
  clear();
  circle(x, y, radius);

  //move the paddle if left or right is currently pressed

  if (rightDown) {
    if(paddlex + paddlew + 5 <= WIDTH) {
      paddlex += 5;
    }
  }

  else if (leftDown) {
    if(paddlex - 5 >= 0) {
      paddlex -= 5;
    }
  }

  //followBallAI();

  drawSideLines();
  rect(paddlex, HEIGHT-paddleh, paddlew, paddleh);
  rect(paddlexAI, 0, paddlew, paddleh);

  if (x + dx + radius > WIDTH || x + dx - radius < 0)
    dx = -dx;

  //upper lane
  if (y + dy - radius <= 0) {

    if (x <= paddlexAI || x >= paddlexAI + paddlew) {
      clearInterval(intervalId);
      //console.log('You WIN ! :)');
      init();
    }

    else {
      dy = -dy;
    }
  }
  //lower lane
  else if (y + dy + radius > HEIGHT) {
    if (x > paddlex && x < paddlex + paddlew) {
      //dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
      dy = -dy;
    }
    else {
      clearInterval(intervalId);
      //console.log('You Lose ! :(');
          init();
    }
  }
  x += dx;
  y += dy;
}

