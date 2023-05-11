<div align="center">
  <h1>3D Projections for Wireframe Rendering</h1>  
  <img src="home-star-3d.gif"/>
</div>

## Project Overview 

Focused on wireframe model rendering, this project utilizes martices and arrays to simulate a high coding level implementation of what happens behind the hood in terms of generating graphics on a computer monitor. It utilzes the HTML5 Canvas 2D API to render the wireframe models which are stored in Json format either in a external file or embedded into the program. This project mainly helped understand the math concepts implemented and the work that the computer has to execute in order to display graphics on the monitor. 

### Try it out: [Wire Shapes Demo](https://tuck1297.github.io/cg-3dprojections/)

---

## Behind the Scenes Walkthrough

This project's main function is to provide a hands-on experience in creating and managing data with arrays and matrices in a way so that one can successfully implement a wireframe shape graphic pipeline that can be loaded and displayed in the web browser. 

Using html's Canvas 2D API, this project generates 3-Dimensional wire frame shapes in a 2-Dimensional view. There are two view types that were focused on for this project which where perspective (which compensates for depth) or parallel (otherwise known as Orthographic view which does not compensate for depth) which are seen in the images below. 

![image](https://user-images.githubusercontent.com/100146767/218387331-88d0b49c-09c3-4438-97a3-30788015c216.png)

### Highlights of this project

- Perspective and Parallel Views
- Clipping Plane (The size and area of the environment where elements are rendered)
- View Controls (Controls that allow one to 'look' around the 3D environment)
- Common Models (Cone, Cylinder, Cube, etc...)
- Computer Graphic Pipeline from data to display

### The Inputs

The inputs to render a specific 3D wireframe shape in this project requires the following in JSON format: 
- PRP: Projection Reference Point
- SRP: Scene Reference Point
- VUP: View up Vector
- Clip: Clipping plane (defines a finite space in which the computer can handle)
- Model: The vertices and type of model in which you want to render

---

## Plug and Play

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

---

## Controls

There are some controls not listed on the site to move around the projection. They are the following: 
- Left and Right Arrow Keys -- rotate the SRP around the v-axis with the PRP as the orgin (rotate around)
- A and D Keys -- Translate the PRP and SRP along the u-axis (left and right)
- W and S Keys -- Translate the PRP and SRP along the n-axis (forward and back)
- P -- Toggle Draw Vertices
- R -- Toggle Animation

---

## Tools and Languages Used
<div>
  <img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-plain-wordmark.svg"  title="CSS3" alt="CSS" width="40" height="60"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-original.svg" title="HTML5" alt="HTML" width="40" height="60"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" title="JavaScript" alt="JavaScript" width="60" height="60"/>&nbsp;
  <img src="https://github.com/devicons/devicon/blob/master/icons/git/git-original-wordmark.svg" title="Git" **alt="Git" width="60" height="60"/>
  <img src="https://github.com/devicons/devicon/blob/master/icons/github/github-original.svg" title="Github" **alt="Github" width="60" height="60"/>
  <img src="https://github.com/devicons/devicon/blob/master/icons/vscode/vscode-original.svg" title="vscode" **alt="vscode" width="60" height="60"/>
</div>
