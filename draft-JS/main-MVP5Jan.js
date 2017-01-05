console.log('JS loaded');

var gameCourt = document.getElementById('gameCourt')
var frameHeight = parseInt($('#gameCourt').css('height')) // jQuery gives height as a string i.e. XYpx. parseInt here would remove everything else
var frameWidth = parseInt($('#gameCourt').css('width'))
var framePadding = parseInt($('#gameCourt').css('padding')) // 5px
var paddleHeight = parseInt($('#paddle1').css('height'))
var paddleWidth = parseInt($('#paddle1').css('width'))
var paddle1YDistance = 0  // paddle 1 y distance moved
var paddle2YDistance = 0 // paddle 2 y distance moved
var p1score = 0
var p2score = 0
var level = 1
var wasSpaceBarPressed = false
var areThereSprites = false
var animationloop // rAF global var
var sprites = [] // sprite catridge...
var spriteCount = 0
console.log('Sprite count at start of game: ' + spriteCount)


// dynamic net position
$('#net').css({'top': 0 , 'left': (frameWidth / 2 + framePadding)})
$('#paddle1').css({'top': (frameHeight/2 - paddleHeight/2 - framePadding), 'left': framePadding}) // sets y = 0 to middle of frameHeight
$('#paddle2').css({'top': (frameHeight/2 - paddleHeight/2 - framePadding), 'left': frameWidth - framePadding - paddleWidth})

//paddle controls, start button
var keys = {}

$(document).keydown(function (e) {
  keys[e.which] = true
})

$(document).keyup(function (e) {
  keys[e.which] = false
})

$(document).keydown(function (e) { // starts game
  if (e.which === 32) {
    console.log(keys);
    toggle(wasSpaceBarPressed)
  }
})

function whatKey() {
  if (keys[87]) { // w
    if ($('#paddle1').position().top > framePadding) {
      paddle1YDistance -= 5;
      $('#paddle1').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle1YDistance)
    }
    else {
      paddle1YDistance -= 0
      $('#paddle1').position().top = framePadding
    }
  }
  if (keys[83]) { //s
    if ($('#paddle1').position().top < frameHeight - framePadding - paddleHeight) {
      paddle1YDistance += 5;
      $('#paddle1').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle1YDistance)
    } else {
      paddle1YDistance += 0
      $('#paddle1').position().top = frameHeight - framePadding - paddleHeight
    }
  }
  if (keys[38]) { // up
    if ($('#paddle2').position().top > framePadding) {
      paddle2YDistance -= 5;
      $('#paddle2').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle2YDistance)
    } else {
      paddle2YDistance -= 0
      $('#paddle1').position().top = framePadding
    }
  }
  if (keys[40]) { //down
    if ($('#paddle2').position().top < frameHeight - framePadding - paddleHeight) {
      paddle2YDistance += 5;
      $('#paddle2').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle2YDistance)
    } else {
      paddle2YDistance += 0
      $('#paddle2').position().top = frameHeight - framePadding - paddleHeight
    }
  }
}


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
  // below 2 lines provide new sprite with a random speed, direction and angle (currently: 90 deg)
	this.xSpeed = Math.round(Math.random() * 7 + 4) * randomDir()
	this.ySpeed = Math.round(Math.random() * 7 + 4) * randomDir()
	// random spritesheet frame
	this.frame(spriteCount)
	// put it into the game window
	this.parent.appendChild(this.element)
}

// deletes sprite once it exits frameWidth
function destroySprite () {
  if (!this) { // check that it's refering to the item created
    return
  } else {
    this.parent.removeChild(this.element)
  }
}

// Spritesheet specs: all sprite frames stored in this spritesheet.
var spritesheetWidth = 77;
var spritesheetHeight = 76;
var spritesheetFrameWidth = 25.6;
var spritesheetFrameHeight = 25.3;
var spritesheetXFrames = spritesheetWidth / spritesheetFrameWidth
var spritesheetYFrames = spritesheetHeight / spritesheetFrameHeight
var spritesheetFrames = spritesheetXFrames * spritesheetYFrames;

function changeSpriteFrame(num) { //frames of spritesheet are cycled through with below formula based on spriteCount
	if (!this) {
    return;
  } else {
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
    } //bounce upon contact with paddle 1
    if ((sprites[i].x > $('#paddle1').position().left)) {
      if ((sprites[i].x < $('#paddle1').position().left + paddleWidth)) { // to prevent sprite from getting trapped between frame and paddle1
        if (sprites[i].y > $('#paddle1').position().top - framePadding) { // a little height so that ball can bounce at end of paddle
          if (sprites[i].y < ($('#paddle1').position().top + paddleHeight) + framePadding) {
            sprites[i].ySpeed = sprites[i].ySpeed
            sprites[i].xSpeed = -1 * sprites[i].xSpeed
          }
        }
      }
    } // bounce upon contact with paddle 2
    if (sprites[i].x > ($('#paddle2').position().left - spritesheetFrameWidth)) {
      if (sprites[i].x < $('#paddle2').position().left - spritesheetFrameWidth + paddleWidth) {
        if (sprites[i].y > $('#paddle2').position().top - framePadding) {
          if (sprites[i].y < ($('#paddle2').position().top + paddleHeight + framePadding)) {
            sprites[i].ySpeed = sprites[i].ySpeed
            sprites[i].xSpeed = -1 * sprites[i].xSpeed
          }
        }
      }
    } // if sprite > +/- frameWidth
    if (sprites[i].x <= 0) { // Player 2 scores!
      console.log(i);
      sprites[spriteCount - 1].destroy()
      spriteCount--
      // if (spriteCount === 0) { // rAF stop only when spriteCount = 0
      //   window.cancelAnimationFrame(animationloop)
      //   areThereSprites = false
      // }
      p2score++
      $('#p3').text('Player 2 ' + p2score)
      isGameOver()
      console.log('sprite left' + spriteCount)
      wasSpaceBarPressed = false
      return
    }
    if (sprites[i].x >= frameWidth) { // Player 1 scores!
      sprites[spriteCount - 1].destroy()
      spriteCount--
      // if (spriteCount === 0) {
      //   window.cancelAnimationFrame(animationloop)
      //   areThereSprites = false
      // }
      p1score++
      $('#p2').text('Player 1: ' + p1score)
      isGameOver()
      console.log('sprite left' + spriteCount)
      wasSpaceBarPressed = false
      return
    } else {
      sprites[i].reposition()
    }
  }
}

function animate () {
  whatKey()
  animationloop = window.requestAnimationFrame(animate)
  areThereSprites = true
  animateSprites()
}

function isGameOver() { // updates message board... this is hard coded ...
  if ((p1score < 5) && (p2score < 5)) {
    return false
  } if (p1score || p2score === 5 ) {
      if (p1score === 5) {
        $('#p1').text('Player 1 wins level ' + level + ' round!')
        $('#p2').text('...')
        $('#p3').text('Time for some coffee Player 2')
      }
      if (p2score === 5) {
        $('#p1').text('Player 2 wins level ' + level + ' round!')
        $('#p2').text('...')
        $('#p3').text('Time for some coffee Player 1')
      }
    p1score = 0
    p2score = 0
    level++
    newlevel()
    wasSpaceBarPressed = false
    $('#p1').text('Press spacebar to continue to level ' + level + '!')
    return true
  }
}

function newlevel () {
  if (level === 1) {
    return
  }
  if (level === 2) {
    $('#paddle1').css('height',150)
    $('#paddle2').css('height',150)
    paddleHeight = parseInt($('#paddle1').css('height'))
    return
  }
}

function reset () {
  // if (isGameOver === true) { -> no need for this unless you're planning to launch multiple balls during game play...
  //  wasSpaceBarPressed = true
  //  return
  // } else {}
    $('#p1').text('Level: '+ level)
    $('#p2').text('Player 1: ' + p1score)
    $('#p3').text('Player 2: ' + p2score)
    sprites[spriteCount] = new SpriteCreate()
    spriteCount++
    console.log('number of sprite added:' + spriteCount)
    if (areThereSprites === false) { // this starts rAF
      animate()
    }
    if (areThereSprites === true) { // prevents multiple rAF calls with creation of new sprites
      ;
    }
}

// other nifty options for other levels...  utilise rAF which is already turned on anyway.
function maybeAddSprite () {
  if (randomizer() > 8) {
    sprites[spriteCount] = new SpriteCreate() // reset() should work here...
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
//     if ((this.y > paddle1YDistance) && (this.y < (paddle1YDistance + paddleHeight))) {
//       return true
//       console.log('paddleY contact range: ' + paddle1YDistance + ' - ' + (paddle1YDistance - paddleHeight));
//       console.log('ball contact coordinates: ' + this.x + ', ' + this.y);
//     }
//     console.log('paddle1 no collision');
//   return false
//   }
// }

// testing variables for engineering
// this.xSpeed = Math.round(Math.random() * 2 +1) * -1
// this.ySpeed = Math.round(Math.random() * 2 ) * randomDir()



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
