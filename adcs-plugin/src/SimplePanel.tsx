import React, { useEffect, useRef } from 'react'
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
interface Props extends PanelProps<SimpleOptions> {}

// Load in a glb/gltf model
const loadModel = (scene: THREE.Scene) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/public/plugins/interstel-adcs-display/img/GenericSatellite.glb',
      (gltf) =>{
        const obj = gltf.scene;
        obj.name = "satellite";
        obj.position.x = 0;
        obj.position.y = 0;
        obj.position.z = 0;
        // obj.rotation.x = 0.5;
        // obj.rotation.y = 0.5;
        // obj.receiveShadow = true;
        // obj.castShadow = true;
        scene.add(obj);
        resolve(obj);
      },
      undefined,
      (error) => {
        console.log(error);
        reject(error);
      }
    );
  })
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const refWebGLContainer = useRef<HTMLDivElement>(null);
  //const refId = useRef<number>(0);
  //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const refRenderer = useRef<THREE.WebGLRenderer>();
  //const refModel = useRef(null);

  useEffect(() => {
    // Clean up renderer on unmount
    return () => {
      if (refRenderer.current !== undefined) {
        refRenderer.current.dispose();
        refRenderer.current = undefined;
      }
    }
  }, []);

  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    const { current: container } = refWebGLContainer;
    if (!container) {
      return;
    }
    if (refRenderer.current === undefined) {
      const renderer = new THREE.WebGLRenderer();
      // Insert into div
      document.body.appendChild(renderer.domElement );
      container.appendChild(renderer.domElement);
      refRenderer.current = renderer;
      //setRenderer(renderer);
    }
    refRenderer.current.setSize(width, height);
    const scene = new THREE.Scene();
    const aspectRatio = width/height;
    const viewSize = 2;
    const camera = new THREE.OrthographicCamera(-aspectRatio*viewSize/2, aspectRatio*viewSize/2, viewSize/2, -viewSize/2, -1, 1000 );
    camera.position.set(
      2*45*Math.PI/180,
      1,
      2*45*Math.PI/180
    );
    camera.lookAt(new THREE.Vector3(0,0,0));
    // const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
    // scene.add(ambientLight);
    // Light placed facing origin from a little to the left of the camera
    const directionalLight = new THREE.DirectionalLight(0xeeeeee, 3.5);
    directionalLight.position.set(1, 4, 2);
    scene.add(directionalLight);
    scene.background= new THREE.Color(0x050505);

    // Add axis arrows
    const origin = new THREE.Vector3(0,0,0);
    const length = 1;
    const dir = new THREE.Vector3(1, 0, 0);
    dir.normalize();
    const x_arrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
    dir.x = 0;
    dir.y = 1;
    dir.normalize();
    const y_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ff00);
    dir.y = 0;
    dir.z = 1;
    dir.normalize();
    const z_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ffff);
    scene.add(x_arrow);
    scene.add(y_arrow);
    scene.add(z_arrow);

    // Add the satellite model
    loadModel(scene).then(() => {
      refRenderer.current!.render(scene, camera);
    });
  }, [width, height]);

  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    // const { current: container } = refWebGLContainer;
    // if (!container || renderer === undefined) {
    //   return;
    // }
    // // Update rendered scene
    // // Note, not reusing the scene?
    // const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    // // Configure WebGL rendering canvas
    // renderer.setSize( width, height );
    // // Insert into div
    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    // camera.position.z = 5;

    // // Callback for frame animation
    // const animate = function () {
    //   refId.current = requestAnimationFrame( animate );
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    //   renderer.render( scene, camera );
    // };
    // // Run animator
    // animate();

    // return () => {
    //   cancelAnimationFrame(refId.current);
    // };
  }, [/*renderer, */width, height]);

  return (
    <div>
      <div ref={refWebGLContainer} />
    </div>
  );
};
