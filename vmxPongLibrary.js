//BEGIN LIBRARY CODE
console.clear();
VMX.config.useMagicCanvas = true;
VMX.storage.inited = false;

var geoff_model = 'ghandL';

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

  if(modelName == geoff_model && score > .1){ 
    myx = VMX.storage.scaled_x(detections[0].bb);
    console.log("geoffs model is", modelName, "score is", score, "x is ", myx);
    paddlexAI = myx;
  }

}

VMX.storage.scaled_x = function(bb){
  var x0 = bb[0];
  var x1 = bb[2];
  var y0 = bb[1];
  var y1 = bb[3];
  var dw = Math.round(x1 - x0); //detection width
  var dh = Math.round(y1 - y0); //detection height
  //canvasWidth/Height refers to the video canvas
  canvasWidth = 320;
  canvasHeight = 240;
  var scalew = canvas.width  / canvasWidth;
  var scaleh = canvas.height / canvasHeight;
  x = x0 * scalew;
  return x;
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
  dx = 1;
  dy = 1;
  radius = 5;
  rightDown = false;
  leftDown = false;
  intervalId = 0;

  intervalId = setInterval(draw, 100);
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

function followBallAI() {


  //randomly pick number beteween 0 and 1
  var delayReaction = Math.random();

  //25% chance of reaction delay
  if(delayReaction >= 0.25) {

    if(x > paddlexAI + paddlew) {
      if(paddlexAI + paddlew + 5 <= WIDTH) {
        paddlexAI += 5;
      }
    }

    else if(x < paddlexAI) {
      if(paddlexAI - 5 >= 0) {
        paddlexAI -= 5;
      }
    }

    else {

      var centerPaddle = Math.random();

      //80% chance of better centering the paddle
      //otherwise the paddleAI will most of the times
      //hit the ball in one of its extremities
      if(centerPaddle > 0.2) {

        //if ball closer to left side of computer paddle
        if( Math.abs(x - paddlexAI) < Math.abs(x - paddlexAI - paddlew) ) {
          if(paddlexAI - 5 >= 0) {
            paddlexAI -= 5;
          }
        }

        else {  
          if(paddlexAI + paddlew + 5 <= WIDTH) {
            paddlexAI += 5;
          }
        }
      }

    }

  }

}

function drawSideLines() {
  ctx.beginPath();
  ctx.rect(0,0,10,HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(WIDTH - 10,0,10,HEIGHT);
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
      dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
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

