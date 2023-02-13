# 3D Projections for Wireframe Rendering

3D Projections using the HTML5 Canvas 2D API

This project was the second of four major assignments from the Computer Graphics course from the University of St. Thomas. It focuses on using HTML's 2D Canvas API to render both parallel and perspective 3D wireframe projections. 

## Behind the Scenes Walkthrough

Essentially, this project's main function is to render a 2-Dimensional view of a 3-Dimensional object being calculated by the computer graphic pipeline. That 2-Dimensional view will then either be a perspective (compensate for depth) or parallel view (otherwise known as Orthographic view - does not compensate for depth). 

![image](https://user-images.githubusercontent.com/100146767/218387331-88d0b49c-09c3-4438-97a3-30788015c216.png)

# The Inputs

The inputs to render a specific 3D wireframe shape in this project requires the following in JSON format: 
- PRP: Projection Reference Point - 
- SRP: Scene Reference Point
- VUP: View up Vector
- Clip: Clipping plane (defines a finite space in which the computer can handle)
- Model: The vertices and type of model in which you want to render

# Plug and Play

To try out this project you can navigate to the following link: https://tuck1297.github.io/cg-3dprojections/

If you are interested in building your own wireframe models in this program, there are some json example files on the main page named parallel.json and perspective.json. Here are some of the basic shapes that this program will automatically generate if you call them from within the json file. 
Below are the bits of information you would need to provide for each common shape: 
- generic 
  - vertices (array of Vector4 = [x, y, z], [x, y, z], [x, y, z], ect...)
  - edges (array of lines (In following example edge #1 connects to edge #2 by vertex_2) = [vertex_1,vertex_2], [vertex_2,vertex_3])
- cube
  - center ([x, y, z])
  - width
  - height
  - depth
- cone
  - center ([x, y, z])
  - radius
  - height
  - number of sides
- cylinder
  - center ([x, y, z])
  - radius
  - height
  - sides
- sphere
  - center ([x, y, z])
  - radius
  - slices (think number of longitude lines on a globe)
  - stacks (think number of latitude lines on a globe)
- All modes may optionally have an animation field 
  - Animation
     - axis (x, y, or z)
     - rps: Revolutions Per Second
  ` "animation": {
                "axis": "y",
                "rps": 0.5

            }`

# Controls

There are some controls not listed on the sight to move around the projection. They are the following: 
- Left and Right Arrow Keys -- rotate the SRP around the v-axis with the PRP as the orgin (rotate around)
- A and D Keys -- Translate the PRP and SRP along the u-axis (left and right)
- W and S Keys -- Translate the PRP and SRP along the n-axis (forward and back)
- P -- Toggle Draw Vertices
- R -- Toggle Animation
