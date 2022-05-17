export interface CanvasBox {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

class Compass {
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private zoomOptions: { minZoom: number; maxZoom: number; step: number };
  private draggingObj: {
    isItDragging: boolean;
    positions: { x: number; y: number };
  };
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.zoomOptions = {
      maxZoom: 2,
      minZoom: 10000,
      step: 0.06,
    };
    this.draggingObj = { isItDragging: false, positions: { x: 0, y: 0 } };
  }

  /**
   * Returns the current ranges displayed on the canvas
   * minWidth; maxWidth; minHeigth; maxHeigth;
   */
  getBounds = (): CanvasBox => {
    const fov = this.camera.fov;
    const { x, y, z } = this.camera.position;
    const aspect = this.camera.aspect;
    const halfHeight = Math.tan((fov * Math.PI) / 180 / 2) * z;
    const halfWidth = halfHeight * aspect;
    const maxHeight = y + halfHeight;
    const minHeight = y - halfHeight;
    const minWidth = x - halfWidth;
    const maxWidth = x + halfWidth;
    return {
      maxHeight,
      minHeight,
      minWidth,
      maxWidth,
    };
  };

  /**
   * Return the absolute bounds of the canvas.
   * @returns width: is the width of the canvas; height: is the height of the canvas
   */
  getABSBounds = () => {
    return this.getABSBoundsWithCustomZ(this.camera.position.z);
  };

  // from canvas to something

  fromCanvasPercentageToWorldCoordinates = (
    percentX: number,
    percentY: number
  ) => {
    const canvas = this.renderer.domElement;
    const wx = (canvas.clientWidth * (percentX + 1)) / 2;
    const wy = -(canvas.clientHeight * (percentY - 1)) / 2;
    return { wx, wy };
  };

  fromCanvasPercentageToCanvas = (percentX: number, percentY: number) => {
    const { height, width } = this.getABSBounds();
    const halfHeight = height / 2,
      halfWidth = width / 2;
    const x = halfWidth * percentX,
      y = halfHeight * percentY;
    return { x, y };
  };

  // end from canvas to something

  // from world to something
  /**
   *
   * @param wx world x coordinate
   * @param wy world y coordinate
   * @returns percentX: from -1 to 1 & percentY: from -1 to 1
   * Are like in the Euclidean space.
   */
  getWorldToCanvasPercentCoordinates = (wx: number, wy: number) => {
    const canvas = this.renderer.domElement;
    const percentX = (wx / canvas.clientWidth) * 2 - 1;
    const percentY = -(wy / canvas.clientHeight) * 2 + 1;
    return { percentX, percentY };
  };
  /**
   * @param wx world x coordinate
   * @param wy world y coordinate
   * @returns x & y that are the wx & wy but in the canvas space
   */
  getWorldToCanvasCoordinates = (wx: number, wy: number) => {
    const { z } = this.camera.position;
    return this.getWorldToCanvasWithCustomZ(wx, wy, z);
  };

  getWorldToCanvasABSPercentCoordinates = (wx: number, wy: number) => {
    const canvas = this.renderer.domElement;
    const percentX = wx / canvas.clientWidth;
    const percentY = 1 - wy / canvas.clientHeight;
    return { percentX, percentY };
  };

  getWorldToCanvasABSCoordinates = (wx: number, wy: number) => {
    const { z } = this.camera.position;
    return this.getWorldToCanvasABSWithCustomZ(wx, wy, z);
  };

  // end from world to something

  zoom = (event: WheelEvent) => {
    const { clientX, clientY, deltaY } = event;
    const { step, minZoom, maxZoom } = this.zoomOptions;

    const { z: zp } = this.camera.position;
    let nz = zp;

    nz += deltaY * step;
    if (nz < maxZoom) {
      nz = maxZoom;
    } else if (nz > minZoom) {
      nz = minZoom;
    }

    const { x, y } = this.getWorldToCanvasCoordinates(clientX, clientY);
    const { x: futureX, y: futureY } = this.getWorldToCanvasWithCustomZ(
      clientX,
      clientY,
      nz
    );
    const offX = x - futureX;
    const offY = y - futureY;
    this.camera.translateX(offX);
    this.camera.translateY(offY);
    this.camera.position.setZ(nz);
  };

  setAllEvents = () => {
    this.setZoomHandler();
    this.setDragCanvas();
    this.disableBrowserCTXMenu();
  };

  disableBrowserCTXMenu = () => {
    this.renderer.domElement.addEventListener("contextmenu", (e) =>
      e.preventDefault()
    );
  };

  setDragCanvas = () => {
    this.renderer.domElement.onmousedown = (event) => {
      const { clientX, clientY } = event;
      this.draggingObj.isItDragging = true;
      const { x, y } = this.getWorldToCanvasABSCoordinates(clientX, clientY);
      this.draggingObj.positions = { x, y };
    };
    window.onmousemove = (event) => {
      if (this.draggingObj.isItDragging) {
        const { clientX, clientY } = event;
        const { x, y } = this.draggingObj.positions;
        const { x: newX, y: newY } = this.getWorldToCanvasABSCoordinates(
          clientX,
          clientY
        );
        this.draggingObj.positions = { x: newX, y: newY };
        this.camera.translateX(x - newX);
        this.camera.translateY(y - newY);
      }
    };
    this.renderer.domElement.onmouseup = (event) => {
      this.draggingObj.isItDragging = false;
    };
  };

  setZoomHandler = () => {
    this.renderer.domElement.onwheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!this.draggingObj.isItDragging) {
        this.zoom(event);
      }
    };
  };

  private getWorldToCanvasWithCustomZ = (
    wx: number,
    wy: number,
    cz: number
  ) => {
    const { percentX, percentY } = this.getWorldToCanvasPercentCoordinates(
      wx,
      wy
    );
    const { x, y } = this.camera.position;
    const { width, height } = this.getABSBoundsWithCustomZ(cz);
    const retX = x + (width / 2) * percentX;
    const retY = y + (height / 2) * percentY;
    return { x: retX, y: retY };
  };

  private getWorldToCanvasABSWithCustomZ = (
    wx: number,
    wy: number,
    cz: number
  ) => {
    const { percentX, percentY } = this.getWorldToCanvasABSPercentCoordinates(
      wx,
      wy
    );
    const { width, height } = this.getABSBoundsWithCustomZ(cz);
    const retX = width * percentX;
    const retY = height * percentY;
    return { x: retX, y: retY };
  };

  private getABSBoundsWithCustomZ = (z: number) => {
    const fov = this.camera.fov;
    const aspect = this.camera.aspect;
    const halfHeight = Math.tan((fov * Math.PI) / 180 / 2) * z;
    const halfWidth = halfHeight * aspect;
    return { width: halfWidth * 2, height: halfHeight * 2 };
  };
}

export default Compass;
