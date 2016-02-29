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
    
    var game = new Phaser.Game( 1000, 800, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render} );
    
    function preload() {
        game.load.audio('shoot', 'assets/shoot.ogg');
        game.load.audio('explosion', 'assets/explosion.ogg');
        game.load.image('gun', 'assets/laser_gun.png');
        game.load.image('laser', 'assets/laser.gif');
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
    var bullets
    var shootSound, explosionSound;
    
    var explosions;
    function create() {
        shootSound = game.add.audio('shoot');
        shootSound.addMarker('shoot', 0.0, 1.0);
        shootSound.allowMultiple = true;
        explosionSound = game.add.audio('explosion');
        explosionSound.addMarker('explosion', 0.0, 1.5);
        explosionSound.allowMultiple = true;
        
                //  An explosion pool
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(setupInvader, this);
        
        gun = game.add.sprite(100, game.world.centerY, 'gun');
        gun.scale.setTo(0.07);
        gun.anchor.setTo(1, 0.2);
        
        this.game.input.keyboard.onDownCallback = keyboardInputCallback;
        
        boogies = game.add.group();
        boogies.enableBody = true;
        boogies.physicsBodyType = Phaser.Physics.ARCADE;
        for(var i = 65; i < 91; i++) {
            var boogie = boogies.create(i * 50 -3000, i * 50 - 3000, String.fromCharCode(i));
            boogie.anchor.setTo(0.5, 0.5);
            boogie.keyCode = i; // Simply the ascii value of this letter
            boogie.kill();
            //var explode = boogie.animations.add('kaboom');
        }
        
        laser = game.add.sprite(0, 0, 'laser');
        laser.alpha = 0;


        // Some text for score status and balls remaining
        var style = { font: "25px Verdana", fill: "#9999ff", align: "left" };
        text = game.add.text( 120, 15, "", style );
        text.anchor.setTo(0.5, 0.0);
        text.setText(String.fromCharCode(66));
        
        line = new Phaser.Line(0,0,0,0);
        game.time.events.loop(Phaser.Timer.SECOND, resurrect, this);
        


    }
function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}


function resurrect() {
    var maxBoogies = 26;
    //  Get a dead item
    var item;
    if(boogies.countLiving() < maxBoogies) {
        do {
            item = boogies.getRandom(0, maxBoogies);
        } while(item.alive == true);
    }

    if (item)
    {
        //  And bring it back to life
        item.reset(game.world.width, game.world.randomY);
        game.physics.arcade.moveToObject(item, gun, 60);

    } else {
        text.setText("no item");
    }

}
    function keyboardInputCallback(event) {
        
        // Only perform action for letters pressed
        if(event.keyCode >= 65 && event.keyCode <= 90) {
            text.setText(event.keyCode);

            var boogie = boogies.iterate('keyCode', event.keyCode, Phaser.Group.RETURN_CHILD);
            if (boogie != null && boogie.alive) {
                
                
                fire(boogie);
            }  
        }

    }
    
    function fire(sprite) {
        shootSound.play('shoot');
        laser.scale.setTo(1);
        laser.anchor.setTo(15/laser.width,58/laser.height);
        laser.x = gun.x;
        laser.y = gun.y;
        laser.rotation = game.physics.arcade.angleBetween(gun, sprite);
        laser.scale.setTo(game.physics.arcade.distanceBetween(gun, sprite)/(laser.width-40), .5);
        laser.alpha = 0;
        
        var tweenIn = game.add.tween(laser).to({ alpha: 1 }, 100, Phaser.Easing.Linear.None, false);
        var tweenOut = game.add.tween(laser).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, false);
        
        tweenIn.chain(tweenOut);
        tweenIn.start();


        sprite.kill();
        
        //  And create an explosion :)
        var explosion = explosions.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('kaboom', 30, sprite, true);
        explosionSound.play('explosion');
    }
    
    function update() {

        
    }
    
    function render() {

    }
    
    // Returns the angle between two objects
    function get_angle(object1, object2) {
        return Math.atan2(object2.y - object1.y, object2.x - object1.x);
    }
};
