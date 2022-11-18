import React, { useEffect, useRef } from 'react'
import { PanelProps } from '@grafana/data';
import { InlineFieldRow, Input, Select } from '@grafana/ui';
import { useCosmosTimeline, useDomUpdate } from 'helpers/hooks';
import { SimpleOptions, TimeEvent } from 'types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
interface Props extends PanelProps<SimpleOptions> {}

// Load in a glb/gltf model
const loadModel = (scene: THREE.Scene): Promise<THREE.Group> => {
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

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  const refWebGLContainer = useRef<HTMLDivElement>(null);
  //const refId = useRef<number>(0);
  //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const refRenderer = useRef<THREE.WebGLRenderer>();
  const refScene = useRef<THREE.Scene>();
  const refCamera = useRef<THREE.OrthographicCamera>();
  const refModel = useRef<THREE.Group>();
  // An array of references to the text boxes
  // const refInputs = useRef<RefDict>({});
  // The index into the data array
  //const refIdxs = useRef<number[]>([]);
  const [refInputs, updateDOMRefs] = useDomUpdate(data);
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  useEffect(() => {
    // Clean up renderer on unmount
    return () => {
      if (refRenderer.current !== undefined) {
        refRenderer.current.dispose();
        refRenderer.current = undefined;
      }
    }
  }, []);

  // Setup scene
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
    // Threejs canvas to take up the upper half of the panel
    const [canvasWidth, canvasHeight] = [width, height/2];
    refRenderer.current.setSize(canvasWidth, canvasHeight);
    const scene = new THREE.Scene();
    refScene.current = scene;
    const aspectRatio = canvasWidth/canvasHeight;
    const viewSize = 2;
    const camera = new THREE.OrthographicCamera(-aspectRatio*viewSize/2, aspectRatio*viewSize/2, viewSize/2, -viewSize/2, -1, 1000 );
    camera.position.set(
      2*45*Math.PI/180,
      1,
      2*45*Math.PI/180
    );
    camera.lookAt(new THREE.Vector3(0,0,0));
    refCamera.current = camera;
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
  }, [width, height]);

  // ---------------------------------------------------
  // useEffect(() => {
  //   // Array of references
  //   // Number of columns is the total -1 to exclude the time column
  //   const numColumns = data.series[0].fields.length-1;
  //   // Array of indices
  //   if (refIdxs.current.length < numColumns) {
  //     for (let i = refIdxs.current.length; i < numColumns; i++) {
  //       refIdxs.current.push(0);
  //     }
  //   } else {
  //     refIdxs.current = refIdxs.current.slice(0, numColumns);
  //   }
  //   console.log('numColumns:', numColumns, 'refIdxs.length:', refIdxs.current.length);
  // }, [data]);
  // Imperative animation call
  // const updateDOMRefs = useCallback((data: PanelData, event: TimeEvent) => {
  //   if (
  //     !data.series.length || // Check if there is valid query result
  //     data.series[0].fields.length < 2// || // Check if there are time and value columns in query
  //     //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
  //   ) {
  //     //refIdx.current = 0;
  //     return;
  //   }
  //   Object.entries(refInputs.current).forEach(([key, ref], i) => {
  //     if (ref !== null) {
  //       // Check that there are query results
  //       if (!data.series.length) {
  //         return;
  //       }
  //       // setState takes one rerender cycle to be reset to the correct value
  //       if (i+1 >= data.series[0].fields.length) {
  //         return;
  //       }
  //       // Query must have returned some values
  //       const timeValues = data.series[0].fields[0].values;
  //       if (timeValues.length === 0) {
  //         return;
  //       }
  //       // If index is out of bounds, set it back to the start
  //       if (refIdxs.current[i] >= timeValues.length-1) {
  //         refIdxs.current[i] = 0;
  //       }
  //       // If new timestamp is less than our current timestamp, then search from start
  //       // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
  //       let time = timeValues.get(refIdxs.current[i]);
  //       if (time > event.payload.time!) {
  //         refIdxs.current[i] = 0;
  //       }
  //       // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
  //       for (; refIdxs.current[i] < timeValues.length-1; refIdxs.current[i]++) {
  //         time = timeValues.get(refIdxs.current[i]);
  //         if (time === event.payload.time!) {
  //           break;
  //         }
  //         if (time > event.payload.time!) {
  //           refIdxs.current[i] -= 1;
  //           break;
  //         }
  //       }
  //       const currentTemp: string = (data.series[0].fields[i+1].values.get(refIdxs.current[i]) ?? 0);
  //       ref.value = currentTemp;
  //     }
  //   });
  // }, []);

  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe(event => {
      if (event.payload.time !== undefined) {
        updateDOMRefs(data, event);
        requestAnimationFrame(() => {
          if (refModel.current !== undefined && refRenderer.current !== undefined && refScene.current !== undefined && refCamera.current !== undefined)
          {
            refModel.current.rotation.x += 0.1;
            refRenderer.current.render(refScene.current, refCamera.current);
          }
        });
      }
    });

    return () => {
      subscriber.unsubscribe();
    }
  }, [eventBus, data, updateDOMRefs]);

  // ---------------------------------------------------

  return (
    <div>
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
          <td style={{textAlign:'center'}}>Attitude</td>
          <td style={{textAlign:'center'}}>Rotation Rate</td>
          <td style={{textAlign:'center'}}>Acceleration</td>
        </tr>
        <tr>
          <td>Yaw</td>
          <td><Input ref={(ref) => refInputs.current['YAW'] = ref} style={{ marginInlineStart: '1em' }} type="text" /></td>
          <td><Input ref={(ref) => refInputs.current['VYAW'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
          <td><Input ref={(ref) => refInputs.current['AYAW'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
        </tr>
        <tr>
          <td>Pitch</td>
          <td><Input ref={(ref) => refInputs.current['PITCH'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
          <td><Input ref={(ref) => refInputs.current['VPITCH'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
          <td><Input ref={(ref) => refInputs.current['APITCH'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
        </tr>
        <tr>
          <td>Roll</td>
          <td><Input ref={(ref) => refInputs.current['ROLL'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
          <td><Input ref={(ref) => refInputs.current['VROLL'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
          <td><Input ref={(ref) => refInputs.current['AROLL'] = ref} style={{ marginInlineStart: '1em' }} type="text"/></td>
        </tr>
      </table>
    </div>
  );
};
