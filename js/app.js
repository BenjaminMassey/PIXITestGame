// Setup app
var appWidth = 1200;
var appHeight = 600;
var app = new PIXI.Application(appWidth, appHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var globalTimer = 0; // Updated by 1 every frame (runs at 60 fps)
var running = true;
var done = false;
var enemyCount = Math.round(Math.random() * 10) + 10;

// Setup our sprites from images
var hero = PIXI.Sprite.fromImage('content/hero.png');
var enemies = [];
for (var i = 0; i < enemyCount; i++) {
	enemies[i] = PIXI.Sprite.fromImage('content/enemy.png');
}

// Center the sprites' anchor points
hero.anchor.set(0.5);
for (var i = 0; i < enemies.length; i++) {
	enemies[i].anchor.set(0.5);
}

// Setup the sizes of our sprites
hero.scale.x = 0.40;
hero.scale.y = 0.40;
for (var i = 0; i < enemies.length; i++) {
	enemies[i].scale.x = 0.075;
	enemies[i].scale.y = 0.075;
}

// Start hero at center of the screen
hero.x = app.screen.width / 2;
hero.y = app.screen.height / 2;

// Start the enemies around the screen
var halfpoint = Math.round(enemies.length / 2);
for (var i = 0; i < enemies.length; i++) {
	// Right half
	if (i < halfpoint) {
		enemies[i].x = app.screen.width - 0;
		enemies[i].y = 100 * i;
	}
	// Left Half
	else {
		enemies[i].x = 0;
		enemies[i].y = 100 * (i - halfpoint);
	}
}

// Add our sprites to the screen
app.stage.addChild(hero);
for (var i = 0; i < enemies.length; i++) {
	app.stage.addChild(enemies[i]);
}

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);
var up_key = keyboard(38);
var right_key = keyboard(39);
var down_key = keyboard(40);
var a_key = keyboard(65);

// Setup values for our hero
hero.facingRight = true;
hero.firing = false;
// Setup values for our fireball
var fireball = {}; // Instantiate it
fireball.facingRight = true;
//Setup values for our enemies
for (var i = 0; i < enemies.length; i++) {
	enemies[i].id = i;
	enemies[i].dead = false;
}

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		// Movement left
		if (left_key.isDown){
			hero.x -= 5;
			hero.scale.x = Math.abs(hero.scale.x) * -1;
			hero.facingRight = false;
		}
		// Movement up
		if (up_key.isDown) {
			hero.y -= 5;
		}
		// Movement right
		if (right_key.isDown) {
			hero.x += 5;
			hero.scale.x = Math.abs(hero.scale.x);
			hero.facingRight = true;
		}
		// Movement down
		if (down_key.isDown) {
			hero.y += 5;
		}
		// Shoot a fireball PogChamp
		if (a_key.isDown) {
			if (!hero.firing){
				hero.firing = true;
				fireball = PIXI.Sprite.fromImage('content/fireball.png');
				app.stage.addChild(fireball);
				fireball.scale.x = 0.2;
				fireball.scale.y = 0.2;
				fireball.x = hero.x;
				fireball.y = hero.y;
				if (hero.facingRight) {
					fireball.facingRight = true;
				}
				else {
					fireball.facingRight = false;
				}
			}
		}
		// Handle fireball
		if (hero.firing) {
			// Move fireball
			if (fireball.facingRight) {
				fireball.x += 8;
			}
			else {
				fireball.x -= 8;
			}
			// Hit an enemy!
			for (var i = 0; i < enemies.length; i++) {
				if (!enemies[i].dead) { // Could have already destroyed him
					if (hitTestRectangle(fireball, enemies[i])) { // Collision! (See hitdetection.js)
						enemies[i].dead = true;
						enemies[i].destroy();
						app.stage.removeChild(fireball);
						hero.firing = false;
					}
				}
			}
			// Handle it hitting the edge of the map
			if (fireball.x >= appWidth || fireball.x <= 0) {
				app.stage.removeChild(fireball);
				hero.firing = false;
			}
		}
		// Handle enemy movement
		for (var i = 0; i < enemies.length; i++) {
			if (!enemies[i].dead) {
				var movement = Math.round(Math.random() * 3);
				if (hero.x < enemies[i].x) {
					enemies[i].x -= movement;
					var overlap = false;
					for (var j = 0; j < enemies.length; j++) {
						if(!enemies[j].dead) {
							if (hitTestRectangle(enemies[i], enemies[j]) && enemies[i].id != enemies[j].id) {
								overlap = true;
							}
						}
					}
					if (overlap) {
						enemies[i].x += movement;
					}
				}
				if (hero.x > enemies[i].x) {
					enemies[i].x += movement;
					var overlap = false;
					for (var j = 0; j < enemies.length; j++) {
						if(!enemies[j].dead) {
							if (hitTestRectangle(enemies[i], enemies[j]) && enemies[i].id != enemies[j].id) {
								overlap = true;
							}
						}
					}
					if (overlap) {
						enemies[i].x -= movement;
					}
				}
				if (hero.y < enemies[i].y) {
					enemies[i].y -= movement;
					var overlap = false;
					for (var j = 0; j < enemies.length; j++) {
						if(!enemies[j].dead) {
							if (hitTestRectangle(enemies[i], enemies[j]) && enemies[i].id != enemies[j].id) {
								overlap = true;
							}
						}
					}
					if (overlap) {
						enemies[i].y += movement;
					}
				}
				if (hero.y > enemies[i].y) {
					enemies[i].y += movement;
					var overlap = false;
					for (var j = 0; j < enemies.length; j++) {
						if(!enemies[j].dead) {
							if (hitTestRectangle(enemies[i], enemies[j]) && enemies[i].id != enemies[j].id) {
								overlap = true;
							}
						}
					}
					if (overlap) {
						enemies[i].y -= movement;
					}
				}
			}
		}
		// Handle hero dying
		for (var i = 0; i < enemies.length; i++) {
			if (!enemies[i].dead) { // Only wanna check when there is enemy
				if (hitTestRectangle(hero, enemies[i])) { // Collision! (See hitdetection.js)
					if (hero.firing) {
						fireball.destroy();
					}
					for (var i = 0; i < enemies.length; i++) {
						enemies[i].destroy();
					}
					hero.destroy();
					var RIP = new PIXI.Text("GAME OVER");
					RIP.anchor.set(0.5);
					RIP.x = app.screen.width / 2;
					RIP.y = app.screen.height / 2;
					app.stage.addChild(RIP);
					running = false;
				}
			}
		}
		// Handle winning
		var toggleWin = true;
		for (var i = 0; i < enemies.length; i++) {
			if (!enemies[i].dead) {
				toggleWin = false;
			}
		}
		if (toggleWin && !done) {
			hero.setTexture(new PIXI.Texture.fromImage("content/win.png"));
			hero.scale.x = 0.05;
			hero.scale.y = 0.05;
			var yay = new PIXI.Text("You Won!");
			yay.anchor.set(0.5);
			yay.x = app.screen.width / 2;
			yay.y = app.screen.height / 2;
			app.stage.addChild(yay);
			done = true;
		}
		// Simple global timer of frame count in case needed
		globalTimer++;
	}
});
