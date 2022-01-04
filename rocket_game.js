PIXI.utils.sayHello();



// create empty sprite array
spriteArray = [];
animatedSpriteArray = [];

let explosionImages = ["enemyExplosion/explode_01.png","enemyExplosion/explode_02.png",
"enemyExplosion/explode_03.png","enemyExplosion/explode_04.png",
"enemyExplosion/explode_05.png","enemyExplosion/explode_06.png",
"enemyExplosion/explode_07.png","enemyExplosion/explode_08.png"];
let textureArray = [];

for (let i=0; i < 8; i++)
{
     let texture = PIXI.Texture.from(explosionImages[i]);
     textureArray.push(texture);
};

// powerup
powerup1 = PIXI.Sprite.from('powerup1.png');

var powerupTimer = 50;
var powerupCutoff = 0;

// speed of enemies
const vArray = [];
var vMax = 10; var vMin = 5;
// distance from enemy required for death
var collisionDistance = 50;
// factor to dampen score
var scoreDampFactor = 10.0;
// time variable
var elapsed = 0.0;
// time for adding new sprite
var spriteTimer = 10;
// variable to stop multiple sprites being added at once
var spriteCutoff = 0;

var ended = false;
var score = 0;

// functions
function bombardPlayer(e)
{
  let pos = e.data.global;
  mousePosition.x = pos.x;
  mousePosition.y = pos.y;
}


// function for adding an enemy
function addEnemy(spriteArray_, vArray_, offset_)
{
    // enemies are randomly distributed around the perimeter
    var perimeter = 2 * window.innerWidth + 2*window.innerHeight;
    // pick a random point along the perimeter
    var spawnPoint = Math.random() * perimeter;

    // determine what the x and y coordinates of the enemey should be based
    // on that random point around the perimeter and use an offset so they
    // appear offscreen
    if (spawnPoint < window.innerWidth)
    {
      spriteX = spawnPoint;
      spriteY = -offset_;
    }
    else if (spawnPoint >= window.innerWidth && spawnPoint < window.innerWidth + window.innerHeight)
    {
      spriteX = window.innerWidth + offset_;
      spriteY = spawnPoint - window.innerWidth;
    }
    else if (spawnPoint >= window.innerWidth + window.innerHeight && spawnPoint < 2 * window.innerWidth + window.innerHeight)
    {
      spriteX = spawnPoint - window.innerHeight - window.innerWidth;
      spriteY = window.innerHeight + offset_;
    }
    else if (spawnPoint >=  2 * window.innerWidth + window.innerHeight)
    {
      spriteX = -offset_;
      spriteY = spawnPoint -  window.innerHeight - 2*window.innerWidth;
    }

    // add the enemy to the sprite array
    spriteArray_.push(PIXI.Sprite.from('enemy.png'));
    spriteArray_[spriteArray_.length - 1].x = spriteX;
    spriteArray_[spriteArray_.length - 1].y = spriteY;
    spriteArray_[spriteArray_.length - 1].anchor.x = 0.5;
    spriteArray_[spriteArray_.length - 1].anchor.y = 0.5;

    // create a random velocity for the new enemy and add to array
    vArray_.push(Math.random() * (vMax - vMin) + vMin);

}

function updatePositions(enemySprite_, velocity_, dt_)
{

  // find the distance between the mouse and the enemy
  var r_x = mousePosition.x - enemySprite_.x;
  var r_y = mousePosition.y - enemySprite_.y;

  // find the sine and cosine of the direction the enemy is facing
  dX = Math.cos(enemySprite_.rotation);
  dY = Math.sin(enemySprite_.rotation);

  // find which direction it needs to rotate in order to be pointing the mouse
  // (sign of the z-component of the cross-product between position vector and
  // direction vector)
  spinDir = Math.sign(-r_x*dX - r_y*dY);
  // update rotation
  enemySprite_.rotation -= spinDir * 0.01 * velocity_;
  // update position
  enemySprite_.x += velocity_*dY*dt_;
  enemySprite_.y += velocity_*(-dX)*dt_;

}

function checkCollisions(enemySprite_, collisionDistance_)
{
  // find the distance between the mouse and the enemy
  var r_x = mousePosition.x - enemySprite_.x;
  var r_y = mousePosition.y - enemySprite_.y;

  if (r_x*r_x + r_y*r_y < collisionDistance_)
  {
    // create an animated sprite for the explosion
    let animatedSprite = new PIXI.AnimatedSprite(textureArray);
    animatedSprite.anchor.x = 0.5;
    animatedSprite.anchor.y = 0.5;
    // set speed, start playback and add it to the stage
    animatedSprite.animationSpeed = 0.5;
    animatedSprite.x = enemySprite_.x;
    animatedSprite.y = enemySprite_.y;
    animatedSprite.rotation = enemySprite_.rotation;
    animatedSprite.loop = false;
    // add the sprite
    app.stage.addChild(animatedSprite);
    // hide the unexploded enemy
    enemySprite_.alpha = 0.0;
    // end the ticker after the animation has finished
    animatedSprite.onComplete = function()
    {
      animatedSprite.destroy();
      //endGame(score);
      app.ticker.stop();
    }
    animatedSprite.play();

    if (!ended)
    {
      // render the game over and final score text
      const gameOverText = new PIXI.Text('GAME OVER');
      gameOverText.x = window.innerWidth/2.0;
      gameOverText.y = window.innerHeight/2.0;
      gameOverText.anchor.x = 0.5;

      const finalScoreText = new PIXI.Text('final score: ' + score);
      finalScoreText.x = window.innerWidth/2.0;
      finalScoreText.y = window.innerHeight/2.0;
      finalScoreText.anchor.x = 0.5;
      finalScoreText.anchor.y = -1.0;

      app.stage.addChild(gameOverText);
      app.stage.addChild(finalScoreText);
      // change value of ended to true
      ended = true;

    }

  }

}



// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window , backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

// render score
const scoreText = new PIXI.Text('score: ' + Math.round(elapsed/scoreDampFactor));
scoreText.x = 100.0;
scoreText.y = 100.0;
scoreText.anchor.x = 0;
scoreText.anchor.y = 0;
app.stage.addChild(scoreText);

app.stage.interactive = true;
app.stage.on("pointermove", bombardPlayer);

mousePosition = new PIXI.Point;



// ticker to update app
app.ticker.add((delta) => {

  // update time
  elapsed += delta;
  // calculate and update score
  score = Math.round(elapsed/scoreDampFactor);
  scoreText.text = 'score: ' + score;


  // add a new sprite
  if (score >= spriteCutoff && score % spriteTimer == 0)
  {
      addEnemy(spriteArray, vArray, 50);
      app.stage.addChild(spriteArray[spriteArray.length - 1]);
      spriteCutoff += spriteTimer;
  }

  // loop over sprites and update positions
  for (let i = 0; i < spriteArray.length; i++)
  {
    updatePositions(spriteArray[i], vArray[i], delta);
    checkCollisions(spriteArray[i], collisionDistance);

  }

  // CODE FOR POWERUPS
  // eventually rework into a nicer function, maybe if I decided to add
  // additional powerups or other functionality into the game

  // add a powerup every n points
  if (score > powerupCutoff && score % powerupTimer == 0)
  {
    console.log('POWERUP');
    // poisition it somewhere in the window
    powerup1.x = Math.random()*(window.innerWidth - 16) + 16;
    powerup1.y = Math.random()*(window.innerHeight - 16) + 16;
    app.stage.addChild(powerup1);
    // add the timer to the cutoff so the next powerup is added at the right time
    powerupCutoff += powerupTimer;
  }

  // if the powerup is triggered before it disapears
  else if(score % powerupTimer > 0 && score % powerupTimer < 10 && (mousePosition.x-powerup1.x)**2 + (mousePosition.y-powerup1.y)**2 < collisionDistance**2)
  {
    console.log('POWERUP TRIGGERED');
    app.stage.removeChild(powerup1);
    // delete ALL enemy sprites
    for (let i = 0; i < spriteArray.length; i++)
    {
      animatedSpriteArray.push(new PIXI.AnimatedSprite(textureArray));
      animatedSpriteArray[i].anchor.x = 0.5;
      animatedSpriteArray[i].anchor.y = 0.5;
      // set speed, start playback and add it to the stage
      animatedSpriteArray[i].animationSpeed = 0.5;
      animatedSpriteArray[i].x = spriteArray[i].x;
      animatedSpriteArray[i].y = spriteArray[i].y;
      animatedSpriteArray[i].rotation = spriteArray[i].rotation;
      animatedSpriteArray[i].loop = false;
      // create an animated sprite
      app.stage.addChild(animatedSpriteArray[i]);
      animatedSpriteArray[i].play();
      spriteArray[i].destroy();
    }
    spriteArray = [];
    animatedSpriteArray = [];
  }
  // if the powerup times out, delete it
  else if (score % powerupTimer == 10)
  {
    app.stage.removeChild(powerup1);
  }


});
