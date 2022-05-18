This is a Simple project created and maintained with the **just for fun** philosophy

# With this package you can
* zoom in your visualization in a specific point, using the pointer and the wheel (like google maps)
* drag the visualization (like google maps)
* translate the coordinates in 3 different spaces: the world, the real space of the canvas and the relative space of the canvas

# Usage

Install the library
```
npm install threejs-compass
```

Simply import the library
```
import Compass from "threejs-compass";
```

Set the events
```
const compass = new Compass(camera, renderer);
compass.setAllEvents();
```

In a real example
```
import Compass from "threejs-compass";

const main = () => {
  // threejs configuration, you can do what you you want
  const canvas = document.querySelector("#c");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const fov = 30;
  const z = 300;
  const aspectRatio = width / height;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  ....
  ....
  // end threejs config
  
  const compass = new Compass(camera, renderer);
  compass.setAllEvents();
  ....
  ....
}

main();
```
