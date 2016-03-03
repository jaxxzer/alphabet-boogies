window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 1000, 700, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render} );
    
    function preload() {
        game.load.audio('shoot', 'assets/shoot.ogg');
        game.load.audio('explosion', 'assets/explosion.ogg');
        game.load.image('bed', 'assets/dude.png');
        game.load.image('gun', 'assets/laser_gun.png');
        game.load.image('room', 'assets/Bedroom.jpg');
        game.load.image('laser', 'assets/laser.gif');
        game.load.image('nightlight', 'assets/lgBlackGradientTransparentBG.png');
        game.load.image('bed_awake', 'assets/dude_wokeup.png' )
        game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);

        // Load all our alphabet boogie monsters
        for(var i = 65; i < 91; i++) {
            if( i < 75 ) {
                game.load.image(String.fromCharCode(i), 'assets/alphabet/monster_000' + (i - 65) + '_' + String.fromCharCode(i + 32) + '.png');
            } else {
                game.load.image(String.fromCharCode(i), 'assets/alphabet/monster_00' + (i - 65) + '_' + String.fromCharCode(i + 32) + '.png');
            }
        }   
    }
    
    var gun;
    var text;
    var boogies;
    var line;
    var laser;
    
    var state = 0; // Current game state, 0 = not started, 1 = running
    
    // Sound objects
    var shootSound, explosionSound;
    
    var explosions; // Explosion animations
    var graphics; // Not used, but kept for example purposes in future assignments
    
    var bed;
    var nightlight;
    var nightlightScaleY = 1.5;
    
    // The maximum number of letters from the beginning of alphabet that will be spawned
    // ie 1 = only A, 26 = A through Z
    // Change to adjust difficulty
    var maxBoogies = 26;
    
    var score = 0;
    
    function create() {
        
        // Bedroom scene background
        var bedroom = game.add.sprite(0, 0, 'room');
        bedroom.scale.setTo(2.3,2.2);
        bedroom.alpha = 1;
        
        // Child in bed, boogie target
        bed = game.add.sprite(0, game.world.centerY, 'bed');
        bed.scale.setTo(0.5);
        bed.anchor.setTo(0, 0.5);
        
        // Enable Arcade Physics
        game.physics.enable(bed, Phaser.Physics.ARCADE);

        // Setup sounds
        shootSound = game.add.audio('shoot');
        shootSound.addMarker('shoot', 0.0, 1.0);
        shootSound.allowMultiple = true;
        explosionSound = game.add.audio('explosion');
        explosionSound.addMarker('explosion', 0.0, 1.5);
        explosionSound.allowMultiple = true;
        
        // An explosion animation pool
        explosions = game.add.group();
        explosions.createMultiple(26, 'kaboom');
        explosions.forEach(setupBoogie, this);
        
        // Gun
        gun = game.add.sprite(100, game.world.centerY, 'gun');
        gun.scale.setTo(0.07);
        gun.anchor.setTo(1, 0.2);
        
        // Setup keyboard input
        this.game.input.keyboard.onDownCallback = keyboardInputCallback;
        
        // Setup alphabet boogie monsters
        boogies = game.add.group();
        boogies.enableBody = true;
        boogies.physicsBodyType = Phaser.Physics.ARCADE;
        for(var i = 65; i < 91; i++) {
            var boogie = boogies.create(i * 50 -3000, i * 50 - 3000, String.fromCharCode(i));
            boogie.anchor.setTo(0.5, 0.5);
            boogie.keyCode = i; // Simply the ascii value of this letter
            boogie.kill();
        }
        
        // Laser beam shot from the gun
        laser = game.add.sprite(0, 0, 'laser');
        laser.alpha = 0;

        // Some text for score status and balls remaining
        var style = { font: "40px Verdana", fill: "#ffffff", align: "left" };
        text = game.add.text( 120, 15, "", style );
        text.anchor.setTo(0.5, 0.0);
        text.setText("Click to begin!");
        
        // Graphics overlay to dim the entire scene
        // (Not used)
        graphics = game.add.graphics(0, 0);
        graphics.lineStyle(4, 0xffd900, 1);
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, game.world.width, game.world.height);
        graphics.endFill();
        graphics.alpha = 0;
        
        // Gradient from black to transparent overlaid on entire scene
        // Change scale to simulate night light dimming
        nightlight = game.add.sprite(game.world.width, 0, 'nightlight');
        nightlight.anchor.setTo(1, .9);
        nightlight.angle = -90;
        nightlight.scale.setTo(1, nightlightScaleY);
        
        game.input.onDown.add(startGame, this);
    }
    
    function startGame() {
        if(state == 0) { // Only start one event timer
            // Ressurect a new boogie every second
            game.time.events.loop(Phaser.Timer.SECOND, resurrect, this);
            text.setText("Score: " + score);
            state = 1;
        }
    }
    
    // Add explosion animations to the boogies
    function setupBoogie (boogie) {
        boogie.anchor.x = 0.5;
        boogie.anchor.y = 0.5;
        boogie.animations.add('kaboom');
    }

    // Bring a new boogie in to attack
    function resurrect() {
        var boogie;
        
        // Only bring a new boogie in if all available boogies are not yet on the attack
        if(boogies.countLiving() < maxBoogies) {
            // Not at all efficient, but gets the job done for the moment
            do {
                boogie = boogies.getRandom(0, maxBoogies);
            } while(boogie.alive == true);
        }

        if (boogie) {
            boogie.reset(game.world.width, game.world.randomY); // Bring it back to life
            game.physics.arcade.moveToObject(boogie, gun, 60); // Set it loose
        }
    }
    
    // Main game logic, called every time a key is pressed
    function keyboardInputCallback(event) {
        
        // Only perform action for letter keys pressed
        if(event.keyCode >= 65 && event.keyCode <= 90) {
            
            // Get the boogie corresponding to the letter pressed
            var boogie = boogies.iterate('keyCode', event.keyCode, Phaser.Group.RETURN_CHILD);
            
            if (boogie != null && boogie.alive) { // Score, we hit a boogie on the attack
                fire(boogie); // Kill that boogie
                if(nightlightScaleY > 1.55) {
                    nightlightScaleY -= .25; // Push the darkness back
                    nightlight.scale.setTo(1, nightlightScaleY);
                }
                score += 10;
                
            } else if(nightlightScaleY < 4.5) { // Fail, we pressed an incorrect letter
                nightlightScaleY += .25; // The darkness extends towards the bed
                nightlight.scale.setTo(1, nightlightScaleY);
                
                if(score > 0)
                    score -= 10;
            }
            
            text.setText("Score: " + score); // Update score
        }
    }
    
    // Shoot and kill a boogie on the screen
    function fire(sprite) {
        shootSound.play('shoot');
        
        // Position the laser beam
        laser.scale.setTo(1);
        laser.anchor.setTo(15/laser.width,58/laser.height);
        laser.x = gun.x;
        laser.y = gun.y;
        laser.rotation = game.physics.arcade.angleBetween(gun, sprite);
        laser.scale.setTo(game.physics.arcade.distanceBetween(gun, sprite)/(laser.width-40), .5);
        laser.alpha = 0;
        
        // Animate the laser beam
        var tweenIn = game.add.tween(laser).to({ alpha: 1 }, 100, Phaser.Easing.Linear.None, false);
        var tweenOut = game.add.tween(laser).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, false);
        
        tweenIn.chain(tweenOut);
        tweenIn.start();

        sprite.kill(); // Kill  the boogie
        
        //  And create an explosion :)
        var explosion = explosions.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('kaboom', 30, sprite, true);
        explosionSound.play('explosion');
    }
    
    
    function update() {
        // Check if a boogie has made it all the way to the bed
        game.physics.arcade.overlap(bed, boogies, collisionHandler, null, this);
    }
    
    // A boogie made it to the bed
    function collisionHandler(bed, boogie) {
        boogie.kill();
        bed.loadTexture('bed_awake'); // Scare the kid
    }
    
    function render() {

    }
    
    // Returns the angle between two objects
    function get_angle(object1, object2) {
        return Math.atan2(object2.y - object1.y, object2.x - object1.x);
    }
};
