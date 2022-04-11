// New Commit
let view;
let ctx;
let scene;
let start_time;
let update;
let x = false;
let y = false;
let z = false;
let points = false;
let animation = false;
let condition = true;
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
    //loadNewScene();
    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',

            prp: Vector3(30, 10, 0),
            srp: Vector3(30, 10, -19),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
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
                matrix: new Matrix(4, 4),
                //center: [-10,-10,-45],
                //center: [-10, -10, 45],// center for y axis
                center: [10, -10, 45],// center for x axis
                animation: {
                    axis: "x",
                    rps: 0.5,

                }
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
    // Time converted to seconds
    if (animation == true) {
        //console.log(animationArray)
        let revolutions = (time);
        let t_matrix = new Matrix(4, 4);
        let t_matrix2 = new Matrix(4, 4);
        let rotate = new Matrix(4, 4);
        // Loop over models in animation
        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].animation != null) {
                let center = scene.models[i].center.data;
                if (center == undefined) {
                    center = scene.models[i].center;
                }
                if (condition == true) {
                    console.log(center);
                    console.log(scene)
                    console.log(scene.models[i].edges)
                    condition = false;
                }
                let rps = scene.models[i].animation.rps;
                let axis = scene.models[i].animation.axis;
                // Translate to origin -- rotate -- translate back to original position
                mat4x4Translate(t_matrix, center[0], center[1], center[2]);
                if (axis == "y") {
                    // y rotation
                    mat4x4RotateY(rotate, revolutions / (150/rps));
                } else if (axis == "x") {
                    // x rotation
                    mat4x4RotateX(rotate, revolutions / (150/rps));
                } else if (axis == "z") {
                    // z rotation
                    mat4x4RotateZ(rotate, revolutions / (150/rps));
                }
                mat4x4Translate(t_matrix2, -center[0], -center[1], -center[2]);
            }
            scene.models[0].matrix = Matrix.multiply([t_matrix2, rotate, t_matrix]);
        }
    }
    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    window.requestAnimationFrame(animate);

}

function animationProperties() {

}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    // Clear scene
    ctx.clearRect(0, 0, view.width, view.height);
    // Loop over all models in the scene
    for (let mIndex = 0; mIndex < scene.models.length; mIndex++) {
        // if none of the special conditions are executed the generic properties will be used
        // Generating a Cube
        if (scene.models[mIndex].type == "cube") {
            let center = scene.models[mIndex].center;
            let cal_VerticesAndEdges = generateCube(center.data[0], center.data[1], center.data[2],
                scene.models[mIndex].depth, scene.models[mIndex].height, scene.models[mIndex].depth);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices;
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges;
        }
        // Generating a Cone
        if (scene.models[mIndex].type == "cone") {
            let center = scene.models[mIndex].center;
            let cal_VerticesAndEdges = generateCone(center.data[0], center.data[1], center.data[2], scene.models[mIndex].radius,
                scene.models[mIndex].height, scene.models[mIndex].sides);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices[0];
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges[0];
        }
        // Generating a Sphere
        if (scene.models[mIndex].type == "sphere") {
            let center = scene.models[mIndex].center;
            let cal_VerticesAndEdges = generateSphere(center.data[0], center.data[1], center.data[2], scene.models[mIndex].radius,
                scene.models[mIndex].slices, scene.models[mIndex].stacks);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices[0];
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges[0];
        }
        // Generating a cylinder
        if (scene.models[mIndex].type == "cylinder") {
            let center = scene.models[mIndex].center;
            let cal_VerticesAndEdges = generateCylinder(center.data[0], center.data[1], center.data[2], scene.models[mIndex].radius,
                scene.models[mIndex].height, scene.models[mIndex].sides);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices[0];
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges[0];
        }

        let canonical_Vertices = [];
        let clippedVertices = [];
        // Perspective Logic
        if (scene.view.type == 'perspective') {
            // Transform to canonical view volume
            let perspective_Canonical_Matrix = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
            // Multiply all vertices by perspective_Canonical_Matrix
            for (let i = 0; i < scene.models[mIndex].vertices.length; i++) {
                let vertex_Matrix = new Matrix(4, 1);
                vertex_Matrix.values = [[scene.models[mIndex].vertices[i].x], [scene.models[mIndex].vertices[i].y],
                [scene.models[mIndex].vertices[i].z], [scene.models[mIndex].vertices[i].w]];
                canonical_Vertices[i] = Matrix.multiply([perspective_Canonical_Matrix, scene.models[mIndex].matrix, vertex_Matrix]);
            }
        } 
        // Parallel Logic
        else if (scene.view.type == "parallel") {
            // Transform to canonical view volume
            let parallel_Canonical_Matrix = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
            // multiply all points by parallel_Canonical_Matrix
            for (let i = 0; i < scene.models[mIndex].vertices.length; i++) {
                let vertex_Matrix = new Matrix(4, 1);
                vertex_Matrix.values = [[scene.models[mIndex].vertices[i].x], [scene.models[mIndex].vertices[i].y],
                [scene.models[mIndex].vertices[i].z], [scene.models[mIndex].vertices[i].w]];
                canonical_Vertices[i] = Matrix.multiply([parallel_Canonical_Matrix, scene.models[mIndex].matrix, vertex_Matrix]);
            }
        }
        //Clipping Logic
        let index = 0;
        // Loop over all edges either passed in or generated for the given model
        for (let i = 0; i < scene.models[mIndex].edges.length; i++) {
            // Retrieve the first vertix based on the edge value passed in
            let pt0 = canonical_Vertices[scene.models[mIndex].edges[i][0]];
            for (let j = 1; j < scene.models[mIndex].edges[i].length; j++) {
                // Retrieve the second vertex based on the edge value passed in
                let pt1 = canonical_Vertices[scene.models[mIndex].edges[i][j]];
                // Create an object to pass into the line clipping method
                let line = {
                    pt0: { x: pt0.data[0], y: pt0.data[1], z: pt0.data[2] },
                    pt1: { x: pt1.data[0], y: pt1.data[1], z: pt1.data[2] }
                }
                let clipped;
                // Perspective Logic
                if (scene.view.type == "perspective") {
                    clipped = clipLinePerspective(line, -(scene.view.clip[4] / scene.view.clip[5]));
                } 
                // Parallel Logic
                else if (scene.view.type == "parallel") {
                    clipped = clipLineParallel(line);
                }
                // Convert clipped vectors to a Matrix and load into clippedVertices array
                if (clipped != null) {
                    let matrix1 = new Matrix(4, 1);
                    let matrix2 = new Matrix(4, 1);
                    matrix1.values = [[clipped.pt0.data[0]], [clipped.pt0.data[1]], [clipped.pt0.data[2]], [1]];
                    matrix2.values = [[clipped.pt1.data[0]], [clipped.pt1.data[1]], [clipped.pt1.data[2]], [1]];
                    clippedVertices[index] = matrix1;
                    index++;
                    clippedVertices[index] = matrix2;
                    index++;
                }
                // Update pt0 for next loop
                pt0 = pt1;
            }
        }

        // At this point the array contains all the lines to draw
        // NOTE: the array does contain multiple instances of the same points
        //  but did it this way to make is simpler for the drawing method

        // Multiply by M_per matrix
        // Divide x and y by w
        let readyForBufferArray = [];
        for (let i = 0; i < clippedVertices.length; i++) {
            
            let calculation;
            // Perspective Logic
            if (scene.view.type == "perspective") {
                calculation = Matrix.multiply([mat4x4MPer(), clippedVertices[i]]);
            }
            // Parallel Logic
            else if (scene.view.type == "parallel") {
                calculation = Matrix.multiply([mat4x4MPar(), clippedVertices[i]]);
            }
            // Divide by w
            let vertex_Matrix = new Matrix(4, 1);
            vertex_Matrix.values = [[calculation.data[0][0] / calculation.data[3][0]], 
            [calculation.data[1][0] / calculation.data[3][0]], [calculation.data[2][0] / 1], [1]];
            readyForBufferArray[i] = vertex_Matrix;
        }
        // Convert to 2D viewspace
        let bufferMatrix = new Matrix(4, 4);
        bufferMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
        [0, view.height / 2, 0, view.height / 2],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];
        // Draw to canvas
        for (let i = 0; i < readyForBufferArray.length; i = i + 2) {
            let calculation_Vertex_1 = Matrix.multiply([bufferMatrix, readyForBufferArray[i]]);
            let calculation_Vertex_2 = Matrix.multiply([bufferMatrix, readyForBufferArray[i + 1]]);
            drawLine(calculation_Vertex_1.data[0], calculation_Vertex_1.data[1], calculation_Vertex_2.data[0], 
                    calculation_Vertex_2.data[1]);
        }
    }
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
    // Loop until trivial accept or reject
    while (true) {
        // Trival Accept
        if (out0 == 0 && out1 == 0) {
            // Done - return p0 and p1
            result = { pt0: p0, pt1: p1 };
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
            // clip against canonical view frustum
            // left x = -1, Right x = 1
            // Bottom y = -1 Top y = 1
            // Front z = 0 Back z = -1
            let x, y, z;
            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let dz = p1.z - p0.z;
            if ((outCodeUse & LEFT) == LEFT) {
                //console.log("Clip Against Left");
                // Clip against left edge
                x = -1;
                y = p0.y + (((x) - p0.x) * (dy)) / dx;
                z = p0.z + (((x) - p0.x) * (dz)) / dx;
            } else if ((outCodeUse & RIGHT) == RIGHT) {
                //console.log("Clip Against Right");
                // Clip against right edge
                x = 1
                y = p0.y + (((x) - p0.x) * (dy)) / dx;
                z = p0.z + (((x) - p0.x) * (dz)) / dx;
            } else if ((outCodeUse & BOTTOM) == BOTTOM) {
                //console.log("Clip Against Bottom");
                // Clip against bottom edge
                y = -1
                x = p0.x + (((y) - p0.y) * (dx)) / dy;
                z = p0.z + (((y) - p0.y) * dz) / dy;
            } else if ((outCodeUse & TOP) == TOP) {
                //console.log("Clip Against Top");
                // Clip against top edge
                y = 1
                x = p0.x + (((y) - p0.y) * (dx)) / dy;
                z = p0.z + (((y) - p0.y) * dz) / dy;
            } else if ((outCodeUse & FAR) == FAR) {
                //console.log("Clip Against Far");
                // Clip against far edge
                z = -1
                y = p0.y + (((z) - p0.z) * (dy)) / dz;
                x = p0.x + (((z) - p0.z) * (dx)) / dz;
            } else if ((outCodeUse & NEAR) == NEAR) {
                //console.log("Clip Against Near");
                // Clip against near edge
                z = 0;
                y = p0.y + (((z) - p0.z) * (dy)) / dz;
                x = p0.x + (((z) - p0.z) * (dx)) / dz;
            }

            // replace point that was selected earlier and update outcode
            if (updateP0 == true) {
                // update p0
                p0 = new Vector4(x, y, z, 1);
                out0 = outcodeParallel(p0);
            } else {
                // update p1
                p1 = new Vector4(x, y, z, 1);
                out1 = outcodeParallel(p1);
            }
        }

    }

    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    // Loop until trivial accept or trivial reject
    while (true) {
        // Trival Accept
        if (out0 == 0 && out1 == 0) {
            // Done - return p0 and p1
            result = { pt0: p0, pt1: p1 };
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
            //clip: [-12, 6, -12, 6, 10, 100] 
            //(Left, Right, Bottom, Top, Near, Far)
            // clip against edge that is first indicated by the outcode
            let x, y, z, t;
            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let dz = p1.z - p0.z;
            if ((outCodeUse & LEFT) == LEFT) {
                //console.log("Clip Against Left");
                // Clip against left edge
                t = ((0 - p0.x) + p0.z) / (dx - dz);
            } else if ((outCodeUse & RIGHT) == RIGHT) {
                //console.log("Clip Against Right");
                // Clip against right edge
                t = (p0.x + p0.z) / ((0 - dx) - dz);
            } else if ((outCodeUse & BOTTOM) == BOTTOM) {
                //console.log("Clip Against Bottom");
                // Clip against bottom edge
                t = ((0 - p0.y) + p0.z) / (dy - dz);
            } else if ((outCodeUse & TOP) == TOP) {
                //console.log("Clip Against Top");
                // Clip against top edge
                t = (p0.y + p0.z) / ((0 - dy) - dz);
            } else if ((outCodeUse & FAR) == FAR) {
                //console.log("Clip Against Far");
                // Clip against far edge
                t = ((0 - p0.z) - 1) / dz;
            } else if ((outCodeUse & NEAR) == NEAR) {
                //console.log("Clip Against Near");
                // Clip against near edge
                t = (p0.z - z_min) / (0 - dz);
            }
            // Can use all three in every calculation due to
            // the other two recalculating the points that
            // are already associated with the vector while the 
            // third equation generates the new value of the vertex.  
            x = (1 - t) * p0.x + t * p1.x;
            y = (1 - t) * p0.y + t * p1.y;
            z = (1 - t) * p0.z + t * p1.z;
            // replace point that was selected earlier and update outcode
            if (updateP0 == true) {
                // update p0
                p0 = new Vector4(x, y, z, 1);
                out0 = outcodePerspective(p0, z_min);
            } else {
                // update p1
                p1 = new Vector4(x, y, z, 1);
                out1 = outcodePerspective(p1, z_min);
            }
        }
    }
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {

    // PRP
    let floatPRP_1 = parseFloat(scene.view.prp.data[0][0]);
    let floatPRP_2 = parseFloat(scene.view.prp.data[1][0]);
    let floatPRP_3 = parseFloat(scene.view.prp.data[2][0]);
    // SRP
    let floatSRP_1 = parseFloat(scene.view.srp.data[0][0]);
    let floatSRP_2 = parseFloat(scene.view.srp.data[1][0]);
    let floatSRP_3 = parseFloat(scene.view.srp.data[2][0]);
    // N_AXIS
    let normalized_N = new Vector3(floatPRP_1 - floatSRP_1, floatPRP_2 - floatSRP_2, floatPRP_3 - floatSRP_3);
    normalized_N.normalize();
    // U_AXIS
    let vup_vector = new Vector3(scene.view.vup.data[0][0], scene.view.vup.data[1][0], scene.view.vup.data[2][0]);
    let cross = vup_vector.cross(normalized_N);
    let normalized_U = new Vector3(cross.data[0][0], cross.data[1][0], cross.data[2][0]);
    normalized_U.normalize();
    // Calculate V where srp remains what it is and prp is at origin
    // is normalized n crossed by the normalized u

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) + parseFloat(normalized_U.data[0][0])];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) + parseFloat(normalized_U.data[1][0])];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) + parseFloat(normalized_U.data[2][0])];
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) - parseFloat(normalized_U.data[0][0])];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) - parseFloat(normalized_U.data[1][0])];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) - parseFloat(normalized_U.data[2][0])];
            break;
        case 65: // A key
            console.log("A");
            scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) + parseFloat(normalized_U.data[0] / 2)];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) + parseFloat(normalized_U.data[1] / 2)];
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) + parseFloat(normalized_U.data[0] / 2)];
            scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) + parseFloat(normalized_U.data[1] / 2)];
            scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) + parseFloat(normalized_U.data[2] / 2)];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) + parseFloat(normalized_U.data[2] / 2)];
            break;
        case 68: // D key
            console.log("D");
            scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) - parseFloat(normalized_U.data[0]) / 2];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) - parseFloat(normalized_U.data[1]) / 2];
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) - parseFloat(normalized_U.data[0]) / 2];
            scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) - parseFloat(normalized_U.data[1]) / 2];
            scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) - parseFloat(normalized_U.data[2]) / 2];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) - parseFloat(normalized_U.data[2]) / 2];
            break;
        case 80: // p key -- Extra functionality where it allows the points to be drawn or not drawn
            points = !points;
            break;
        case 82: // R key for rotations -- Extra functionality where it allows the animation to be stopped or started
            animation = !animation;
            break;
        case 83: // S key
            console.log("S");
            scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) + parseFloat(normalized_N.data[0]) / 2];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) + parseFloat(normalized_N.data[1]) / 2];
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) + parseFloat(normalized_N.data[0]) / 2];
            scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) + parseFloat(normalized_N.data[1]) / 2];
            scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) + parseFloat(normalized_N.data[2]) / 2];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) + parseFloat(normalized_N.data[2]) / 2];
            break;
        case 87: // W key
            console.log("W");
            scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) - parseFloat(normalized_N.data[0]) / 2];
            scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) - parseFloat(normalized_N.data[1]) / 2];
            scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) - parseFloat(normalized_N.data[0]) / 2];
            scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) - parseFloat(normalized_N.data[1]) / 2];
            scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) - parseFloat(normalized_N.data[2]) / 2];
            scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) - parseFloat(normalized_N.data[2]) / 2];
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
    console.log(scene.view.type)

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
    condition = true;
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    if (points == true) {
        ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
        ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
    }
}

// Generate a cube based the center, height, depth, and width
function generateCube(cnt_x, cnt_y, cnt_z, sideHeight, sideDepth, sideWidth) {
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);
    let halfOfHeight = sideHeight / 2;
    let halfOfDepth = sideDepth / 2;
    let halfOfWidth = sideWidth / 2;
    let cube = {
        vertices: [
            // looking straight at cube so only one face is visible
            // Top left front
            Vector4(centerX - halfOfWidth, centerY + halfOfHeight, centerZ + halfOfDepth, 1),
            // Top right front
            Vector4(centerX + halfOfWidth, centerY + halfOfHeight, centerZ + halfOfDepth, 1),
            // Bottom right front
            Vector4(centerX + halfOfWidth, centerY - halfOfHeight, centerZ + halfOfDepth, 1),
            //Bottom Left Front
            Vector4(centerX - halfOfWidth, centerY - halfOfHeight, centerZ + halfOfDepth, 1),
            // Top Left Back
            Vector4(centerX - halfOfWidth, centerY + halfOfHeight, centerZ - halfOfDepth, 1),
            // Top Right Back
            Vector4(centerX + halfOfWidth, centerY + halfOfHeight, centerZ - halfOfDepth, 1),
            // Bottom Right Back
            Vector4(centerX + halfOfWidth, centerY - halfOfHeight, centerZ - halfOfDepth, 1),
            // Bottom Left Back
            Vector4(centerX - halfOfWidth, centerY - halfOfHeight, centerZ - halfOfDepth, 1),
        ],
        // generate the edges
        edges: [
            // Front plane
            [0, 1, 2, 3, 0],
            // Back plane
            [4, 5, 6, 7, 4],
            // lines connecting front and back planes
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7]
        ]
    };
    return cube;
}
// Generate a cone given the center, radius, height, and number of sides. 
function generateCone(cnt_x, cnt_y, cnt_z, radius, height, sides) {
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);
    // Calculate peak of cone
    let centerTopVertex = Vector4(centerX, centerY, centerZ + (height / 2), 1);
    let verticesArray = [centerTopVertex];
    // Calculate the base of the cone
    let radii = 0;
    for (let i = 1; i < sides + 1; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[i] = Vector4(x, y, centerZ - (height / 2), 1);
    }
    // Generate all edges between all vertecies
    let edges = [];
    for (let i = 0; i < sides; i++) {
        edges[i] = [0, i + 1];
    }
    let index = edges.length;
    for (let i = 1; i < sides; i++) {
        edges[index] = [i, i + 1];
        index++;
    }
    edges[edges.length] = [1, sides];
    // Wrap in object to pass to calling function
    let cone = {
        vertices: [
            verticesArray
        ],
        edges: [
            edges
        ]
    };
    return cone;
}
// Generate a Cylinder given the center, radius, height, and sides
function generateCylinder(cnt_x, cnt_y, cnt_z, radius, height, sides) {
    
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);
    // Generate the bottom base of the cylinder
    let verticesArray = [];
    let verticesindex = 0;
    let radii = 0;
    for (let i = 0; i < sides; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[verticesindex] = Vector4(x, y, centerZ - (height / 2), 1);
        verticesindex++;
    }
    // Generate the top base of the cylinder
    for (let i = 0; i < sides; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[verticesindex] = Vector4(x, y, centerZ + (height / 2), 1);
        verticesindex++;
    }
    // Generate all edges to connect the top and bottom bases 
    let edges = [];
    let edgesIndex = 0;
    // For loop connecting the bottom circle vertexes
    for (let i = 0; i < sides - 1; i++) {
        edges[edgesIndex] = [i, i + 1];
        edgesIndex++;
    }
    // For loop connecting the top circle vertexes
    edges[edgesIndex] = [0, sides - 1];
    edgesIndex++;
    for (let i = 0; i < sides - 1; i++) {
        edges[edgesIndex] = [i + sides, i + sides + 1];
        edgesIndex++;
    }
    edges[edgesIndex] = [sides, edgesIndex];
    edgesIndex++;
    // For loop connecting every vertex to the top and bottom bases
    for (let i = 0; i < sides; i++) {
        edges[edgesIndex] = [i, i + sides];
        edgesIndex++;
    }
    // Wrap in object to pass to calling function
    let cylinder = {
        vertices: [
            verticesArray
        ],
        // generate the edges
        edges: [
            edges
        ]
    };
    return cylinder;
}
// Generate a sphere given the center, radius, slices (longitude lines on a globe),
// and stacks (latitude lines on a globe).
function generateSphere(cnt_x, cnt_y, cnt_z, radius, slices, stacks) {
    // slices -> think number of logitude lines on a globe -180 to 180 degrees
    // stacks -> think number of latitude lines on a globe 90 to -90 degrees
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);
    let verticesArray = []
    let edges = []
    let phi = 360.0 / slices;
    let theta = 180.0 / stacks;
    let degToRad = 1 / 180.0 * Math.PI;
    let longitude = 0, latitude = 0;
    let verticesIndex = 0;
    // Generate all vertices 
    for (let i = 0; i < slices; i++) {
        latitude = latitude + phi;
        for (let j = 0; j < stacks; j++) {
            longitude = longitude + theta;
            let x = centerX + radius * Math.sin(longitude * degToRad) * Math.sin(latitude * degToRad);
            let y = centerY + radius * Math.cos(longitude * degToRad);
            let z = centerZ + radius * Math.sin(longitude * degToRad) * Math.cos(latitude * degToRad);
            let vertex = new Vector4(x, y, z, 1);
            verticesArray[verticesIndex] = vertex;
            verticesIndex++;
        }
    }
    let edgesIndex = 0;
    // generage the edges - there will be slices + stacks of vertices
    for (let i = 0; i < slices * stacks - 1; i++) {
        edges[edgesIndex] = [i, i + 1];
        edgesIndex++;
    }
    edges[edgesIndex] = [0, edgesIndex];
    
    //edges[edgesIndex] = [120,6];
    //edgesIndex++;
    //edges[edgesIndex] = [120,230];
    //edgesIndex++;
    //edges[edgesIndex] = [230,88];
    //edgesIndex++
    //edges[edgesIndex] = [88,198];
    //edgesIndex++;
    
    // Wrap in object to pass to calling function
    let sphereobject = {
        vertices: [
            verticesArray
        ],
        edges: [
            edges
        ]
    };
    return sphereobject;

}


// Previous Commit
/*
// New Commit
let view;
let ctx;
let scene;
let start_time;
let update;

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
    //loadNewScene();
    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            //prp: Vector3(0, 10, -5),
            //srp: Vector3(20, 15, -40),
            //vup: Vector3(1, 1, 0),
            //clip: [-12, 6, -12, 6, 10, 100]
            // subtract from x and add to z to shift to left
            // add to x and subtract from z to shift to right

            //34+20 >>>>> -6-20
            //10+20 >>>>> -30-20
            prp: Vector3(40, 10, 0),
            srp: Vector3(30, 10, -19),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]

            //prp: Vector3(10, 9, 10),
            //srp: Vector3(10, 9, -10),
            //vup: Vector3(0, 1, 0),
            //clip: [-11, 11, -11, 11, 30, 100]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    //Vector4(0, 0, -30, 1),
                    //Vector4(10, 0, -30, 1),
                    //Vector4(10, 10, -30, 1),
                    //Vector4(0, 10, -30, 1),
                    //Vector4(0, 10, -50, 1),
                    //Vector4(0, 0, -50, 1),
                    //Vector4(10, 0, -50, 1),
                    //Vector4(10, 10, -50, 1)

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
                    //[0, 1, 2, 3, 0],
                    //[4, 5, 6, 7, 4],
                    //[0, 5],
                    //[1, 6],
                    //[2, 7],
                    //[3, 4]
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
    // converted to per second
    console.log(time/1000);
    // step 2: transform models based on time
    // TODO: implement this!
    if (Math.round(time/100)%1 == 0) {
       // mat4x4RotateX(scene.models[0].matrix,Math.round(time/100));
    }

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
     window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    ctx.clearRect(0, 0, view.width, view.height);
    // loop over all models in the scene
    //console.log(scene.models.length)
    //console.log(scene)
    for (let mIndex = 0; mIndex < scene.models.length; mIndex++) {
        //mat4x4Scale(scene.models[mIndex].matrix,0.5,0.5,0.5);
        // if none of the special conditions are executed the generic stuff will be passed on to the remaining functions
        if (scene.models[mIndex].type == "cube") {
            let center = scene.models[mIndex].center;
            //console.log(center)
            let cal_VerticesAndEdges = generateCube(center.data[0], center.data[1], center.data[2],
                scene.models[mIndex].depth, scene.models[mIndex].height, scene.models[mIndex].depth);
            //console.log(cal_VerticesAndEdges.vertices)  
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices;
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges;
            //mat4x4RotateY(scene.models[mIndex].matrix,90);
            //console.log(scene)
        }
        if (scene.models[mIndex].type == "cone") {
            let center = scene.models[mIndex].center;
            //generateCone(cnt_x, cnt_y, cnt_z, radius, height, sides)
            let cal_VerticesAndEdges = generateCone(center.data[0], center.data[1], center.data[2], scene.models[mIndex].radius,
                scene.models[mIndex].height, scene.models[mIndex].sides);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices[0];
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges[0];
            //console.log(scene.models[mIndex].matrix)
            //mat4x4RotateY(scene.models[mIndex].matrix, 90) 
            //console.log(scene)
        }
        if (scene.models[mIndex].type == "sphere") {
            // handle sphere edge and vertex placement here
        }
        if (scene.models[mIndex].type == "cylinder") {
            // handle cylinder edge and vertex placement here
            let center = scene.models[mIndex].center;
            //generateCylinder(cnt_x, cnt_y, cnt_z, radius, height, sides)
            let cal_VerticesAndEdges = generateCylinder(center.data[0], center.data[1], center.data[2], scene.models[mIndex].radius,
                scene.models[mIndex].height, scene.models[mIndex].sides);
            scene.models[mIndex].vertices = cal_VerticesAndEdges.vertices[0];
            scene.models[mIndex].edges = cal_VerticesAndEdges.edges[0];
            //console.log(scene.models[mIndex].matrix)
            //mat4x4RotateY(scene.models[mIndex].matrix, 90) 
            //console.log(scene)
        }

       // console.log(scene.models[mIndex])
        let canonical_Vertices = [];
        let clippedVerticies = [];
        //console.log(scene.view.type)
        if (scene.view.type == 'perspective') {
            console.log('perspective')
            // Transform to canonical view volume
            let perspective_Canonical_Matrix = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
            // multiply all points by perspective_Canonical_Matrix

            for (let i = 0; i < scene.models[mIndex].vertices.length; i++) {
                let vertex_Matrix = new Matrix(4, 1);
                vertex_Matrix.values = [[scene.models[mIndex].vertices[i].x], [scene.models[mIndex].vertices[i].y],
                [scene.models[mIndex].vertices[i].z], [scene.models[mIndex].vertices[i].w]];
                canonical_Vertices[i] = Matrix.multiply([perspective_Canonical_Matrix, scene.models[mIndex].matrix, vertex_Matrix]);
            }
            //console.log(canonical_Vertices)
        } else if (scene.view.type == "parallel") {
            console.log("parallel")
            // Transform to canonical view volume
            let parallel_Canonical_Matrix = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
            // multiply all points by parallel_Canonical_Matrix
            for (let i = 0; i < scene.models[mIndex].vertices.length; i++) {
                let vertex_Matrix = new Matrix(4, 1);
                vertex_Matrix.values = [[scene.models[mIndex].vertices[i].x], [scene.models[mIndex].vertices[i].y],
                [scene.models[mIndex].vertices[i].z], [scene.models[mIndex].vertices[i].w]];
                canonical_Vertices[i] = Matrix.multiply([parallel_Canonical_Matrix, scene.models[mIndex].matrix, vertex_Matrix]);
            }
        }
        // Go throught all lines and clip where necessary 
        //console.log(scene.models[0].edges.length)

        let index = 0;
        //console.log(scene.models[mIndex].type)
        for (let i = 0; i < scene.models[mIndex].edges.length; i++) {
            //console.log(canonical_Vertices[scene.models[mIndex].edges[i][0]])
            let pt0 = canonical_Vertices[scene.models[mIndex].edges[i][0]];

            for (let j = 1; j < scene.models[mIndex].edges[i].length; j++) {
                let pt1 = canonical_Vertices[scene.models[mIndex].edges[i][j]];
                //console.log(pt0)
                //console.log(pt1)
                let line = {
                    pt0: { x: pt0.data[0], y: pt0.data[1], z: pt0.data[2] },
                    pt1: { x: pt1.data[0], y: pt1.data[1], z: pt1.data[2] }
                }
                //      console.log(scene.models[0].edges[i][j])
                let clipped;
                if (scene.view.type == "perspective") {
                    clipped = clipLinePerspective(line, -(scene.view.clip[4] / scene.view.clip[5]));
                } else if (scene.view.type == "parallel") {
                    clipped = clipLineParallel(line);
                }
                //console.log("afterclipping")

                if (clipped != null) {
                    let matrix1 = new Matrix(4, 1);
                    let matrix2 = new Matrix(4, 1);
                    matrix1.values = [[clipped.pt0.data[0]], [clipped.pt0.data[1]], [clipped.pt0.data[2]], [1]];
                    matrix2.values = [[clipped.pt1.data[0]], [clipped.pt1.data[1]], [clipped.pt1.data[2]], [1]];
                    clippedVerticies[index] = matrix1;
                    index++;
                    clippedVerticies[index] = matrix2;
                    index++;
                }
                pt0 = pt1;
            }
        }

        //console.log(canonical_Vertices)

        // At this point the array contains all the lines to draw
        // NOTE: the array does contain multiple instances of the same points
        //  but did it this way to make is simpler for the drawing method
        //console.log(clippedVerticies)
        // Multiply by M_per matrix
        // Divide x and y by w
        let readyForBufferArray = [];
        for (let i = 0; i < clippedVerticies.length; i++) {
            let vertex_Matrix = new Matrix(4, 1);
            vertex_Matrix.values = [[clippedVerticies[i].data[0][0]], [clippedVerticies[i].data[1][0]],
            [clippedVerticies[i].data[2][0]], [clippedVerticies[i].data[3][0]]];
            let calculation;
            if (scene.view.type == "perspective") {
                calculation = Matrix.multiply([mat4x4MPer(), vertex_Matrix]);
            }
            else if (scene.view.type == "parallel") {
                calculation = Matrix.multiply([mat4x4MPar(), vertex_Matrix]);
            }
            
            vertex_Matrix.values = [[calculation.data[0][0] / calculation.data[3][0]], [calculation.data[1][0] / calculation.data[3][0]], [calculation.data[2][0] / 1], [1]];
            //console.log(vertex_Matrix)
            readyForBufferArray[i] = vertex_Matrix;
        }
        //console.log(readyForBufferArray)
        // Convert to 2D viewspace
        let toDraw = [];
        let bufferMatrix = new Matrix(4, 4);
        bufferMatrix.values = [[view.width / 2, 0, 0, view.width / 2],
        [0, view.height / 2, 0, view.height / 2],
        [0, 0, 1, 0],
        [0, 0, 0, 1]];

        for (let i = 0; i < readyForBufferArray.length; i = i + 2) {
            let calculation_Vertex_1 = Matrix.multiply([bufferMatrix, readyForBufferArray[i]]);
            let calculation_Vertex_2 = Matrix.multiply([bufferMatrix, readyForBufferArray[i + 1]]);
            //console.log(calculation_Vertex_1)
            //console.log(calculation_Vertex_2)
            //console.log(calculation_Vertex_1.data[0]+":"+calculation_Vertex_1.data[1]);
            //console.log(calculation_Vertex_2.data[0]+":"+calculation_Vertex_2.data[1]);
            // toDraw[i] = calculation;
            //drawLine(x1, y1, x2, y2);
            drawLine(calculation_Vertex_1.data[0], calculation_Vertex_1.data[1], calculation_Vertex_2.data[0], calculation_Vertex_2.data[1]);
        }
        //console.log(toDraw)


        // TODO: implement drawing here!
        // For each model, for each edge
        //  * transform to canonical view volume
        //  * clip in 3D
        //  * project to 2D
        //  * draw line
    }
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
   // return {pt0:p0, pt1:p1};
    while (true) {
        // console.log(out0);
        //console.log(out1);
        //console.log(out0 | out1);
        // console.log((out0 & out1));
        // Trival Accept
        if (out0 == 0 && out1 == 0) {
            // Done - return p0 and p1
            result = { pt0: p0, pt1: p1 };
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

            /*
            NOTES: 
            1. Calculate x,y,and z values based on each condition
            2. Simpler than perspective line clipping
            3. Exactly like 2D version of the algorithm

            NOTE: have x, y, and zs for particular conditions just need to calculate the other two properties for each condition
            */
            // clip against canonical view frustum
            // left x = -1, Right x = 1
            // Bottom y = -1 Top y = 1
            // Front z = 0 Back z = -1
        
            let x, y, z, t;
            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let dz = p1.z - p0.z;
            //console.log(outCodeUse)
            if ((outCodeUse & LEFT) == LEFT) {
                //console.log("Clip Against Left");
                // Clip against left edge
                x = -1;
                y = p0.y + (((x)-p0.x) * (dy))/dx;
                z = p0.z + (((x)-p0.x) * (dz))/dx;

            } else if ((outCodeUse & RIGHT) == RIGHT) {
                //console.log("Clip Against Right");
                // Clip against right edge
                x = 1
                y = p0.y + (((x)-p0.x) * (dy))/dx;
                z = p0.z + (((x)-p0.x) * (dz))/dx;

            } else if ((outCodeUse & BOTTOM) == BOTTOM) {
                //console.log("Clip Against Bottom");
                // Clip against bottom edge
                y = -1
                x = p0.x + (((y) - p0.y) * (dx)) / dy;
                z = p0.z + (((y) - p0.y) * dz) / dy;

            } else if ((outCodeUse & TOP) == TOP) {
                //console.log("Clip Against Top");
                // Clip against top edge
                y = 1
                x = p0.x + (((y) - p0.y) * (dx)) / dy;
                z = p0.z + (((y) - p0.y) * dz) / dy;

            } else if ((outCodeUse & FAR) == FAR) {
                //console.log("Clip Against Far");
                // Clip against far edge
                z = -1
                y = p0.y + (((z)-p0.z) * (dy))/dz;
                x = p0.x + (((z)-p0.z) * (dx))/dz;

            } else if ((outCodeUse & NEAR) == NEAR) {
                //console.log("Clip Against Near");
                // Clip against near edge
                z = 0;
                y = p0.y + (((z)-p0.z) * (dy))/dz;
                x = p0.x + (((z)-p0.z) * (dx))/dz;
            }


            // replace point that was selected earlier and update outcode
            if (updateP0 == true) {
                // update p0
                //console.log(x);
                //console.log(y)
                //console.log(z)
                p0 = new Vector4(x, y, z, 1);
                out0 = outcodeParallel(p0);
                //console.log("P0: " + p0.x + ":" + p0.y + ":" + p0.z + " outcode: " + out0);
            } else {
                // update p1
                p1 = new Vector4(x, y, z, 1);
                out1 = outcodeParallel(p1);
                //console.log("P1: " + p1.x + ":" + p1.y + ":" + p1.z + " outcode: " + out1);
            }
        }

    }

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
    //console.log(line.pt0.x +":"+ line.pt0.y +":"+ line.pt0.z);

    while (true) {
        // console.log(out0);
        //console.log(out1);
        //console.log(out0 | out1);
        // console.log((out0 & out1));
        // Trival Accept
        if (out0 == 0 && out1 == 0) {
            // Done - return p0 and p1
            result = { pt0: p0, pt1: p1 };
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
            //console.log(outCodeUse)
            if ((outCodeUse & LEFT) == LEFT) {
                //console.log("Clip Against Left");
                // Clip against left edge
                t = ((0 - p0.x) + p0.z) / (dx - dz);
            } else if ((outCodeUse & RIGHT) == RIGHT) {
                //console.log("Clip Against Right");
                // Clip against right edge
                t = (p0.x + p0.z) / ((0 - dx) - dz);
            } else if ((outCodeUse & BOTTOM) == BOTTOM) {
                //console.log("Clip Against Bottom");
                // Clip against bottom edge
                t = ((0 - p0.y) + p0.z) / (dy - dz);
            } else if ((outCodeUse & TOP) == TOP) {
                //console.log("Clip Against Top");
                // Clip against top edge
                t = (p0.y + p0.z) / ((0 - dy) - dz);
            } else if ((outCodeUse & FAR) == FAR) {
                //console.log("Clip Against Far");
                // Clip against far edge
                t = ((0 - p0.z) - 1) / dz;
            } else if ((outCodeUse & NEAR) == NEAR) {
                //console.log("Clip Against Near");
                // Clip against near edge
                t = (p0.z - z_min) / (0 - dz);
            }
            x = (1 - t) * p0.x + t * p1.x;
            y = (1 - t) * p0.y + t * p1.y;
            z = (1 - t) * p0.z + t * p1.z;
            //console.log("X: " + x);
            //console.log("Y: " + y);
            // console.log("Z: " + z);
            //console.log("afteroutcodes")
            // replace point that was selected earlier and update outcode
            if (updateP0 == true) {
                // update p0
                p0 = new Vector4(x, y, z, 1);
                out0 = outcodePerspective(p0, z_min);
                //console.log("P0: " + p0.x + ":" + p0.y + ":" + p0.z + " outcode: " + out0);
            } else {
                // update p1
                p1 = new Vector4(x, y, z, 1);
                out1 = outcodePerspective(p1, z_min);
                //console.log("P1: " + p1.x + ":" + p1.y + ":" + p1.z + " outcode: " + out1);
            }
        }

    }

    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {

    /*
    Simple vector math
    1) calculate u and n and subtract or add by prp and srp
    )) revisit vector math videos for u and n axis calculations
    */
    // Convert x,y,z values associated with prp to u,v,n values
    // N_AXIS
    let floatPRP_1 = parseFloat(scene.view.prp.data[0][0])/8;
    let floatPRP_2 = parseFloat(scene.view.prp.data[1][0])/8;
    let floatPRP_3 = parseFloat(scene.view.prp.data[2][0])/8;

    let floatSRP_1 = parseFloat(scene.view.srp.data[0][0])/8;
    let floatSRP_2 = parseFloat(scene.view.srp.data[1][0])/8;
    let floatSRP_3 = parseFloat(scene.view.srp.data[2][0])/8;

    let normalized_N = new Vector3(floatPRP_1-floatSRP_1,floatPRP_2-floatSRP_2,floatPRP_3-floatSRP_3);
    normalized_N.normalize();
    let vup_vector = new Vector3(scene.view.vup.data[0][0], scene.view.vup.data[1][0], scene.view.vup.data[2][0]);
    let cross = vup_vector.cross(normalized_N);
    let normalized_U = new Vector3(cross.data[0][0], cross.data[1][0], cross.data[2][0]);
    normalized_U.normalize();
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 65: // A key
            console.log("A");
                scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) + parseFloat(normalized_U.data[0])];
                scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) + parseFloat(normalized_U.data[1])];                
                scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) + parseFloat(normalized_U.data[0])];
                scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) + parseFloat(normalized_U.data[1])];
                scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) + parseFloat(normalized_U.data[2])];
                scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) + parseFloat(normalized_U.data[2])];
            break;
        case 68: // D key
            console.log("D"); 
                scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) - parseFloat(normalized_U.data[0])];
                scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) - parseFloat(normalized_U.data[1])];  
                scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) - parseFloat(normalized_U.data[0])];
                scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) - parseFloat(normalized_U.data[1])];
                scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) - parseFloat(normalized_U.data[2])];
                scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) - parseFloat(normalized_U.data[2])];
            break;
        case 83: // S key
            console.log("S");
                scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) + parseFloat(normalized_N.data[0])];
                scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) + parseFloat(normalized_N.data[1])];                
                scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) + parseFloat(normalized_N.data[0])];
                scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) + parseFloat(normalized_N.data[1])];
                scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) + parseFloat(normalized_N.data[2])];
                scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) + parseFloat(normalized_N.data[2])];
                //console.log(scene.view.prp.data[0]);
            break;
        case 87: // W key
            console.log("W");
                scene.view.prp.data[0] = [parseFloat(scene.view.prp.data[0]) - parseFloat(normalized_N.data[0])];
                scene.view.srp.data[1] = [parseFloat(scene.view.srp.data[1]) - parseFloat(normalized_N.data[1])];                
                scene.view.srp.data[0] = [parseFloat(scene.view.srp.data[0]) - parseFloat(normalized_N.data[0])];
                scene.view.prp.data[1] = [parseFloat(scene.view.prp.data[1]) - parseFloat(normalized_N.data[1])];
                scene.view.prp.data[2] = [parseFloat(scene.view.prp.data[2]) - parseFloat(normalized_N.data[2])];
                scene.view.srp.data[2] = [parseFloat(scene.view.srp.data[2]) - parseFloat(normalized_N.data[2])];
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
    console.log(scene.view.type)

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

// NOTE: something weird is going on with the cube (there is 8 units away from each vertex)
// but the cube is still coming up with a rectangle type shape
function generateCube(cnt_x, cnt_y, cnt_z, sideHeight, sideDepth, sideWidth) {
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);
    let halfOfHeight = sideHeight / 2;
    let halfOfDepth = sideDepth / 2;
    let halfOfWidth = sideWidth / 2;
    // console.log(halfOfDepth)
    // console.log(halfOfHeight)
    // console.log(halfOfWidth)
    // console.log(centerX)
    //console.log(centerY)
    //console.log(centerZ)
    //console.log(sideHeight)
    //console.log(sideDepth)
    let cube = {
        vertices: [
            // looking straight at cube so only one face is visible
            // Top left front
            Vector4(centerX - halfOfWidth, centerY + halfOfHeight, centerZ + halfOfDepth, 1),
            // Top right front
            Vector4(centerX + halfOfWidth, centerY + halfOfHeight, centerZ + halfOfDepth, 1),
            // Bottom right front
            Vector4(centerX + halfOfWidth, centerY - halfOfHeight, centerZ + halfOfDepth, 1),
            //Bottom Left Front
            Vector4(centerX - halfOfWidth, centerY - halfOfHeight, centerZ + halfOfDepth, 1),
            // Top Left Back
            Vector4(centerX - halfOfWidth, centerY + halfOfHeight, centerZ - halfOfDepth, 1),
            // Top Right Back
            Vector4(centerX + halfOfWidth, centerY + halfOfHeight, centerZ - halfOfDepth, 1),
            // Bottom Right Back
            Vector4(centerX + halfOfWidth, centerY - halfOfHeight, centerZ - halfOfDepth, 1),
            // Bottom Left Back
            Vector4(centerX - halfOfWidth, centerY - halfOfHeight, centerZ - halfOfDepth, 1),
        ],
        // generate the edges
        edges: [
            // Front plane
            [0, 1, 2, 3, 0],
            // Back plane
            [4, 5, 6, 7, 4],
            // lines connecting front and back planes
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7]
        ]
    };
    return cube;
}
// need to figure out how to project so cone does not look sideways
function generateCone(cnt_x, cnt_y, cnt_z, radius, height, sides) {
    // sides relate to how many vertexes there are
    // total number of vertexes are sides+1
    // top point vertex can be found by adding half of height to the center points
    // center of polygon that makes the base of a cone can be found by subtracting
    //      half the height from the center 
    //      -- base on this point we then divide radius by sides and calculate
    //         the vertexes similar to first assignment
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);

    let centerTopVertex = Vector4(centerX, centerY, centerZ + (height / 2), 1);
    //let centerOfBase = Vector4(centerX, centerY, centerZ-(height/2),1);

    let verticesArray = [centerTopVertex];
    let radii = 0;
    for (let i = 1; i < sides + 1; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[i] = Vector4(x, y, centerZ - (height / 2), 1);
    }
    let edges = [];
    for (let i = 0; i < sides; i++) {
        edges[i] = [0, i + 1];
    }
    let index = edges.length;
    for (let i = 1; i < sides; i++) {
        edges[index] = [i, i + 1];
        index++;
    }
    edges[edges.length] = [1, sides];
    //console.log(edges)
    //console.log(centerOfBase)
    //console.log(centerTopVertex)
    //console.log(verticesArray);
    let cone = {
        vertices: [
            verticesArray
        ],
        // generate the edges
        edges: [
            edges
        ]
    };
    return cone;
}

function generateCylinder(cnt_x, cnt_y, cnt_z, radius, height, sides) {
    // similar to cone just second step with top and bottom of shape
    // sides relate to how many vertexes there are
    // total number of vertexes are sides+1
    // top point vertex can be found by adding half of height to the center points
    // center of polygon that makes the base of a cone can be found by subtracting
    //      half the height from the center 
    //      -- base on this point we then divide radius by sides and calculate
    //         the vertexes similar to first assignment
    let centerX = parseFloat(cnt_x);
    let centerY = parseFloat(cnt_y);
    let centerZ = parseFloat(cnt_z);

    //let centerTopVertex = Vector4(centerX, centerY, centerZ + (height / 2), 1);
    //let centerOfBase = Vector4(centerX, centerY, centerZ-(height/2),1);

    let verticesArray = [];
    let verticesindex = 0; 
    let radii = 0;
    for (let i = 0; i < sides; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[verticesindex] = Vector4(x, y, centerZ - (height / 2), 1);
        verticesindex++;
    }
    for (let i = 0; i < sides; i++) {
        let x = centerX + radius * Math.cos(radii);
        let y = centerY + radius * Math.sin(radii);
        // Update radii to point to next x and y
        radii = radii + (360 / sides) * Math.PI / 180;
        verticesArray[verticesindex] = Vector4(x, y, centerZ + (height / 2), 1);
        verticesindex++;
    }
    // need to have edges where I connect all the sides on the top and bottom
    // while also connecting each particular on the top shape to the bottom shape
    let edges = [];
    // all the vertices are stored where the bottom circle vertices are stored first and 
    // then the bottom circle vertices are stored second -> stored from 0 -> sides
    // for loop connecting the bottom circle vertexes -> stored from sides-1 to sides
    let edgesIndex = 0;
    for (let i = 0; i < sides-1; i++) {
        edges[edgesIndex] = [i,i+1];
        edgesIndex++;
    }
    // for loop connecting the top circle vertexes
    edges[edgesIndex] = [0,sides-1];
    edgesIndex++; 
    for (let i = 0; i < sides-1; i++) {
        edges[edgesIndex] = [i+sides, i+sides+1];
        edgesIndex++; 
    }
    edges[edgesIndex] = [sides, edgesIndex];
    edgesIndex++; 
    // for loop connecting every vertex to the top and bottom circles
    for (let i = 0; i < sides; i++) {
        edges[edgesIndex] = [i,i+sides];
        edgesIndex++; 
    }

    //console.log(edges)
    //console.log(centerOfBase)
    //console.log(centerTopVertex)
    //console.log(verticesArray);
    let cylinder = {
        vertices: [
            verticesArray
        ],
        // generate the edges
        edges: [
            edges
        ]
    };
    return cylinder;
}

function generateSphere(cnt_x, cnt_y, cnt_z, radiys, slices, stacks) {
    // slices -> think number of logitude lines on a globe
    // stacks -> think number of latitude lines on a globe
}
/*
