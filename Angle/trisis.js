////////////////////////////////////////////////////////////////////////////////////////////////
//       _____ _____  ___   _   __   _   _______ _     ______ _____ _____ _   _  _____        //
//      |_   _/  ___|/ _ \ | | / /  | | / /  _  | |    | ___ \  ___|_   _| \ | |/  ___|       //
//        | | \ `--./ /_\ \| |/ /   | |/ /| | | | |    | |_/ / |__   | | |  \| |\ `--.        //
//        | |  `--. \  _  ||    \   |    \| | | | |    | ___ \  __|  | | | . ` | `--. \       //
//       _| |_/\__/ / | | || |\  \  | |\  \ \_/ / |____| |_/ / |___ _| |_| |\  |/\__/ /       //
//       \___/\____/\_| |_/\_| \_/  \_| \_/\___/\_____/\____/\____/ \___/\_| \_/\____/        //
//                                                                                            //
//      Isak Arnar Kolbeins                                                                   //
//                                                                                            //
//      Verkefni 2, Tolvugrafik 2019                                                          //
//                                                                                            //
//      Fiskar i fiskaburi sem med hjardhegdun                                                //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////

var canvas;
var gl;



var school = [];        // All the fish
var boxSize = 5;       // Fish container size

var bounce = true;

var fishCount = 1;    // Number of fish

// flocking alg stuff: 
var sepDist = 50/boxSize;
var sepForce = 0.2;
var alignDist = 100/boxSize;
var alignForce = 0.1;
var cohDist =  100/boxSize;
var cohForce = 0.1;


var movement = false;       // Mouse click drag
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zView = boxSize*2.5;    // viewer z position

var proLoc;
var mvLoc;
var colorLoc;


// Number of points for each object
var NumFishTank = points.boxFill.length;
var NumTankFrame = points.boxFrame.length;
var NumBoxLine = points.boxLine.length;


// The points in 3d space -- in vertices file
var vertices = 
        points.boxFill.concat(
        points.boxFrame,
        points.boxLine
    )



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);  
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Projection array for viewer
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Mouse handlers
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("touchstart", function(e){
        movement = true;
        origX =  e.clientX || e.targetTouches[0].pageX;;
        origY =  e.clientY || e.targetTouches[0].pageY;;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );
    canvas.addEventListener("touchend", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    canvas.addEventListener("touchmove", function(e){
        if(movement) {
            var currx =  e.clientX || e.targetTouches[0].pageX;
            var curry =  e.clientY || e.targetTouches[0].pageY;
    	    spinY += (currx - origX) % 360;
            spinX += (curry - origY) % 360;
            origX = currx;
            origY = curry;
        }
    } );
    
    // Keyboard functions
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
        case 38:	// down arrow
            zView += 0.2;
            break;
        case 40:	// up arrow
            zView -= 0.2;
            break;
        case 37:	// vinstri
            spinY += 1.9;
            break;
        case 39:	// hægri ör
            spinY -= 1.9;
            break;    
        }
    }  );  

    // Scroll wheel handler
    window.addEventListener("mousewheel", function(e){
        if( e.wheelDelta > 0.0 ) {
            zView += 0.2;
        } else {
            zView -= 0.2;
        }
    }  );

    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    
    
    // Scale for fish container
    mv = mult( mv, scalem ( (boxSize), (boxSize), (boxSize) ) );

    //  Draw the frame for fish container
    gl.uniform4fv( colorLoc, vec4(1.0, 1.0, 1.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.LINE_STRIP, NumFishTank, NumTankFrame);

    //  Draw the frame for fish container
    gl.uniform4fv( colorLoc, vec4(2.0, 3.0, 1.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.LINE_STRIP, 0, NumBoxLine);

    // Half transparent glass container, only draw inside
    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.2, 0.01) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.cullFace(gl.FRONT);  // Inside
    gl.drawArrays( gl.TRIANGLES, 0, NumFishTank);
    
    // Reverse
    mv = mult( mv, scalem ( 1/(boxSize), 1/(boxSize), 1/(boxSize) ) );
	gl.draw
    requestAnimFrame( render );
}

