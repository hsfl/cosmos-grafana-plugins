import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { InlineFieldRow, Input, Select } from '@grafana/ui';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';
import { SimpleOptions } from 'types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
interface Props extends PanelProps<SimpleOptions> {}

// Load in a glb/gltf model
const loadModel = (scene: THREE.Scene): Promise<THREE.Group> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/public/plugins/interstel-adcs-display/img/GenericSatellite.glb',
      (gltf) => {
        const obj = gltf.scene;
        obj.name = 'satellite';
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
  });
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  const refWebGLContainer = useRef<HTMLDivElement>(null);
  //const refId = useRef<number>(0);
  //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  // An array of references to the text boxes
  // const refInputs = useRef<RefDict>({});
  // The index into the data array
  //const refIdxs = useRef<number[]>([]);
  const [refRenderer, refScene, refCamera, refModel, refInputs, updateDOMRefs] = useDomUpdate(data);
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  // Setup scene
  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    const { current: container } = refWebGLContainer;
    if (!container) {
      return;
    }
    if (refRenderer.current === undefined || refRenderer.current === null) {
      const renderer = new THREE.WebGLRenderer();
      // Insert into div
      document.body.appendChild(renderer.domElement);
      container.appendChild(renderer.domElement);
      refRenderer.current = renderer;
      //setRenderer(renderer);
    }
    // Threejs canvas to take up the upper half of the panel
    const [canvasWidth, canvasHeight] = [width, height / 2];
    refRenderer.current.setSize(canvasWidth, canvasHeight);
    const scene = new THREE.Scene();
    refScene.current = scene;
    const aspectRatio = canvasWidth / canvasHeight;
    const viewSize = 2;
    const camera = new THREE.OrthographicCamera(
      (-aspectRatio * viewSize) / 2,
      (aspectRatio * viewSize) / 2,
      viewSize / 2,
      -viewSize / 2,
      -1,
      1000
    );
    camera.position.set((2 * 45 * Math.PI) / 180, 1, (2 * 45 * Math.PI) / 180);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    refCamera.current = camera;
    // const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
    // scene.add(ambientLight);
    // Light placed facing origin from a little to the left of the camera
    const directionalLight = new THREE.DirectionalLight(0xeeeeee, 3.5);
    directionalLight.position.set(1, 4, 2);
    scene.add(directionalLight);
    scene.background = new THREE.Color(0x050505);

    // Add axis arrows
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const dir = new THREE.Vector3(1, 0, 0);
    const x_arrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
    dir.set(0, 1, 0);
    const y_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ff00);
    dir.set(0, 0, 1);
    dir.normalize();
    const z_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ffff);
    scene.add(x_arrow);
    scene.add(y_arrow);
    scene.add(z_arrow);

    // Add the satellite model
    loadModel(scene).then((obj) => {
      refModel.current = obj;
      refRenderer.current!.render(scene, camera);
    });
    // Note: refs are stable, will not trigger effect, but calms the exhaustive-deps lint rule
  }, [width, height, refRenderer, refScene, refCamera, refModel, refInputs]);

  return (
    <div style={{ width: width, height: height, overflow: 'auto' }}>
      <div ref={refWebGLContainer} />
      <InlineFieldRow>
        <Select
          value={{ label: 'View Normal' }}
          options={[{ label: 'View Normal' }, { label: 'Archival' }]}
          onChange={() => {}}
          width={13}
        />
      </InlineFieldRow>
      <table>
        <tr>
          <td></td>
          <td style={{ fontSize: '0.8em', textAlign: 'center' }}>Attitude</td>
          <td style={{ fontSize: '0.8em', textAlign: 'center' }}>Angular Velocity (rad/s)</td>
          <td style={{ fontSize: '0.8em', textAlign: 'center' }}>Angular Accel (rad/s<sup>2</sup>)</td>
        </tr>
        <tr>
          <td>Yaw</td>
          <td>
            <Input ref={(ref) => (refInputs.current['YAW'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
          <td>
            <Input ref={(ref) => (refInputs.current['VYAW'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
          <td>
            <Input ref={(ref) => (refInputs.current['AYAW'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
        </tr>
        <tr>
          <td>Pitch</td>
          <td>
            <Input ref={(ref) => (refInputs.current['PITCH'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
          <td>
            <Input
              ref={(ref) => (refInputs.current['VPITCH'] = ref)}
              style={{ marginInlineStart: '1em' }}
              type="text"
            />
          </td>
          <td>
            <Input
              ref={(ref) => (refInputs.current['APITCH'] = ref)}
              style={{ marginInlineStart: '1em' }}
              type="text"
            />
          </td>
        </tr>
        <tr>
          <td>Roll</td>
          <td>
            <Input ref={(ref) => (refInputs.current['ROLL'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
          <td>
            <Input ref={(ref) => (refInputs.current['VROLL'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
          <td>
            <Input ref={(ref) => (refInputs.current['AROLL'] = ref)} style={{ marginInlineStart: '1em' }} type="text" />
          </td>
        </tr>
      </table>
    </div>
  );
};
