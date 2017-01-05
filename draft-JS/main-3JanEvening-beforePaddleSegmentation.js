console.log('JS loaded');

var gameCourt = document.getElementById('gameCourt')
var frameHeight = parseInt($('#gameCourt').css('height')) // jQuery gives height as a string i.e. XYpx. parseInt here would remove everything else
var frameWidth = parseInt($('#gameCourt').css('width'))
var framePadding = parseInt($('#gameCourt').css('padding')) // 5px
var paddleHeight = parseInt($('#paddle1').css('height'))
var paddleWidth = parseInt($('#paddle1').css('width'))
console.log('frameHeight: ' + frameHeight);
console.log('frameWidth: ' + frameWidth);
console.log('paddleHeight: '+ paddleHeight);
console.log('paddleWidth: ' + paddleWidth);
var paddle1Y = 0  // paddle 1 y coordinate
var paddle2Y = 0 // paddle 2 y coordinate
var p1score = 0
var p2score = 0
var paddleAndSpriteOffset = frameHeight / 2 - paddleHeight  // currently coordinates of paddle area and sprite are do not match
var wasSpaceBarPressed = false
var areThereSprites = false
var animationloop // rAF global var
var sprites = [] // sprite catridge...
var spriteCount = 0
console.log('Sprite count at start of game: ' + spriteCount)
// paddle angular response --> specific check when ball enters range of paddle length
var paddleSegment = [0, 0, 0, 0, 0 ,0, 0, 0] //
var paddleSegmentHeight = Math.round(paddleHeight/(paddleSegment.length))  // length of each segment

// dynamic net position
$('#net').css({'top': 0 , 'left': (frameWidth / 2 + framePadding)})

//paddle controls, condition, start button
$(document).keydown(function(e) {
  var keycode = e.which
  if (keycode === 87) { // w key
    paddle1Y -= 30;
    $('#paddle1').css('webkitTransform', 'translate(0px, '+ paddle1Y +'px)');
    console.log('paddle1 is moving up ' + paddle1Y + 'px');
    if (paddle1Y < -(frameHeight/2) + 90) {
        paddle1Y = -(frameHeight/2) + 90
    }
  }
  else if (keycode === 83) { // s key
    paddle1Y += 30;
    $('#paddle1').css('webkitTransform', 'translate(0px, '+ paddle1Y +'px)');
    console.log('paddle1 is moving down ' + paddle1Y  + 'px');
    if (paddle1Y > (frameHeight/2) - 90) {
      paddle1Y = (frameHeight/2) - 90
    }
  }
  else if (keycode === 38) { // up arrow key
    paddle2Y -= 30;
    $('#paddle2').css('webkitTransform', 'translate(0px, '+ paddle2Y +'px)');
    console.log('paddle2 is moving up ' + paddle2Y + 'px');
    if (paddle2Y < -(frameHeight/2) + 90 ) {
        paddle2Y = -(frameHeight/2) + 90
    }
  }
  else if (keycode === 40) { // down arrow key
    paddle2Y += 30;
    $('#paddle2').css('webkitTransform', 'translate(0px, '+ paddle2Y +'px)')
    console.log('paddle2 is moving down ' + paddle2Y + 'px');
    if (paddle2Y > (frameHeight/2) - 90) {
        paddle2Y = (frameHeight/2) - 90
    }
  } else if (keycode === 32) { // space bar
    // toggle(wasSpaceBarPressed)
    reset()
  }
})

// prevents users came launching more balls during level 1 game play
var toggle = function () {
  if (wasSpaceBarPressed === false) {
    reset()
    return (wasSpaceBarPressed = true)
  }
  if (!wasSpaceBarPressed) {
    return
  }
}



//y coordinate range of each paddleSegment:
paddleSegment.forEach(function(value, index) {
if ((sprite[i].y > (paddle1Y + (paddleSegmentHeight * indexOf(value)) + paddleAndSpriteOffset)) &&
(sprite[i].y < (paddle1Y + (paddleSegmentHeight * paddleSegment[index].length) + paddleAndSpriteOffset))) {
    if (indexOf(value) === 0 || 7) { // 15 deg bounce
      sprites[i].ySpeed = sprites[i].ySpeed
      sprites[i].xSpeed = -6 * sprites[i].xSpeed
    }
    if (indexOf(value) === 1 || 6) { // 30 deg bounce
      sprites[i].ySpeed = sprites[i].ySpeed
      sprites[i].xSpeed = -3 * sprites[i].xSpeed
    }
    if (indexOf(value) === 2 || 5) { // 60 deg bounce
      sprites[i].ySpeed = 3 * sprites[i].ySpeed
      sprites[i].xSpeed = -1 * sprites[i].xSpeed
    }
    if (indexOf(value) === 3 || 4) { // 90 deg bounce
      sprites[i].ySpeed = sprites[i].ySpeed
      sprites[i].xSpeed = -1 * sprites[i].xSpeed
    }
  }
})







// 60fps may be a bit too high for this game. when you have time, mess with this.
// refactor based on: http://creativejs.com/resources/requestanimationframe/ --> for some reason, i can't throw in the whole polyfill??? :(
// extra reference: https://css-tricks.com/using-requestanimationframe/

//below is an inbuilt polyfill method which runs the animation only when the window is active.
// requestAnimationFrame polyfill by Erik Möller, fixes from Paul Irish and Tino Zijdel
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

// deletes sprite once it exits frameWidth
function destroySprite () {
  if (!this) { // check that it's refering to the item created
    return
  } else {
    this.parent.removeChild(this.element)
  }
}

// sprite constructor
function SpriteCreate (parentElement) {
	// function references
	this.reposition = repositionSprite;
	this.frame = changeSpriteFrame;
	this.destroy = destroySprite;
	this.parent = gameCourt // parent of sprite
	this.element = document.createElement("div"); // create a DOM sprite div
	this.element.className = 'sprite';
	this.style = this.element.style; // refers to css .sprite style
	// starting position at center of net
  this.x = (frameWidth / 2 + framePadding) - spritesheetFrameWidth / 2
  this.y = (frameHeight / 2 + framePadding) - spritesheetFrameHeight / 2
  this.reposition()
  this.xSpeed = Math.round(Math.random() * 2 +1) * -1
  this.ySpeed = Math.round(Math.random() * 2 ) * randomDir()
  // below 2 lines provide new sprite with a random speed, direction and angle (currently: 90 deg)
	// this.xSpeed = Math.round(Math.random() * 8 + 2) * randomDir()
	// this.ySpeed = Math.round(Math.random() * 8 + 2) * randomDir()
	// random spritesheet frame
	this.frame(spriteCount)
	// put it into the game window
	this.parent.appendChild(this.element)
}

// Spritesheet specs: all sprite frames stored in this spritesheet.
var spritesheetWidth = 300;
var spritesheetHeight = 138;
var spritesheetFrameWidth = 50;
var spritesheetFrameHeight = 46;
var spritesheetXFrames = spritesheetWidth / spritesheetFrameWidth
var spritesheetYFrames = spritesheetHeight / spritesheetFrameHeight
var spritesheetFrames = spritesheetXFrames * spritesheetYFrames;

function changeSpriteFrame(num) {
	if (!this) {
    return;
  } else {
    // $('.sprite').css('background-position', ' (-1 * (num % spritesheetXFrames) * spritesheetFrameWidth) + 'px ' +
		//(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames))
		// * spritesheetFrameHeight + 'px'')
	this.style.backgroundPosition =
		(-1 * (num % spritesheetXFrames) * spritesheetFrameWidth) + 'px ' +
		(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames) * spritesheetFrameHeight) + 'px';
  }
}

// this determines starting position of Sprites and displays the coordinates of ball trajectory...
function repositionSprite () {
  if (!this) {
    return
  } else { // sprites coordinates take y = 0 at top of gameCourt
	   this.style.top = this.y + 'px'
     this.style.left = this.x + 'px'
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

function animateSprites () {
  for (var i = 0; i < spriteCount; i++) {
    sprites[i].x += sprites[i].xSpeed // sprite[i].x = x + xSpeed
    sprites[i].y += sprites[i].ySpeed
	  // bounce at top and bottom
    if ((sprites[i].y <= 0) || (sprites[i].y >= (frameHeight - spritesheetFrameHeight))) {
  		sprites[i].ySpeed = -1 * sprites[i].ySpeed
    } // bounce upon contact with paddle 1
    if (sprites[i].x < framePadding + paddleWidth) { //
      if (sprites[i].x > framePadding) { // to prevent sprite from getting trapped between frame and paddle1
        if (sprites[i].y > paddle1Y + paddleAndSpriteOffset) { // need to find a way to calculate the offset based on changing sizes of the screen
          if (sprites[i].y < (paddle1Y + paddleHeight + spritesheetFrameHeight + paddleAndSpriteOffset)) {
            sprites[i].ySpeed = sprites[i].ySpeed
            sprites[i].xSpeed = -1 * sprites[i].xSpeed
          }
        }
      }
    } // bounce upon contact with paddle 2
    if (sprites[i].x > frameWidth - (framePadding * 2) - spritesheetFrameWidth - paddleWidth) {
      if (sprites[i].x < frameWidth - (framePadding * 2) - spritesheetFrameWidth) { // to prevent sprite from getting trapped between frame and paddle1...
        if (sprites[i].y > paddle2Y + paddleAndSpriteOffset) {
          if (sprites[i].y < (paddle2Y + paddleHeight + spritesheetFrameHeight + paddleAndSpriteOffset)) {
            sprites[i].ySpeed = sprites[i].ySpeed
            sprites[i].xSpeed = -1 * sprites[i].xSpeed
          }
        }
      }
    } // if sprite > +/- frameWidth
    if (sprites[i].x <= (0 - spritesheetFrameWidth * 2)) { // Player 2 scores!
      sprites[spriteCount - 1].destroy()
      spriteCount--
      if (spriteCount === 0) { // rAF stop only when spriteCount = 0
        window.cancelAnimationFrame(animationloop)
        areThereSprites = false
      }
      p2score++
      $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
      isGameOver()
      console.log('sprite left' + spriteCount)
      wasSpaceBarPressed = false
      return
    }
    if (sprites[i].x >= frameWidth) { // Player 1 scores!
      sprites[spriteCount - 1].destroy()
      spriteCount--
      if (spriteCount === 0) {
        window.cancelAnimationFrame(animationloop)
        areThereSprites = false
      }
      p1score++
      $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
      isGameOver()
      console.log('sprite left' + spriteCount)
      wasSpaceBarPressed = false
      return
    } else {
      sprites[i].reposition()
    }
  }
}

// timer... to control FPS but i feel like you don't need this for now...
var currentTimestamp = 0
var previousTimestamp = Date.now()
var framesThisSecond = 0 // may not need this variable as it's for status update
var elapsedMs = 0
var currentFPS = 0
var targetFramerate = 60

function animate () { // --> this is the renderer but we will need to check if game is over.
  // checkFPS() --> you may not need this anymore...
  animationloop = window.requestAnimationFrame(animate)
  areThereSprites = true
  animateSprites()
}

function isGameOver() { // updates message board... this is hard coded ...
  if (p1score === 5 || p2score === 5) {
    if (p1score === 5) {
      $('#gamestatus').text('P1 has won!')
    }
    if (p2score === 5) {
      $('#gamestatus').text('P2 has won!')
    }
    return true
  } else {
    return false
  }
}

function reset () {
  if (isGameOver === true) {
    return
  } else {
    $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
    sprites[spriteCount] = new SpriteCreate()
    spriteCount++
    console.log('number of sprite added:' + spriteCount)
    if (areThereSprites === false) { // this starts rAF
      animate()
    }
    if (areThereSprites === true) { // prevents multiple rAF with creation of new sprites
      animateSprites()
    }
  }
}

// LEVEL 2 OF GAME when either player wins and continues to play, call this function. SetInterval (maybeAddSprite, every 20 secs? )
function maybeAddSprite () {
  if (randomizer() > 8) {
    sprites[spriteCount] = new SpriteCreate()
    spriteCount++
  } else {
    return false
  }
}

var minSpriteCount = 40 // utilise this to prevent too many sprites from flooding the screen but or release for crazy mode

// function paddle1Collision () {
//   if (this.x > (paddle1distanceX + paddleWidth)) {
//     console.log('paddle1 no collision');
//     return false
//   }
//   if (this.x < (paddle1distanceX + paddleWidth)) {
//     if ((this.y > paddle1Y) && (this.y < (paddle1Y + paddleHeight))) {
//       return true
//       console.log('paddleY contact range: ' + paddle1Y + ' - ' + (paddle1Y - paddleHeight));
//       console.log('ball contact coordinates: ' + this.x + ', ' + this.y);
//     }
//     console.log('paddle1 no collision');
//   return false
//   }
// }

// testing variables for engineering
// this.xSpeed = Math.round(Math.random() * 2 +1) * -1
// this.ySpeed = Math.round(Math.random() * 2 ) * randomDir()

// display flex can set the paddles to the desired position and that's taken as (0,0)
// var paddle2distanceX = frameWidth - 10;
// var paddle1distanceX = 5
// $('#paddle1').css({'top': (frameHeight/2 - paddleHeight/2 - 5), 'left': paddle1distanceX}) // sets y = 0 to middle of frameHeight
// $('#paddle2').css({'top': (frameHeight/2 - paddleHeight/2 - 5), 'left': paddle2distanceX})

// function checkFPS () {
//   currentTimestamp = Date.now()
//   elapsedMs = currentTimestamp - previousTimestamp
//   var targetFramerateInterval = 1000 / targetFramerate
//   if ((elapsedMs > targetFramerateInterval)) {
//     previousTimestamp = currentTimestamp - (elapsedMs % targetFramerateInterval)
//     return
//   }
//   if (currentFPS < targetFramerate) {
//     previousTimestamp = currentTimestamp + (elapsedMs % targetFramerateInterval)
//     return
//   }
// }

// var deg15 = function () {
//   if (((sprite[i].y > paddleSegment[0].y) && (sprite[i].y < paddleSegment[0].y + paddleSegmentHeight)) ||
//      ((sprite[i].y > paddleSegment[7].y) && (sprite[i].y < paddleSegment[7].y + paddleSegmentHeight))) {
// }
// }
