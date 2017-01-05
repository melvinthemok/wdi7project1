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

var paddle1YDistance = 0  // paddle 1 y distance moved
var paddle2YDistance = 0 // paddle 2 y distance moved
var p1score = 0
var p2score = 0

var wasSpaceBarPressed = false
var areThereSprites = false
var animationloop // rAF global var
var sprites = [] // sprite catridge...
var spriteCount = 0
console.log('Sprite count at start of game: ' + spriteCount)
// paddle angular response --> specific check when ball enters range of paddle length
var paddleSegment = [0, 0, 0, 0, 0 ,0, 0, 0] //
var paddleSegmentHeight = Math.round(paddleHeight/(paddleSegment.length))  // length of each segment
console.log(paddleSegmentHeight);


// dynamic net position
$('#net').css({'top': 0 , 'left': (frameWidth / 2 + framePadding)})
$('#paddle1').css({'top': (frameHeight/2 - paddleHeight/2 - framePadding), 'left': framePadding}) // sets y = 0 to middle of frameHeight
$('#paddle2').css({'top': (frameHeight/2 - paddleHeight/2 - framePadding), 'left': frameWidth - framePadding - paddleWidth})

//paddle controls, condition, start button
$(document).keydown(function(e) {
  var keycode = e.which
  if (keycode === 87) { // w key
    paddle1YDistance -= 30
    if ($('#paddle1').position().top > framePadding) {
      $('#paddle1').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle1YDistance)
    }
    else {
      paddle1YDistance -= 0
      $('#paddle1').position().top = framePadding
    }
  } else if (keycode === 83) { // s key
    paddle1YDistance += 30;
    if ($('#paddle1').position().top < frameHeight - framePadding - paddleHeight) {
      $('#paddle1').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle1YDistance)
    } else {
      paddle1YDistance += 0
      $('#paddle1').position().top = frameHeight - framePadding - paddleHeight
    }
  } else if (keycode === 38) { // up arrow key
    paddle2YDistance -= 30;
    if ($('#paddle2').position().top > framePadding) {
      $('#paddle2').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle2YDistance)
    } else {
      paddle2YDistance -= 0
      $('#paddle1').position().top = framePadding
    }
  } else if (keycode === 40) { // down arrow key
    paddle2YDistance += 30;
    if ($('#paddle2').position().top < frameHeight - framePadding - paddleHeight) {
      $('#paddle2').css('top', frameHeight/2 - paddleHeight/2 - framePadding + paddle2YDistance)
    } else {
      paddle2YDistance += 0
      $('#paddle2').position().top = frameHeight - framePadding - paddleHeight
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
  // this.xSpeed = Math.round(Math.random() * 4+4) * -1
  // this.ySpeed = Math.round(Math.random() * 4 ) * randomDir()
  // below 2 lines provide new sprite with a random speed, direction and angle (currently: 90 deg)
	this.xSpeed = Math.round(Math.random() * 5 + 2) * randomDir()
	this.ySpeed = Math.round(Math.random() * 5 + 2) * randomDir()
	// random spritesheet frame
	this.frame(spriteCount)
	// put it into the game window
	this.parent.appendChild(this.element)
}

// Spritesheet specs: all sprite frames stored in this spritesheet.
var spritesheetWidth = 77;
var spritesheetHeight = 76;
var spritesheetFrameWidth = 25.6;
var spritesheetFrameHeight = 25.3;
var spritesheetXFrames = spritesheetWidth / spritesheetFrameWidth
var spritesheetYFrames = spritesheetHeight / spritesheetFrameHeight
var spritesheetFrames = spritesheetXFrames * spritesheetYFrames;

function changeSpriteFrame(num) {
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
  sprites.forEach(function (value, index) {
    sprites[index].x += sprites[index].xSpeed // sprite[i].x = x + xSpeed
    sprites[index].y += sprites[index].ySpeed
    // bounce at top and bottom
    if ((sprites[index].y <= 0) || (sprites[index].y >= (frameHeight - spritesheetFrameHeight))) {
  		sprites[index].ySpeed = -1 * sprites[index].ySpeed
    } //bounce upon contact with paddle 1
   if ((sprites[index].x > $('#paddle1').position().left) && (sprites[index].x < $('#paddle1').position().left + paddleWidth)) {    // to prevent sprite from getting trapped between frame and paddle1
       paddleSegment.forEach(function (something, numba) { // y coordinate range of each paddleSegment
         if (sprites[index].y > ($('#paddle1').position().top + (paddleSegmentHeight * numba))) {
           if (sprites[index].y < ($('#paddle1').position().top + (paddleSegmentHeight * (numba+1)))) {
             var z = numba
             console.log(z);
             switch (z) {
               case 0  : // 0 and 7 are most unstable... rest seems to be okay.
                 console.log('15 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 console.log(sprites[index].xSpeed)
                 sprites[index].xSpeed = -6 * sprites[index].xSpeed
                 console.log(sprites[index].xSpeed)
                 break;
               case 1 :
                 console.log('30 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 sprites[index].xSpeed = -3 * sprites[index].xSpeed
                 break;
               case 2 :
                 console.log('60 deg bounce ');
                 sprites[index].ySpeed = 3 * sprites[index].ySpeed
                 sprites[index].xSpeed = -1 * sprites[index].xSpeed
                 break;
               case 3 :
                 console.log('90 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 sprites[index].xSpeed = -1 * sprites[index].xSpeed
                 break;
               case 7:
                 console.log('15 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 sprites[index].xSpeed = -6 * sprites[index].xSpeed
                 break;
               case 6:
                 console.log('30 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 sprites[index].xSpeed = -3 * sprites[index].xSpeed
                 break;
               case 5:
                 console.log('60 deg bounce ');
                 sprites[index].ySpeed = 3 * sprites[index].ySpeed
                 sprites[index].xSpeed = -1 * sprites[index].xSpeed
                 break;
               case 4:
                 console.log('90 deg bounce ');
                 sprites[index].ySpeed = sprites[index].ySpeed
                 sprites[index].xSpeed = -1 * sprites[index].xSpeed
                 break;
             }
           }
         }
       })
     }// bounce upon contact with paddle 2
   if (sprites[index].x > ($('#paddle2').position().left - spritesheetFrameWidth) && (sprites[index].x < $('#paddle2').position().left - spritesheetFrameWidth + paddleWidth)) { // to prevent sprite from getting trapped between frame and paddle1...
       if (sprites[index].y > $('#paddle2').position().top) {
         if (sprites[index].y < ($('#paddle2').position().top + paddleHeight)) {
           sprites[index].ySpeed = sprites[index].ySpeed
           sprites[index].xSpeed = -1 * sprites[index].xSpeed
         }
       }
    } // if sprite > +/- frameWidth
   if (sprites[index].x <= 0) { // Player 2 scores!
    //  spriteDelete()
     sprites[spriteCount-1].destroy()
     spriteCount--
     delete sprites[index]
     // if (spriteCount === 0) { // rAF stop only when spriteCount = 0
     //   window.cancelAnimationFrame(animationloop)
     //   areThereSprites = false
     // }
     p2score++
     $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
     isGameOver()
     console.log('sprite left' + spriteCount)
     wasSpaceBarPressed = false
   }
   if (sprites[index].x >= frameWidth) { // Player 1 scores!
    //  spriteDelete()
     sprites[spriteCount-1].destroy()
     spriteCount--
     delete sprites[index]
     // if (spriteCount === 0) {
     //   window.cancelAnimationFrame(animationloop)
     //   areThereSprites = false
     // }
     p1score++
     $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
     isGameOver()
     console.log('sprite left' + spriteCount)
     wasSpaceBarPressed = false
   } else {
     sprites[index].reposition()
   }
 })
}






// deletes sprite once it exits frameWidth
function destroySprite () {
  if (!this) { // check that object exists
    return
  } else {
    // this.parent.removeChild(this.element)
    $(this.parent).remove(this.element)
  }
}


// function animateSprites () {
//   for (var i = 0; i < spriteCount; i++) {
//     sprites[i].x += sprites[i].xSpeed // sprite[i].x = x + xSpeed
//     sprites[i].y += sprites[i].ySpeed
// 	  // bounce at top and bottom
//     if ((sprites[i].y <= 0) || (sprites[i].y >= (frameHeight - spritesheetFrameHeight))) {
//   		sprites[i].ySpeed = -1 * sprites[i].ySpeed
//     } //bounce upon contact with paddle 1
//     // to prevent sprite from getting trapped between frame and paddle1
//     if ((sprites[i].x > $('#paddle1').position().left) && (sprites[i].x < $('#paddle1').position().left + paddleWidth)) {
//         if ((sprites[i].y >= ($('#paddle1').position().top - framePadding) && (sprites[i].y < ($('#paddle1').position().top + paddleSegmentHeight*1)) ||
//         ((sprites[i].y >= ($('#paddle1').position().top - (paddleSegmentHeight * 7))) && (sprites[i].y <= ($('#paddle1').position().top + paddleHeight + framePadding))))) {
//           console.log('top/bottom paddle detect');
//           sprites[i].ySpeed = sprites[i].ySpeed
//           sprites[i].xSpeed = -1 * sprites[i].xSpeed
//         }
//         // if ((sprites[i].y >= ($('#paddle1').position().top - paddleSegmentHeight * 1) && (sprites[i].y < ($('#paddle1').position().top + paddleSegmentHeight * 2)) ||
//         //   ((sprites[i].y >= ($('#paddle1').position().top - (paddleSegmentHeight * 6))) && (sprites[i].y < ($('#paddle1').position().top + paddleHeight*7))))) {
//         //     console.log('30 deg areas...');
//         //     sprites[i].ySpeed = sprites[i].ySpeed
//         //     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//         // }
//         // if ((sprites[i].y >= ($('#paddle1').position().top - paddleSegmentHeight * 2) && (sprites[i].y < ($('#paddle1').position().top + paddleSegmentHeight * 3)) ||
//         //   ((sprites[i].y >= ($('#paddle1').position().top - (paddleSegmentHeight * 5))) && (sprites[i].y < ($('#paddle1').position().top + paddleHeight*6))))) {
//         //     console.log('60 deg areas...');
//         //     sprites[i].ySpeed = sprites[i].ySpeed
//         //     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//         // }
//         // if ((sprites[i].y >= ($('#paddle1').position().top - paddleSegmentHeight * 3) && (sprites[i].y < ($('#paddle1').position().top + paddleSegmentHeight * 5)))) {
//         //     console.log('90 deg areas...');
//         //     sprites[i].ySpeed = sprites[i].ySpeed
//         //     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//         //   }
//         paddleSegment.forEach(function (value, index) { // y coordinate range of each paddleSegment
//             if ((sprites[i].y >= ($('#paddle1').position().top + (paddleSegmentHeight * index))) && (sprites[i].y < ($('#paddle1').position().top + (paddleSegmentHeight * (index+1))))) {
//                 var z = index // index 0 and 7 separated as extra height provided to account for spriteHeight.
//                 console.log(z);
//                 switch (z) {
//                   case 1:
//                     console.log('30 deg bounce ');
//                     sprites[i].ySpeed = sprites[i].ySpeed
//                     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                     break;
//                   case 6:
//                       console.log('30 deg bounce ');
//                       sprites[i].ySpeed = sprites[i].ySpeed
//                       sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                       break;
//                   case 2:
//                     console.log('60 deg bounce ');
//                     sprites[i].ySpeed =  sprites[i].ySpeed
//                     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                     break;
//                   case 5:
//                       console.log('60 deg bounce ');
//                       sprites[i].ySpeed =  sprites[i].ySpeed
//                       sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                       break;
//                   case 3:
//                     console.log('90 deg bounce ');
//                     sprites[i].ySpeed = sprites[i].ySpeed
//                     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                     break;
//                   case 4:
//                     console.log('90 deg bounce ');
//                     sprites[i].ySpeed = sprites[i].ySpeed
//                     sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                     break;
//                   // case 0 || 7:
//                   // break;
//                 }
//               }
//             // }
//           })
//         }
//     // bounce upon contact with paddle 2
//     if (sprites[i].x > ($('#paddle2').position().left - spritesheetFrameWidth)) {
//       if (sprites[i].x < $('#paddle2').position().left - spritesheetFrameWidth + paddleWidth) { // to prevent sprite from getting trapped between frame and paddle1...
//         paddleSegment.forEach(function (value, index) { // y coordinate range of each paddleSegment
//         if (sprites[i].y >= ($('#paddle2').position().top + (paddleSegmentHeight * index) - spritesheetFrameHeight/2)) {
//         if (sprites[i].y <= ($('#paddle2').position().top + (paddleSegmentHeight * (index+1) + spritesheetFrameHeight/2))) {
//             var z = index
//             console.log(z);
//             switch (z) {
//               case 0 : // 0 and 7 are most unstable... rest seems to be okay.
//                 console.log('15 deg bounce ');
//                 sprites[i].ySpeed = sprites[i].ySpeed
//                 sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                 break;
//               case 7 : // 0 and 7 are most unstable... rest seems to be okay.
//                   console.log('15 deg bounce ');
//                   sprites[i].ySpeed = sprites[i].ySpeed
//                   sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                   break;
//               case 1:
//                 console.log('30 deg bounce ');
//                 sprites[i].ySpeed = sprites[i].ySpeed
//                 sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                 break;
//               case 6:
//                   console.log('30 deg bounce ');
//                   sprites[i].ySpeed = sprites[i].ySpeed
//                   sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                   break;
//               case 2:
//                 console.log('60 deg bounce ');
//                 sprites[i].ySpeed =  sprites[i].ySpeed
//                 sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                 break;
//               case 5:
//                   console.log('60 deg bounce ');
//                   sprites[i].ySpeed =  sprites[i].ySpeed
//                   sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                   break;
//               case 3:
//                 console.log('90 deg bounce ');
//                 sprites[i].ySpeed = sprites[i].ySpeed
//                 sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                 break;
//               case 4:
//                 console.log('90 deg bounce ');
//                 sprites[i].ySpeed = sprites[i].ySpeed
//                 sprites[i].xSpeed = -1 * sprites[i].xSpeed
//                 break;
//             }
//           }
//         }
//       }) // if sprite > +/- frameWidth
//     }
//   }
//     if (sprites[i].x <= 0) { // Player 2 scores!
//       i = spriteCount - 1
//       sprites[i].destroy()
//       spriteCount-=1
//       // if (spriteCount === 0) { // rAF stop only when spriteCount = 0
//       //   window.cancelAnimationFrame(animationloop)
//       //   areThereSprites = false
//       // }
//       p2score++
//       $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
//       isGameOver()
//       console.log('sprite left' + spriteCount)
//       wasSpaceBarPressed = false
//       return
//     }
//     if (sprites[i].x >= frameWidth) { // Player 1 scores!
//       i = spriteCount - 1
//       sprites[i].destroy()
//       spriteCount-=1
//       // if (spriteCount === 0) {
//       //   window.cancelAnimationFrame(animationloop)
//       //   areThereSprites = false
//       // }
//       p1score++
//       $('#gamestatus').text('P1: ' + p1score + '  P2: ' + p2score)
//       isGameOver()
//       console.log('sprite left' + spriteCount)
//       wasSpaceBarPressed = false
//       return
//     } else {
//       sprites[i].reposition()
//     }
//   }
// }



function animate () {
  // checkFPS() --> you may not need this anymore...
  animationloop = window.requestAnimationFrame(animate)
  areThereSprites = true
  animateSprites()
}

function isGameOver() { // updates message board... this is hard coded ...
  if (p1score === 5 || p2score === 5) {
    // window.cancelAnimationFrame(animationloop)
    // areThereSprites = false
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
      // animateSprites()
    }
  }
}

// LEVEL 2 OF GAME when either player wins and continues to play, call this function. SetInterval (maybeAddSprite, every 20 secs? )
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


// function changeSpriteFrame(num) {
// 	if (!this) {
//     return;
//   } else {
//     // $('.sprite').css('background-position', ' (-1 * (num % spritesheetXFrames) * spritesheetFrameWidth) + 'px ' +
// 		//(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames))
// 		// * spritesheetFrameHeight + 'px'')
// 	this.style.backgroundPosition =
// 		(-1 * (num % spritesheetXFrames) * spritesheetFrameWidth) + 'px ' +
// 		(-1 * (Math.round(num / spritesheetXFrames) % spritesheetYFrames) * spritesheetFrameHeight) + 'px';
//   }
// }

// timer... to control FPS but i feel like you don't need this for now...
// var currentTimestamp = 0
// var previousTimestamp = Date.now()
// var framesThisSecond = 0 // may not need this variable as it's for status update
// var elapsedMs = 0
// var currentFPS = 0
// var targetFramerate = 60
