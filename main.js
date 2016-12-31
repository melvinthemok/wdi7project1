console.log('JS loaded');

var gameCourt = document.getElementById('gameCourt')
var paddle1distanceY = 0;
var paddle1distanceX = frameWidth; // may not need cos display:flex is keeping them in place.
var paddle2distanceY = 0;
var paddle2distanceX = -frameWidth; // may not need
var p1score = 0
var p2score = 0
var frameHeight = parseInt($('#gameCourt').css('height')) // jQuery gives height as a string i.e. XYpx. parseInt here would remove everything else
var frameWidth = parseInt($('#gameCourt').css('width'))
// var heightLimit = (frameHeight - parseInt($('.sprite').css('height'))) / 2 //subtract ball diameter which has been determined in css.
// var widthLimit = (frameWidth - parseInt($('.sprite').css('width'))) / 2
console.log(frameHeight);
console.log(frameWidth);

// dynamic net position
$('#net').css({'top': 0 , 'left': (frameWidth/2)})

//paddle controls, condition, start button
$(document).keydown(function(e) {
  var keycode = e.which
  if (keycode === 87) { // w key
    paddle1distanceY -= 30;
    $('#paddle1').css('webkitTransform', 'translate(0px, '+ paddle1distanceY +'px)');
    console.log('paddle1 is moving up ' + paddle1distanceY + 'px');
    if (paddle1distanceY <= -(frameHeight/2)+ 75) {
        paddle1distanceY = -(frameHeight/2) + 75
    }
  }
  else if (keycode === 83) { // s key
    paddle1distanceY += 30;
    $('#paddle1').css('webkitTransform', 'translate(0px, '+ paddle1distanceY +'px)');
    console.log('paddle1 is moving down ' + paddle1distanceY  + 'px');
    if (paddle1distanceY >= (frameHeight/2)- 75) {
      paddle1distanceY = (frameHeight/2) - 75
    }
  }
  else if (keycode === 38) { // up arrow key
    paddle2distanceY -= 30;
    $('#paddle2').css('webkitTransform', 'translate(0px, '+ paddle2distanceY +'px)');
    console.log('paddle2 is moving up ' + paddle2distanceY + 'px');
    if (paddle2distanceY <= -(frameHeight/2) + 75) {
        paddle2distanceY = -(frameHeight/2) + 75
    }
  }
  else if (keycode === 40) { // down arrow key
    paddle2distanceY += 30;
    $('#paddle2').css('webkitTransform', 'translate(0px, '+ paddle2distanceY +'px)')
    console.log('paddle2 is moving down ' + paddle2distanceY + 'px');
    if (paddle2distanceY >= (frameHeight/2) - 75) {
        paddle2distanceY = (frameHeight/2) - 75
    }
  } else if (keycode === 32) { // space bar
    reset()
  }
})

// sprite batches
var sprites = [];
var spriteCount = 0;

// timer and stats --> perhaps i can get rid of this...
var currentTimestamp = new Date().getTime();
var previousTimestamp = 0;
var framesThisSecond = 0;
var elapsedMs = 0;
var currentFPS = 60;

// ensure that we have requestAnimationFrame which runs the animation only when the window is active. Below is from Paul Irish's compatibility shim
if (!window.requestAnimationFrame)
{
  window.requestAnimationFrame = (function()
  {
    return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback,element)
    {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
}

// this cross checks the current FPS.
// function checkFPS() {
//   framesThisSecond++;
//   previousTimestamp = currentTimestamp;
//   currentTimestamp = new Date().getTime();
//   elapsedMs += currentTimestamp - previousTimestamp;
//   currentFPS = 1000 / (currentTimestamp - previousTimestamp); // only update once per second
// }

// removes sprite from DOM element once it exits frameWidth
function destroySprite() {
	if (!this) { // just a check that it's refering to the item created
    return
  } else {
	  this.parent.removeChild(this.element)
  }
}

// the sprite class - DOM sprite version
function SpriteCreate(parentElement) {
	// function references
	this.reposition = repositionSprite;
	this.frame = changeSpriteFrame;
	this.destroy = destroySprite;
	this.parent = gameCourt // parent of sprite
	this.element = document.createElement("div"); // create a DOM sprite
	this.element.className = 'sprite';
	this.style = this.element.style; // points it towards css .sprite style
	// starting position from center of net. previous results are not stored.
  this.x = frameWidth/2 - spritesheetFrameWidth/2
  this.y = frameHeight/2 - Math.round(spritesheetFrameHeight/1.5) // this.ANGLE ==> an addition to determine the angle the ball will be launched
  this.reposition();
	// give new sprite a random speed
	this.xSpeed = Math.round(Math.random() * 10 + 1) * randomDir()  //
	this.ySpeed = Math.round(Math.random() * 10 + 1)
	// random spritesheet frame
	this.frame(spriteCount);
	// put it into the game window
	this.parent.appendChild(this.element); // --> $('<div class="sprite"></div>').append()
}

// SPRITESHEET: all sprite frames stored in this spritesheet.
var spritesheetWidth = 300;
var spritesheetHeight = 138;
var spritesheetFrameWidth = 50;
var spritesheetFrameHeight = 46;
var spritesheetXFrames = spritesheetWidth / spritesheetFrameWidth;
var spritesheetYFrames = spritesheetHeight / spritesheetFrameHeight;
var spritesheetFrames = spritesheetXFrames * spritesheetYFrames;

// this determines starting position of Sprites and displays the path coordinates ball trajectory...
function repositionSprite() {
	if (!this) {
    return;
  } else {
		this.style.top = this.y + 'px';
    this.style.left = this.x + 'px';
    // replace jQuery $('this').css({'top': this.y, 'left': this.x})
  }
}

function randomizer () {
  var x = Math.floor(Math.random() * 10 + 1)
  return x
}

function randomDir () {
  if (randomizer() > 5) {
    return 1
  } else {
    return -1
  }
}

// random selection of  sprite image.
function changeSpriteFrame(num) {
	if (!this) {
    return;
  } else {
    // $('.sprite').css('background-position', ' (-1 * (num % spritesheetXFrames) * spritesheetFrameWidth) + 'px ' +
		//(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames))
		// * spritesheetFrameHeight + 'px'')
	this.style.backgroundPosition =
		(-1 * (num % spritesheetXFrames) * spritesheetFrameWidth + 'px ') +
		(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames))
		* spritesheetFrameHeight + 'px ';
  }
}

function animateSprites() {
  for (var i = 0; i < spriteCount; i++) {
    sprites[i].x += sprites[i].xSpeed // sprite[i].x = x + xSpeed --> continuously until below condition is met
    sprites[i].y += sprites[i].ySpeed // how to clear this function each time?
	   //--> bounce at top and bottom
    if ((sprites[i].y <= (0 + spritesheetFrameHeight / 2)) || (sprites[i].y >= (frameHeight - spritesheetFrameHeight))) {
  		sprites[i].ySpeed = -1 * sprites[i].ySpeed;
    }
    if (sprites[i].x < (0 - spritesheetFrameWidth * 2)) { // Player 2 scores!
      p2score ++;
      // isGameOver()
      sprites[i].x = 0
      console.log('sprite x coordinate is now' + sprites[i].x);
      sprites[i].y = 0
      sprites[spriteCount-1].destroy();
      spriteCount--;
      console.log('sprite left' + spriteCount)
    } if (sprites[i].x > frameWidth) { // Player 1 scores!
      p1score++;
      sprites[i].x = 0
      sprites[i].y = 0
      // isGameOver()
      sprites[spriteCount-1].destroy();
      spriteCount--;
      console.log('sprite left' + spriteCount);
    } else {
    sprites[i].reposition() // find out why this happens though...
    }
  }
}

  function animate() // --> this is the renderer but we will need to check if game is over.
  {
  	requestAnimationFrame(animate);
  	animateSprites();
  }

//updates game status as well
function isGameOver() { // updates message board... this is hard coded ...
  if (p1score === 8 || p2score === 8) {
    if (p1score === 8) {
      $('#gamestatus').text('P1 has won!')
    }
    if (p2score === 8) {
      $('#gamestatus').text('P2 has won!')
    }
    return true
  } else {
    return false
  }
}

function reset() { //
  if (isGameOver === true) {
    return
  } else {
    sprites[spriteCount] = new SpriteCreate()
    spriteCount++
    console.log('number of sprite added:' + spriteCount);
    animate()
  }
}


// LEVEL 2 OF GAME when either player wins and continues to play, activate this randomizer. SetInterval (maybeAddSprite, )
function maybeAddSprite () {
    if (randomizer() > 8) {
      sprites[spriteCount] = new SpriteCreate()
      spriteCount++
    } else {
      return false
    }
}

// function maybeMoreSprites()  --> do not need this function unless you want to add more...
// {
// 	var howmany = 0;
// 	// keep adding sprites until we go below the target fps
// 	if ((currentFPS > targetFramerate) || (spriteCount < minSpriteCount))  --> if any one player wins, increase sprite count.
// 	{
// 		howmany = newMovingSpritesPerSecond;
// 		while (howmany--)
// 		{
// 			// add one new animated sprite
// 			sprites[spriteCount] = new Sprite();
// 			spriteCount++;
// 		}
//
// 		howmany = newLevelSpritesPerSecond;
// 		while (howmany--)
// 		{
// 			// also add tiles to the static level geometry
// 			levelSprites[levelSpriteCount] = new Sprite(level);
// 			levelSpriteCount++;
// 		}
// 	}
// 	// remove sprites if the FPS dips too low
// 	else
// 	{
// 		howmany = newMovingSpritesPerSecond;
// 		while (howmany--)
// 		{
// 			if (spriteCount)
// 			{
// 				sprites[spriteCount-1].destroy();
// 				spriteCount--;
// 			}
// 		}
//
// 		howmany = newLevelSpritesPerSecond;
// 		while (howmany--)
// 		{
// 			if (levelSpriteCount)
// 			{
// 				levelSprites[levelSpriteCount-1].destroy();
// 				levelSpriteCount--;
// 			}
// 		}
// 	}
// }
