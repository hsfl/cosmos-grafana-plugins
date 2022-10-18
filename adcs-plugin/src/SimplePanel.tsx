import React, { useEffect, useRef, useState } from 'react'
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const refWebGLContainer = useRef<HTMLDivElement>(null);
  const refId = useRef<number>(0);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();

  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    const { current: container } = refWebGLContainer;
    if (!container) {
      return;
    }
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(5, 5);
    // Insert into div
    document.body.appendChild( renderer.domElement );
    container.appendChild(renderer.domElement);
    setRenderer(renderer);

    // Cleanup renderer on rerender
    return () => {
      renderer.dispose();
    }
  }, []);

  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    const { current: container } = refWebGLContainer;
    if (!container || renderer === undefined) {
      return;
    }
    // Update rendered scene
    // Note, not reusing the scene?
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    // Configure WebGL rendering canvas
    renderer.setSize( width, height );
    // Insert into div
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    camera.position.z = 5;

    // Callback for frame animation
    const animate = function () {
      refId.current = requestAnimationFrame( animate );
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render( scene, camera );
    };
    // Run animator
    animate();

    return () => {
      cancelAnimationFrame(refId.current);
    };
  }, [renderer, width, height]);

  return (
    <div>
      <div ref={refWebGLContainer} />
    </div>
  );
};
