// Gregory Zacharko
// Intro to Computer Graphics
// Professor Rabbitz
// Spring 2022 Semester
// 3/30/2022
// Project 3: Billiards Game

// Some Global Variables
var gl;
var program;
var canvas;

var drag = false;
var linePoint1_W = vec2(0.0, 0.0);
var linePoint2_W = vec2(5.0, 5.0);
var linebufferId;
var circleBufferId;
var tableBufferId;
var circleVertices = [];

var left = -10;           // Left Limit of World Coords
var right = 66;           // Right Limit of World Coords
var bottom = -10;         // Bottom Limit of World Coords
var topBound = 66;        // Top Limit of World Coords
var near = -10;           // Near Clip Plane
var far = 10;             // Far Clip Plane

// Pool Balls Weigh 5.5 oz (.34375 lbs); The Cue Ball Weighs 6.0 oz
// Ball Class
function Ball() {
    this.color = vec3(0.9, 0.9, 0.9);  // Ball Color
    this.radius = 1.0;
    this.mass = 0.010684;              // Ball Mass = .34375 lbs / (G = 32.174049)
    this.recpMass = 93.5979;           // 1.0 / mass
    this.elasticity = 0.8;
    this.position = vec2(0.0, 0.0);    // Ball Position
    this.velocity = vec2(0.0, 0.0);    // Ball Velocity 
    this.forceAccum = vec2(0.0, 0.0);  // Force Accumulator
}

// Implicit Equation of a Line; See Eq. 8 in Lecture 7
function Line() {
    this.A = 0.0;
    this.B = 0.0;
    this.C = 0.0;
}

// Pocket Class
function Pocket() {
    this.color = vec3(0.5, 0.3, 0.0);   // Pocket Color; Brown
    this.radius = 2.0;
    this.position = vec2(0.0, 0.0);     // Pocket Position
}

// More Globals
var balls = [];             // Array of Pool Balls (With a Full Rack this will be 15 Colored Balls, Plus 1 Cue Ball)
var cushsionLines = [];     // Array of Pool Table Cushions (This will be a Size of 4)
var pockets = [];           // Array of Pool Table Pockets (This will be a Size of 6)

var simTime = 0.0;          // Simulation Clock
var delta_t = 0.01;         // Simulation Time Step
var delta_d = 0.01;         // Collision Distance Delta
var xDot = vec2(0.0, 0.0);  // Derivative of Position
var vDot = vec2(0.0, 0.0);  // Deriviative of Velocity
var dragForce = 0.003;      // Drag Force

///////////////////////////////////////////////////////////////////////
//
// Define callback function for window.onload
//
///////////////////////////////////////////////////////////////////////
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );     // Get HTML Canvas
    
    gl = canvas.getContext('webgl2');                    // Get a WebGL 2.0 Context
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);  // What Part of HTML are we Looking At?
    gl.clearColor(0.0, 0.0, 0.0, 1.0);               // Set Background Color of the Viewport to Black

    var aspect = canvas.width / canvas.height;       // Get the Aspect Ratio of the Canvas
    left *= aspect;                                  // Left Limit of World Coords
    right *= aspect;                                 // Right Limit of World Coords
    
    // Load Shaders and Initialize Attribute Buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and Link Shaders to Form a Program
    gl.useProgram(program);                                          // Make this the Active Shader Program

    var cueBall = new Ball;
    cueBall.color = vec3(1.0, 1.0, 1.0);    // White (Cue Ball)
    cueBall.mass = 0.011655;
    cueBall.recpMass = 85.8001;
    cueBall.velocity = vec2(0.0, 0.0);
    cueBall.position = vec2(63.0, 28.0);

    var ball1 = new Ball;
    ball1.color = vec3(1.0, 1.0, 0.0);      // Yellow (Ball #1)
    ball1.velocity = vec2(0.0, 0.0);
    ball1.position = vec2(25.0, 28.0);

    var ball2 = new Ball;
    ball2.color = vec3(0.0, 0.0, 1.0);      // Blue (Ball #2)
    ball2.velocity = vec2(0.0, 0.0);
    ball2.position = vec2(22.5, 26.5);

    var ball3 = new Ball;
    ball3.color = vec3(1.0, 0.0, 0.0);      // Red (Ball #3)
    ball3.velocity = vec2(0.0, 0.0);
    ball3.position = vec2(22.5, 29.5);

    var ball4 = new Ball;
    ball4.color = vec3(0.3, 0.0, 0.5);      // Purple (Ball #4)
    ball4.velocity = vec2(0.0, 0.0);
    ball4.position = vec2(20.0, 25.0);

    var ball5 = new Ball;
    ball5.color = vec3(1.0, 0.5, 0.0);      // Orange (Ball #5)
    ball5.velocity = vec2(0.0, 0.0);
    ball5.position = vec2(20.0, 28.0);

    var ball6 = new Ball;
    ball6.color = vec3(0.0, 0.6, 0.0);      // Green (Ball #6)
    ball6.velocity = vec2(0.0, 0.0);
    ball6.position = vec2(20.0, 31.0);

    var ball7 = new Ball;
    ball7.color = vec3(0.5, 0.0, 0.0);      // Burgandy/Maroon (Ball #7)
    ball7.velocity = vec2(0.0, 0.0);
    ball7.position = vec2(17.5, 23.5);

    var ball8 = new Ball;
    ball8.color = vec3(0.0, 0.0, 0.0);      // Black (Ball #8)
    ball8.velocity = vec2(0.0, 0.0);
    ball8.position = vec2(17.5, 26.5);

    var ball9 = new Ball;
    ball9.color = vec3(0.9, 0.9, 0.6);      // Light/Lemon Yellow (Ball #9)
    ball9.velocity = vec2(0.0, 0.0);
    ball9.position = vec2(17.5, 29.5);

    var ball10 = new Ball;
    ball10.color = vec3(0.0, 0.7, 0.9);      // Sky Blue (Ball #10)
    ball10.velocity = vec2(0.0, 0.0);
    ball10.position = vec2(17.5, 32.5);

    var ball11 = new Ball;
    ball11.color = vec3(1.0, 0.4, 0.5);      // Light Red (Ball #11)
    ball11.velocity = vec2(0.0, 0.0);
    ball11.position = vec2(15.0, 22.0);

    var ball12 = new Ball;
    ball12.color = vec3(0.8, 0.6, 0.9);      // Light Purple/Lavender (Ball #12)
    ball12.velocity = vec2(0.0, 0.0);
    ball12.position = vec2(15.0, 25.0);

    var ball13 = new Ball;
    ball13.color = vec3(1.0, 0.7, 0.5);      // Light Orange (Ball #13)
    ball13.velocity = vec2(0.0, 0.0);
    ball13.position = vec2(15.0, 28.0);

    var ball14 = new Ball;
    ball14.color = vec3(0.1, 0.8, 0.5);      // Light Green (Ball #14)
    ball14.velocity = vec2(0.0, 0.0);
    ball14.position = vec2(15.0, 31.0);

    var ball15 = new Ball;
    ball15.color = vec3(0.7, 0.3, 0.4);      // Light Burgandy/Maroon (Ball #15)
    ball15.velocity = vec2(0.0, 0.0);
    ball15.position = vec2(15.0, 34.0);

    // Push Balls onto Balls Array
    balls.push(cueBall);
    balls.push(ball1);
    balls.push(ball2);
    balls.push(ball3);
    balls.push(ball4);
    balls.push(ball5);
    balls.push(ball6);
    balls.push(ball7);
    balls.push(ball8);
    balls.push(ball9);
    balls.push(ball10);
    balls.push(ball11);
    balls.push(ball12);
    balls.push(ball13);
    balls.push(ball14);
    balls.push(ball15);

    // Left Cushion; See Equation 8 in Lecture 7
    var leftCushion = new Line;
    var p = vec2(0.0, 28.0);
    var norm = vec2(1.0, 0.0);
    MakeCushionLine(leftCushion, p, norm);
    cushsionLines.push(leftCushion);

    // Right Cushion
    var rightCushion = new Line;
    var p = vec2(84.0, 28.0);
    var norm = vec2(-1.0, 0.0);
    MakeCushionLine(rightCushion, p, norm);
    cushsionLines.push(rightCushion);

    // Bottom Cushion
    var bottomCushion = new Line;
    var p = vec2(42.0, 0.0);
    var norm = vec2(0.0, 1.0);
    MakeCushionLine(bottomCushion, p, norm);
    cushsionLines.push(bottomCushion);

    // Top Cushion
    var topCushion = new Line;
    var p = vec2(42.0, 56.0);
    var norm = vec2(0.0, -1.0);
    MakeCushionLine(topCushion, p, norm);
    cushsionLines.push(topCushion);

    // Rectangle
    // Table Verticies
    var tableVertices = [
        vec2(0.0, 0.0),
        vec2(84.0, 0.0),
        vec2(84.0, 56.0),
        vec2(0.0, 56.0)
    ];

    // Create VBO for Table
    tableBufferId = gl.createBuffer();                                       // Generate a VBO ID
    gl.bindBuffer(gl.ARRAY_BUFFER, tableBufferId);                           // Bind this VBO to be the Active One
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tableVertices), gl.STATIC_DRAW);  // Load the VBO with Vertex Data

    // Bottom Left Pocket
    var bottomLeftPocket = new Pocket;
    bottomLeftPocket.position = vec2(2.0, 2.0);

    // Bottom Middle Pocket
    var bottomMiddlePocket = new Pocket;
    bottomMiddlePocket.position = vec2(42.0, 2.0);

    // Bottom Right Pocket
    var bottomRightPocket = new Pocket;
    bottomRightPocket.position = vec2(82.0, 2.0);
    
    // Top Right Pocket
    var topRightPocket = new Pocket;
    topRightPocket.position = vec2(82.0, 54.0);

    // Top Middle Pocket
    var topMiddlePocket = new Pocket;
    topMiddlePocket.position = vec2(42.0, 54.0);

    // Top Left Pocket
    var topLeftPocket = new Pocket;
    topLeftPocket.position = vec2(2.0, 54.0);
    
    // Push Pockets onto Pockets Array
    pockets.push(bottomLeftPocket);
    pockets.push(bottomMiddlePocket);
    pockets.push(bottomRightPocket);
    pockets.push(topRightPocket);
    pockets.push(topMiddlePocket);
    pockets.push(topLeftPocket);

    // Circle
    circleVertices.push(vec2(0.0, 0.0));
    for (var degs = 0; degs <= 360; degs += 5) {
        var radians = RadiansToDegs(degs);

        circleVertices.push(vec2(Math.cos(radians), Math.sin(radians)));
    }

    // Create VBO for Circle
    circleBufferId = gl.createBuffer();                                       // Generate a VBO ID
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                           // Bind this VBO to be the Active One
    gl.bufferData(gl.ARRAY_BUFFER, flatten(circleVertices), gl.STATIC_DRAW);  // Load the VBO with Vertex Data
    

    // Line
    var lineVertices = [
        linePoint1_W,
        linePoint2_W,
    ];

    // Load the Data into the GPU
    linebufferId = gl.createBuffer();                                        // Generate a VBO ID
    gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the Active One
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with Vertex Data

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );        // Link js vPosition with "vertex shader attribute variable" - vPosition
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0 );        // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);                               // Enable this attribute


    // Register Mouse Callbacks
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseOut, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    // Callback Function for Keydown Events; Registers Function dealWithKeyboard
    window.addEventListener("keydown", dealWithKeyboard, false);

    render();
};

// Function that Gets Called to Parse Keydown Events
function dealWithKeyboard(e) {
    switch (e.keyCode) {
        case 37:    // Left Arrow; Pan Left
            { left += -0.1; right += -0.1 };
            break;
        case 38:    // Up Arrow; Pan Up
            { bottom += 0.1; topBound += 0.1 };
            break;
        case 39:    // Right Arrow; Pan Right
            { left += 0.1; right += 0.1 };
            break;
        case 40:    // Down Arrow; Pan Down
            { bottom += -0.1; topBound += -0.1 };
            break;
    }
}

/////////////////////////////////////////////////////////////////

function ScreenToWorld2D(screen)
{
    var a = screen[0] / canvas.width;
    var b = screen[1] / canvas.height;
    x_W = left + a * (right - left);
    y_W = bottom + b * (topBound - bottom);

    return vec2(x_W, y_W);
}

/////////////////////////////////////////////////////////////////

function RadiansToDegs(degree) {
    var rad = degree * (Math.PI / 180);
    return rad;
}

//////////////////////////////////////////////////////////////////


// Mouse Events
var mouseDown = function (e) {
    drag = true;

    var point_S = vec2(e.pageX, Math.abs(e.pageY - canvas.height))
    linePoint1_W = ScreenToWorld2D(point_S);

    e.preventDefault();
    return false;
};

var mouseUp = function (e) {
    drag = false;

    var v = vec2();
    v = subtract(linePoint1_W, linePoint2_W);
    balls[0].velocity = v;
};

var mouseOut = function (e) {
    balls[0].velocity = balls[0].velocity;
};

var mouseMove = function (e) {
    if (!drag) return false;

    var point_S = vec2(e.pageX, Math.abs(e.pageY - canvas.height));
    linePoint2_W = ScreenToWorld2D(point_S);
 
    e.preventDefault();
};


///////////////////////////////////////////////////////////////////////////////////
//
// Create the Implicit Equation for a Line for a Cushion; See Eq. 8 in Lecture 7
//
///////////////////////////////////////////////////////////////////////////////////
function MakeCushionLine(line, p, norm)
{
    var len = length(norm);
    var n = norm;
    n[0] = norm[0] / len;
    n[1] = norm[1] / len;

    line.A = norm[0];
    line.B = norm[1];

    var u = negate(n);
    line.C = dot(u, p);
}


////////////////////////////////////////////////////////////////////
//
// Given a cushsionLines j, Compute the min Distance to a Point p.
//
/////////////////////////////////////////////////////////////////////
function DistToPoint(j, p)
{
    var dist = cushsionLines[j].A * p[0] + cushsionLines[j].B * p[1] + cushsionLines[j].C;

    return dist;
}


///////////////////////////////////////////////////////////////////
//
//  Compute the Distance Between Ball i and Ball j
//  See Eq. 9.2 in Lecture 10. This Method Computes d,
//  the distance between the two balls.
//
///////////////////////////////////////////////////////////////////
function DistToBall(i, j)
{
    var u = subtract(balls[i].position, balls[j].position);    // Calculate u
    var d1 = Math.sqrt(dot(u, u));                        // Calculate d1
    var d2 = balls[i].radius + balls[j].radius;           // Sum of Radii
    var d = d1 - d2;    // The distance between the two balls

    return d;
}


///////////////////////////////////////////////////////////////////
//
//  Compute the Distance Between Ball i and Pocket j
//  See Eq. 9.2 in Lecture 10. This Method Computes d,
//  the distance between the ball and pocket.
//
///////////////////////////////////////////////////////////////////
function DistToPocket(i, j)
{
    var u = subtract(balls[i].position, pockets[j].position);   // Calculate u
    var d1 = Math.sqrt(dot(u, u));                              // Calculate d1
    var d2 = balls[i].radius + pockets[j].radius;               // Sum of Radii
    var d = d1 - d2;    // The distance between the ball and pocket

    return d;
}


/////////////////////////////////////////////////////////////////////////////////////////////////
//
// Given a Circle i, Compute the min Distance from the Circle Perimeter to the Cushion Line j
//
/////////////////////////////////////////////////////////////////////////////////////////////////
function DistToLine(i, j)
{
    var dist = DistToPoint(j, balls[i].position);   // Distance from Circle Center to Cushion Line
    dist -= balls[i].radius;                        // Subtract Away Circle Radius

    return dist;
}


////////////////////////////////////////////////////////////////////
//
// Clear Forces for Ball i
//
////////////////////////////////////////////////////////////////////
function ClearForces(i)
{
    balls[i].forceAccum[0] = 0.0;
    balls[i].forceAccum[1] = 0.0;
}


////////////////////////////////////////////////////////////////////
//
// Compute Derivatives Necessary for Euler's Method
//
//////////////////////////////////////////////////////////////////////
function ComputeDerivs(i)
{
    xDot = balls[i].velocity;   // xDot = v

    // vDot = f/m
    vDot = mult(balls[i].recpMass, balls[i].forceAccum);
}


////////////////////////////////////////////////////////////////////////
//
// Apply Forces
//
/////////////////////////////////////////////////////////////////////////
function ApplyForces(i) {
    // No Gravity
   
    // Apply Viscous Drag

    v = negate(balls[i].velocity);                     // Have Velocity Point in Opposite Direction
    v = mult(dragForce, v);                            // Scalar Multiply Drag Force by Opposite Pointing Vector

    balls[i].forceAccum = add(balls[i].forceAccum, v); // Add to Force Accumulator
}


///////////////////////////////////////////////////////////////////////////////////////
//
// Advance Time, and Solve Differental Equations Newtonian Motion using Euler's Method.
// Runge-Kutta is a More Accurate Method.
// https://scicomp.stackexchange.com/questions/20172/why-are-runge-kutta-and-eulers-method-so-different
//
////////////////////////////////////////////////////////////////////////////////////////
function AdvanceTime(delta)
{
    simTime += delta;
    for (i = 0; i < balls.length; i++) {
        ClearForces(i);
    }

    // Solve ODEs Using Euler's Method
    for (i = 0; i < balls.length; i++) {
        ApplyForces(i);
        ComputeDerivs(i);

        // Euler's Method
        var delta_v = vec2();
        var delta_a = vec2();
        delta_v = mult(delta, xDot);
        delta_a = mult(delta, vDot);

        balls[i].position = add(balls[i].position, delta_v);
        balls[i].velocity = add(balls[i].velocity, delta_a);
    }
}


/////////////////////////////////////////////////////////////////////////////////
//
// Compute an Impulse Between Two Circles (balls) Colliding in the 2D Plane
// See Lecture 10 Slides, Eqs. 9-13 - 9-17
//
///////////////////////////////////////////////////////////////////////////////////
function ImpulseWithBall(i, j)
{
    var uc = subtract(balls[i].position, balls[j].position);
    var dc = Math.sqrt(dot(uc, uc));
    var n = mult((1/dc), uc);
    var pn1 = dot(balls[i].velocity, n);
    var pn2 = dot(balls[j].velocity, n);
    var pn3 = (pn1 - pn2);
    var pn = (2 * pn3);
    var pd = (balls[i].mass + balls[j].mass);
    var p = (pn / pd);

    balls[i].velocity = subtract(balls[i].velocity, mult((p * balls[i].mass), n));
    balls[j].velocity = add(balls[j].velocity, mult((p * balls[j].mass), n));
}


/////////////////////////////////////////////////////////////////////////////////////
//
// Method to Implment Eq. 9.8 to Compute Impulse for Ball i Hitting a CushionLine j
// This Method Should Alter the Velocity of Ball i
//
/////////////////////////////////////////////////////////////////////////////////////
function ImpulseWithCushion(i, j)
{
    var prod;
    var prod2;
    var prod3;

    if(j == 0)
    {
        var norm0 = vec2(1.0, 0.0);
        prod = dot(norm0, balls[i].velocity);
        prod2 = mult(prod, norm0);
        prod3 = mult(-2, prod2);
        balls[i].velocity = add(prod3, balls[i].velocity);
    }
    else if(j == 1)
    {
        var norm1 = vec2(-1.0, 0.0);
        prod = dot(norm1, balls[i].velocity);
        prod2 = mult(prod, norm1);
        prod3 = mult(-2, prod2);
        balls[i].velocity = add(prod3, balls[i].velocity);
    }
    else if(j == 2)
    {
        var norm2 = vec2(0.0, 1.0);
        prod = dot(norm2, balls[i].velocity);
        prod2 = mult(prod, norm2);
        prod3 = mult(-2, prod2);
        balls[i].velocity = add(prod3, balls[i].velocity);
    }
    else if(j == 3)
    {
        var norm3 = vec2(0.0, -1.0);
        prod = dot(norm3, balls[i].velocity);
        prod2 = mult(prod, norm3);
        prod3 = mult(-2, prod2);
        balls[i].velocity = add(prod3, balls[i].velocity);
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////
//
// This Method will First Test Each Ball Pair for Possible Collision, Then Test Each Ball Against
// Each of the Four Cushions. Then Test Each Ball Against Each of the Six Pockets.
// If a Collision Occurs it will Invoke the Appropriate Impulse Method.
//
//////////////////////////////////////////////////////////////////////////////////////////////////
function CollisionTest()
{
    // Loop to Test Each Ball i Against each Ball j. If they Collide, Need to Call ImpulseWithBall(i, j)
    for(var i = 0; i < balls.length - 1; i++)
    {
        for(var j = i + 1; j < balls.length; j++)
        {
            var ballDistance = DistToBall(i, j);
            if(ballDistance <= 0.0)
            {
                ImpulseWithBall(i, j);
            }
        }
    }

    // Loop to Test Each Ball i Against each cushionLine j. If they Collide, Need to Call ImpulseWithCushion((i, j)
    for(var i = 0; i < balls.length; i++)
    {
        for(var j = 0; j < cushsionLines.length; j++)
        {
            var cushDistance = DistToLine(i, j);
            if(cushDistance <= 0.0)
            {
                ImpulseWithCushion(i, j);
            }
        }
    }

    // Loop to Test Each Ball i Against each Pocket j. If they Collide, Change the Color and Position of the Ball i
    for(var i = 0; i < balls.length; i++)
    {
        for(var j = 0; j < pockets.length; j++)
        {
            var pocketDistance = DistToPocket(i, j);
            if((pocketDistance <= 0.0) && (i != 0))     // If The Cue Ball DOES NOT Fall Into a Pocket
            {
                balls[i].color = vec3(0.0, 0.0, 0.0);   // Change Color of the Ball to Black So It Blends Into the Background
                balls[i].velocity = vec2(0.0, 0.0);     // Make Ball's Velocity 0.0 So It Does Not Move
                balls[i].position = vec2(100.0, 28.0);  // Change Position of the Ball to be Off the Table/Off-Screen
            }
            
            if((pocketDistance <= 0.0) && (i == 0)) // If the Cue Ball DOES Fall Into a Pocket
            {
                balls[0].position = vec2(63.0, 28.0);   // Reset the Cue Ball's Position
                balls[0].velocity = vec2(0.0, 0.0);     // Reset the Cue Ball's Velocity
            }
        }
    }
}


///////////////////////////////////////////////////////////////////////

// Render Function
function render() {
    var lineVertices = [
       linePoint1_W,
       linePoint2_W
    ];

    AdvanceTime(delta_t);
    CollisionTest();

    gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the Canvas with gl.clearColor Defined Above

    var PMat;                                                  // JS Variable to Hold Projection Matrix
    PMat = ortho(left, right, bottom, topBound, near, far);    // Call Function to Compute Orthographic Projection Matrix
    var P_loc = gl.getUniformLocation(program, "P");           // Get Vertex Shader Memory Location for P
    gl.uniformMatrix4fv(P_loc, false, flatten(PMat));          // Set Uniform Variable P on GPU 

    var MV = mat4();                                           // Identity Matrix
    var MV_loc = gl.getUniformLocation(program, "MV");         // Get Vertex Shader Memory Location for P
    gl.uniformMatrix4fv(MV_loc, false, flatten(MV));

    var colorLoc = gl.getUniformLocation(program, "color");      // Get Fragment Shader Memory Location of color
    var vPosition = gl.getAttribLocation(program, "vPosition");  // Link vPosition with "Vertex Shader Attribute Variable" - vPosition

    // Draw the Pool Table; Need to Set colorLoc to the Proper Color for Pixel Shade
    gl.uniform3f(colorLoc, 0.0, 0.3, 0.0);                        // Set RGB Color of Table; Dark Green
    gl.bindBuffer(gl.ARRAY_BUFFER, tableBufferId);                // Bind this VBO to be the Active One
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);  // Specify Layout of VBO Memory
    gl.enableVertexAttribArray(vPosition);                        // Enable this Attribute
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);                         // Call gl.drawArrays for the Table

    // Draw Drag Line
    if (drag)
    {
        gl.uniform3f(colorLoc, 1.0, 1.0, 1.0);                    // Set RGB Color of Line; White
        gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);             // Bind this VBO to be the Active One
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with Vertex Data

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);  // Specify Layout of VBO Memory
        gl.enableVertexAttribArray(vPosition);                        // Enable this Attribute

        gl.drawArrays(gl.LINES, 0, 2);
    }

    // Render Pool Balls and Pockets
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                   // Bind this VBO to be the Active One
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);      // Specify Layout of VBO Memory
    gl.enableVertexAttribArray(vPosition);

    // Loop to Render Each Ball i; Need to Set Pixel Uniform Shader colorLoc, and Need to Build MV_loc Matrix via Ball Position
    gl.uniform3f(colorLoc, .5, .5, .5);
    for (i = 0; i < balls.length; i++)
    {
        var col = balls[i].color;
        gl.uniform3f(colorLoc, col[0], col[1], col[2]);                // Set RGB Color of Ball

        var pos = balls[i].position;        
        MV = translate(pos[0], pos[1], 0.0);                           // Create Translate Matrix MV         
        gl.uniformMatrix4fv(MV_loc, false, flatten(MV));                

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    }

    // Loop to Render Each Pocket; Need to Set Pixel Uniform Shader colorLoc, and Need to Build MV_loc Matrix via Pocket Position
    gl.uniform3f(colorLoc, .5, .5, .5);
    for (i = 0; i < pockets.length; i++)
    {
        var col = pockets[i].color;
        gl.uniform3f(colorLoc, col[0], col[1], col[2]);                // Set RGB Color of Pockets; Brown

        var pos = pockets[i].position;
        MV = translate(pos[0], pos[1], 0.0);                           // Creat4e Translate Matrix MV
        gl.uniformMatrix4fv(MV_loc, false, flatten(MV));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    }
    
    requestAnimationFrame(render);                                     // Swap Buffers; Continue render Loop
};