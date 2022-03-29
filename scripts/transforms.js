// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. translate near clipping plane to origin
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])

    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let transform_Matrix = new Matrix(4,4);
    transform_Matrix.values = [[1,0,0,0-prp.x],
                               [ 0,1,0,0-prp.y],
                               [ 0,0,1,0-prp.z],
                               [ 0,0,0,   1  ]]; 
    
    // Convert x,y,z values associated with prp to u,v,n values
    // N_AXIS
    let prp_vector = new Vector(prp);
    let unNormalized_N = prp_vector.subtract(srp)
    let normalized_N = new Vector(unNormalized_N);
    normalized_N.normalize();
    //console.log(normalized_N);
    //console.log(unNormalized_N);
    // U_AXIS
    let vup_vector = new Vector(vup);
    let normalized_U = new Vector(vup_vector.cross(normalized_N));
    normalized_U.normalize();
    //V_AXIS
    let v_vector = new Vector(normalized_N.cross(normalized_U));
        
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let rotate_Matrix = new Matrix(4,4);
    rotate_Matrix.values = [[normalized_U.x, normalized_U.y,  normalized_U.z,0],
                            [ v_vector.x, v_vector.y, v_vector.z ,0],
                            [ normalized_N.x,     normalized_N.y,      normalized_N.z,    0],
                            [     0,              0,               0,         1]];
    //console.log(normalized_U);
    //console.log(normalized_N);
    //console.log(v_vector);
    // 3. shear such that CW is on the z-axis
    let cw = new Vector3((clip[0]+clip[1])/2, (clip[2]+clip[3])/2, -clip[4]);
    let dop = new Vector(cw);
    // DOP for now is same as cw because PRP in general case is at [0,0,0]
    let sh_X_Shear = (0-dop.x)/dop.z;
    let sh_Y_Shear = (0-dop.y)/dop.z;

    let shear_Matrix = new Matrix(4,4);
    shear_Matrix.values = [[1,0,sh_X_Shear,0],
                           [0,1,sh_Y_Shear,0],
                           [0,0,     1,    0],
                           [0,0,     0,    1]];
    //console.log(sh_X_Shear);
    //console.log(sh_Y_Shear);

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let s_X = (2*clip[4])/((clip[1]-clip[0])*clip[5]);
    let s_Y = (2*clip[4])/((clip[3]-clip[2])*clip[5]);
    let s_Z = 1/clip[5];

    //console.log(s_X);
    //console.log(s_Y);
    //console.log(s_Z);
    let scale_Matrix = new Matrix(4,4);
    scale_Matrix.values = [[s_X, 0,  0,  0],
                           [ 0, s_Y, 0,  0],
                           [ 0,  0, s_Z, 0], 
                           [ 0,  0,  0,  1]];

    // ...
    let transform = Matrix.multiply([scale_Matrix, shear_Matrix, rotate_Matrix, transform_Matrix]);
    //console.log(transform);
    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    // mpar.values = ...;
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1,0, 0,0],
                   [0,1, 0,0],
                   [0,0, 1,0],
                   [0,0,-1,0]];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
     mat4x4.values = [[1,0,0,tx],
                      [0,1,0,ty],
                      [0,0,1,tz],
                      [0,0,0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
     mat4x4.values = [[sx,0,0,0],
                      [0,sy,0,0],
                      [0,0,sz,0],
                      [0,0,0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
     mat4x4.values = [[1,0,0,0],
                      [0, Math.cos(theta), 0-Math.sin(theta), 0],
                      [0, Math.sin(theta), Math.cos(theta),   0],
                      [0,        0,                0,         1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
     mat4x4.values = [[Math.cos(theta),   0, Math.sin(theta), 0],
                      [      0,           1,       0,         0],
                      [0-Math.sin(theta), 0, Math.cos(theta), 0],
                      [      0,           0,       0,         1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
     mat4x4.values = [[Math.cos(theta), 0-Math.sin(theta), 0, 0],
                      [Math.sin(theta), Math.cos(theta),   0, 0],
                      [      0,                 0,         1, 0],
                      [      0,                 0,         0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
     mat4x4.values = [[1,0,shx,0],
                      [0,1,shy,0],
                      [0,0, 1, 0],
                      [0,0, 0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
