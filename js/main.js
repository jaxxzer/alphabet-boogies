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
    
    var game = new Phaser.Game( 1000, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        // Load an image and call it 'logo'.
//        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'bomb', 'assets/bomb.png' );
        game.load.image( 'mario', 'assets/mario.png' );
    }
    
    var bouncy;
    var bouncy1;
    var text;
    //var bouncy2;
    
    function create() {
        // Create a sprite at the center of the screen using the 'logo' image.
//        bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
        bouncy1 = game.add.sprite( game.world.centerX, game.world.centerY, 'mario' );
        bouncy = game.add.sprite( game.world._width, game.world._height, 'bomb' );
//        bouncy3 = game.add.sprite( game.world.centerX, game.world.centerY, 'bomb' );
       // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
        bouncy.anchor.setTo( 0.5, 0.5 );
        bouncy1.anchor.setTo( 0.5, 0.5 );
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( bouncy, Phaser.Physics.ARCADE );
        game.physics.enable( bouncy1, Phaser.Physics.ARCADE );     
        
        // Make it bounce off of the world bounds.
        bouncy.body.collideWorldBounds = true;
        bouncy1.body.collideWorldBounds = true;
        
        bouncy.scale.setTo( .1, .1 );
        bouncy1.scale.setTo( .05, .05 );
//        bouncy1.body.setCircle(3);
        
        

        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
        text = game.add.text( game.world.centerX, 15, "Build something awesome.", style );
        text.anchor.setTo( 0.5, 0.0 );
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
        bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, this.game.input.activePointer, 200, 200, 200 );
	
	    bouncy1.x = game.input.mousePointer.x;
	    bouncy1.y = game.input.mousePointer.y;
	    
	    game.physics.arcade.collide(bouncy, bouncy1, updateText);
	    
	    text.setText(this.game.time.totalElapsedSeconds());
    	//updateText();
    }
    
    function updateText() {
    	
    	text.setText("hello");
    }
};
