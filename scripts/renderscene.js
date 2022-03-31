let view;
let ctx;
let scene;
let start_time;

const LEFT = 32; // binary 100000
const RIGHT = 16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP = 4;  // binary 000100
const FAR = 2;  // binary 000010
const NEAR = 1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(0, 10, -5),
            srp: Vector3(20, 15, -40),
            vup: Vector3(1, 1, 0),
            clip: [-12, 6, -12, 6, 10, 100]
            //prp: Vector3(44, 20, -16),
            //srp: Vector3(20, 20, -40),
            //vup: Vector3(0, 1, 0),
            //clip: [-19, 5, -10, 8, 12, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4(0, 0, -30, 1),
                    Vector4(20, 0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4(0, 12, -30, 1),
                    Vector4(0, 0, -60, 1),
                    Vector4(20, 0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4(0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);

    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;

    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    // Transform to canonical view volume
    let per_Canonical = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
    console.log(per_Canonical)
    let mAndnPer = Matrix.multiply([mat4x4MPer(), per_Canonical]);
    // multiply this matrix by all points of the shape that is being drawn
    let canonicalVertices = [];
    // Convert all points to world view
    for (let i = 0; i < scene.models[0].vertices.length; i++) {
        let vertex_Matrix = new Matrix(4, 1);
        vertex_Matrix.values = [scene.models[0].vertices[i].x, scene.models[0].vertices[i].y,
        scene.models[0].vertices[i].z, scene.models[0].vertices[i].w];
        calculation = Matrix.multiply([mAndnPer, vertex_Matrix]);
        canonicalVertices[i] = calculation;
    }

    // Divide all x and y points by w
    let preFrameBuffer = [];
    for (let i = 0; i < canonicalVertices.length; i++) {
        let temp = canonicalVertices[i].data[0] / canonicalVertices[i].data[3];
        let temp2 = canonicalVertices[i].data[1] / canonicalVertices[i].data[3];
        preFrameBuffer[i] = new Vector4(temp, temp2, canonicalVertices[i].data[2], 1);
    }

    // Translate to 2D
    let toDraw = [];
    let bufferMatrix = new Matrix(4, 4);
    bufferMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
    [0, view.height / 2, 0, view.height / 2],
    [0, 0, 1, 0],
    [0, 0, 0, 1]];

    for (let i = 0; i < canonicalVertices.length; i++) {
        let calculation = Matrix.multiply([bufferMatrix, preFrameBuffer[i]]);
        toDraw[i] = calculation;
    }
    // Temp way to draw shape onto canvas - pre-line clipping
    for (let i = 0; i < toDraw.length - 1; i++) {
        drawLine(toDraw[i].data[0], toDraw[i].data[1], toDraw[i + 1].data[0], toDraw[i + 1].data[1]);
    }
    drawLine(toDraw[1].data[0], toDraw[1].data[1], toDraw[6].data[0], toDraw[6].data[1]);
    drawLine(toDraw[2].data[0], toDraw[2].data[1], toDraw[7].data[0], toDraw[7].data[1]);
    drawLine(toDraw[3].data[0], toDraw[3].data[1], toDraw[8].data[0], toDraw[8].data[1]);
    drawLine(toDraw[5].data[0], toDraw[5].data[1], toDraw[0].data[0], toDraw[0].data[1]);

    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}
// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);


    // TODO: implement clipping here!

    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    //console.log(line);
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    while (true) {
        console.log(out0);
        console.log(out1);
        console.log(out0 | out1);
        console.log((out0 & out1));
        // Trival Accept
        if (out0 == 0 && out1 == 0) {
            // Done - return p0 and p1
            // result = //both endpoints that have been calculated to be inside view volume
            break;
        }
        // Trival Reject
        else if ((out0 & out1) != 0) {
            // Done - return null
            break;
        } else {
            // Otherwise investigate further 
            // Choose point that lies outside the viewspace (if both just choose the first one)
            let updateP0;
            let outCodeUse;
            if (out0 == 0) {
                // select out1 vector
                updateP0 = false;
                outCodeUse = out1;
            } else if (out1 == 0) {
                // select out0 vector
                updateP0 = true;
                outCodeUse = out0;
            } else {
                // If both are not 0 then start with p0
                updateP0 = true;
                outCodeUse = out0;
            }
            //clip: [-12, 6, -12, 6, 10, 100] (Left, Right, Bottom, Top, Near, Far) -> ??? when to use these
            // clip against edge that is first indicated by the outcode
            // calculate point to replace the selected point with
            let x, y, z, t;
            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let dz = p1.z - p0.z;
            console.log(outCodeUse)
            if ((outCodeUse & LEFT) == LEFT) {
                console.log("Clip Against Left");
                // Clip against left edge
                t = ((0 - p0.x) + p0.z) / (dx - dz)
            } else if ((outCodeUse & RIGHT) == RIGHT) {
                console.log("Clip Against Right");
                // Clip against right edge
                t = (p0.x + p0.z) / ((0 - dx) - dz)
            } else if ((outCodeUse & BOTTOM) == BOTTOM) {
                console.log("Clip Against Bottom");
                // Clip against bottom edge
                t = ((0 - p0.y) + p0.z) / (dy - dz);
            } else if ((outCodeUse & TOP) == TOP) {
                console.log("Clip Against Top");
                // Clip against top edge
                t = (p0.y + p0.z) / ((0 - dy) - dz);
            } else if ((outCodeUse & FAR) == FAR) {
                console.log("Clip Against Far");
                // Clip against far edge
                t = ((0 - p0.z) - 1) / dz;
            } else if ((outCodeUse & NEAR) == NEAR) {
                console.log("Clip Against Near");
                // Clip against near edge
                t = (p0.z - z_min) / (0 - dz);
            }
            x = (1 - t) * p0.x + t * p1.x;
            y = (1 - t) * p0.y + t * p1.y;
            z = (1 - t) * p0.z + t * p1.z;
            //console.log("X: " + x);
            //console.log("Y: " + y);
           // console.log("Z: " + z);

            // replace point that was selected earlier and update outcode
            if (updateP0 == true) {
                // update p0
                p0 = new Vector3(x, y, z);
                out0 = outcodePerspective(p0, z_min);
                console.log("P0: " + p0.x + ":" + p0.y + ":" + p0.z + " outcode: " + out0);
            } else {
                // update p1
                p1 = new Vector3(x, y, z);
                out1 = outcodePerspective(p1, z_min);
                console.log("P1: " + p1.x + ":" + p1.y + ":" + p1.z + " outcode: " + out1);
            }
        }
        // Still working on method - if break is removed potentially could crash web browser
        break;
    }

    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                        scene.models[i].vertices[j][1],
                        scene.models[i].vertices[j][2],
                        1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                    scene.models[i].center[1],
                    scene.models[i].center[2],
                    1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
