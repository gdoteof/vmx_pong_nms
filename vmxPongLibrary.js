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
    myy = VMX.storage.scaled_y(detections[0].bb);
    console.log("trying??");
    paddleyAI = myy;
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
  console.log("started to try");
  var x0 = bb[0];
  var x1 = bb[2];
  var y0 = bb[1];
  var y1 = bb[3];
  var det_height = y1 -y0;
  var dCanvasHeight = 240;
  console.log('det_height',det_height,'dCanvasHeight',dCanvasHeight);
  var in_height = dCanvasHeight - det_height;
  var normalized_detection = (canvas.height / in_height) * y0;
  console.log(in_height,normalized_detection);
  return y0;
  //canvasWidth/Height refers to the video canvas
  var canvasWidth = 320;
  var dCanvasHeight = 240;
  var scalew = canvas.width  / canvasWidth;
  var scaleh = (canvas.height) / dCanvasHeight;
  console.log("pong height", canvas.height, "camera height", dCanvasHeight);
  console.log(y0);
  console.log("tried ^^",scaleh, "<--scaleh");
  return y0;
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
      console.log("right wins");
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
      //console.log('You Lose ! :(');
      console.log("left wins");
      console.log([x,dx,y,paddley,paddleh]);
          init();
    }
  }
  x += dx;
  y += dy;
}

