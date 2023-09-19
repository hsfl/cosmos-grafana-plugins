import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { InlineFieldRow, InlineField, Input, Select } from '@grafana/ui';
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
        // obj.rotation.z = 1;
        // obj.receiveShadow = true;
        // obj.castShadow = true;
        const origin = new THREE.Vector3(0, 0, 0);
        // const length = 0.25;
        const length = 0.5;
        const dir = new THREE.Vector3(1, 0, 0);
        const x_arrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
        dir.set(0, 1, 0);
        const y_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ff00);
        dir.set(0, 0, 1);
        // dir.normalize();
        const z_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ffff);
        obj.add(x_arrow);
        obj.add(y_arrow);
        obj.add(z_arrow);
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
  const [refRenderer, refScene, refCamera, refModel, refSun, refNad, refInputs, refDS, refUS, updateDOMRefs] =
    useDomUpdate(data);
  // console.log('sim pan eventBus: ', eventBus);
  useCosmosTimeline(data, eventBus, updateDOMRefs);
  // refDS.current = 'ICRF';
  // console.log('adcs data: ', data);
  // console.log('data select, state ', data.state);
  // console.log('ref data state . current ', refDS.current);
  let show_table = true;

  // Setup the scene
  useEffect(() => {
    // Get reference to the div container holding the webgl renderer
    const { current: container } = refWebGLContainer;
    if (!container) {
      return;
    }
    if (refRenderer.current === undefined || refRenderer.current === null) {
      // console.log('undefined refRenderer');
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
    // const camera = new THREE.OrthographicCamera(
    //   (-aspectRatio * viewSize) / 2,
    //   (aspectRatio * viewSize) / 2,
    //   viewSize / 2,
    //   -viewSize / 2,
    //   -1,
    //   1000
    // );
    const camera = new THREE.OrthographicCamera(
      (aspectRatio * viewSize) / -2,
      (aspectRatio * viewSize) / 2,
      viewSize / 2,
      viewSize / -2,
      1,
      1000
    );
    // z 0 , x 0, y 45 = lvlh ; z 0 , x 0, y 45 = lvlh
    // camera.position.set((2 * 45 * Math.PI) / 180, 1, (2 * 45 * Math.PI) / 180);
    // camera.position.set(0, 1.5, 0); // for lvlh; make sure cartesian distance sq.rt(x^2 + y^2 + z^2) is same
    camera.position.set(0, 1.5, 0); // for lvlh; make sure cartesian distance sq.rt(x^2 + y^2 + z^2) is same
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
    // const origin = new THREE.Vector3(0, 1.8, 3.3);

    // const origin = new THREE.Vector3(0, 0, 0);
    // // const length = 0.25;
    // const length = 0.65;
    // const dir = new THREE.Vector3(1, 0, 0);
    // const x_arrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
    // dir.set(0, 1, 0);
    // const y_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ff00);
    // dir.set(0, 0, 1);
    // dir.normalize();
    // const z_arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ffff);
    // scene.add(x_arrow);
    // scene.add(y_arrow);
    // scene.add(z_arrow);

    // sun vector
    const sundir = new THREE.Vector3(0, 0, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const sunarrowHelper = new THREE.ArrowHelper(sundir, origin, length, 0xffff00);
    scene.add(sunarrowHelper);
    refSun.current = sunarrowHelper;
    // nadir vector
    const naddir = new THREE.Vector3(0, 0, 0);
    const nadarrowHelper = new THREE.ArrowHelper(naddir, origin, 0.75, 0x0fff00);
    scene.add(nadarrowHelper);
    refNad.current = nadarrowHelper;

    // x y z orient set upper left dynamic to frame; z points left, x points right, y points up in rendering.
    const coord_ref = new THREE.Vector3(-1.5, height / 3000, width / 700);
    const coord_length = 0.6;
    const coord_dir = new THREE.Vector3(1, 0, 0);
    const coord_x_arrow = new THREE.ArrowHelper(coord_dir, coord_ref, coord_length, 0xff0000);
    coord_dir.set(0, 1, 0);
    const coord_y_arrow = new THREE.ArrowHelper(coord_dir, coord_ref, coord_length, 0x00ff00);
    coord_dir.set(0, 0, 1);
    coord_dir.normalize();
    const coord_z_arrow = new THREE.ArrowHelper(coord_dir, coord_ref, coord_length, 0x00ffff);
    scene.add(coord_x_arrow);
    scene.add(coord_y_arrow);
    scene.add(coord_z_arrow);

    // Add the satellite model
    loadModel(scene).then((obj) => {
      refModel.current = obj;
      refRenderer.current!.render(scene, camera);
    });
    // Note: refs are stable, will not trigger effect, but calms the exhaustive-deps lint rule
  }, [width, height, refRenderer, refScene, refCamera, refModel, refSun, refNad, refInputs, refUS]);
  // console.log('REF inputs adcs simple panel: ', refInputs);

  // function Label({ name, isDeg }: { name: string; isDeg: string }) {
  //   if (isDeg === 'Degrees') {
  //     return <div>{name} (deg)</div>;
  //   }
  //   return <div>{name} (rad)</div>;
  // }

  // function units(units: string) {
  //   if (units === 'Degrees') {
  //     return 'deg'
  //   }
  //   return 'rad'
  // }

  // let result = units(refUS.current!);
  if (show_table) {
    return (
      <div style={ { width: width, height: height, overflow: 'auto' } }>
        <div ref={ refWebGLContainer } />
        <InlineFieldRow>
          <InlineField transparent label="Data" labelWidth={ 6 }>
            <Select
              defaultValue={ { label: 'ICRF' } }
              value={ refDS.current }
              options={ [{ label: 'ICRF' }, { label: 'GEOC' }, { label: 'LVLH' }] }
              onChange={ (e) => {
                refDS.current = e.label;
              } }
              width="auto"
            />
          </InlineField>
          <InlineField transparent label="Units" labelWidth={ 6 }>
            <Select
              id="unity"
              defaultValue={ { label: 'Radians' } }
              value={ refUS.current }
              options={ [{ label: 'Radians' }, { label: 'Degrees' }] }
              onChange={ (e) => {
                refUS.current = e.label;
                // units(e.label!);
                // result = units(refUS.current!)
              } }
              width="auto"
            />
          </InlineField>
        </InlineFieldRow>
        {/* {% if show_table %} */ }
        <div
          style={ {
            alignItems: 'center',
            justifyItems: 'center',
            textAlign: 'center',
            display: 'grid',
            //columnGap: '1em',
            gridTemplateRows: 'auto auto auto auto',
            gridTemplateColumns: 'auto auto auto auto',
          } }
        >
          <div style={ { fontSize: '0.8em', gridRow: 1, gridColumn: 2 } }>Angle</div>
          <div style={ { fontSize: '0.8em', gridRow: 1, gridColumn: 3 } }>Angular Vel</div>
          <div style={ { fontSize: '0.8em', gridRow: 1, gridColumn: 4 } }>Angular Accel</div>
          {/* Heading: z axis: Yaw
            Elevation: y axis: Pitch
            Bank: x axis: Roll */}
          <div style={ { gridRow: 2, gridColumn: 1, marginInlineEnd: '1em' } }>
            <h6 style={ { color: 'aqua' } }>Yaw</h6>
          </div>
          <div style={ { gridRow: 3, gridColumn: 1, marginInlineEnd: '1em' } }>
            <h6 style={ { color: 'lime' } }>Pitch</h6>
          </div>
          <div style={ { gridRow: 4, gridColumn: 1, marginInlineEnd: '1em' } }>
            <h6 style={ { color: 'red' } }>Roll</h6>
          </div>

          <div style={ { gridRow: 2, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['YAW'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 2, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VYAW'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 2, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['AYAW'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 3, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['PITCH'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 3, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VPITCH'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 3, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['APITCH'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 4, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['ROLL'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 4, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VROLL'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 4, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['AROLL'] = ref) } type="text" readOnly />
          </div>
        </div>
        <div>
          <div style={ { gridRow: 1, gridColumn: 1, marginInlineEnd: '1em' } }> Time: </div>
          <div style={ { gridRow: 1, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['TIME'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 2, gridColumn: 1, marginInlineEnd: '1em' } }> Node: </div>
          <div style={ { gridRow: 2, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['NODE'] = ref) } type="text" readOnly />
          </div>
          <div style={ { gridRow: 3, gridColumn: 1 } }>
            <Input ref={ (ref) => (refInputs.current['PLTIME'] = ref) } type="text" hidden />
          </div>
        </div>
      </div>
      // {% else %}
      // {% endif %}
    );
  } else {
    return (
      <div style={ { width: width, height: height, overflow: 'auto' } }>
        <div ref={ refWebGLContainer } />
        <InlineFieldRow>
          <InlineField transparent label="Data" labelWidth={ 6 }>
            <Select
              defaultValue={ { label: 'ICRF' } }
              value={ refDS.current }
              options={ [{ label: 'ICRF' }, { label: 'GEOC' }, { label: 'LVLH' }] }
              onChange={ (e) => {
                refDS.current = e.label;
              } }
              width="auto"
            />
          </InlineField>
          <InlineField transparent label="Units" labelWidth={ 6 }>
            <Select
              id="unity"
              defaultValue={ { label: 'Radians' } }
              value={ refUS.current }
              options={ [{ label: 'Radians' }, { label: 'Degrees' }] }
              onChange={ (e) => {
                refUS.current = e.label;
                // units(e.label!);
                // result = units(refUS.current!)
              } }
              width="auto"
            />
          </InlineField>
        </InlineFieldRow>
        {/* {% if show_table %} */ }
        <div
          style={ {
            alignItems: 'center',
            justifyItems: 'center',
            textAlign: 'center',
            display: 'grid',
            //columnGap: '1em',
            gridTemplateRows: 'auto auto auto auto',
            gridTemplateColumns: 'auto auto auto auto',
          } }
        >
          <div style={ { gridRow: 2, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['YAW'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 2, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VYAW'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 2, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['AYAW'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 3, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['PITCH'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 3, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VPITCH'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 3, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['APITCH'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 4, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['ROLL'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 4, gridColumn: 3 } }>
            <Input ref={ (ref) => (refInputs.current['VROLL'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 4, gridColumn: 4 } }>
            <Input ref={ (ref) => (refInputs.current['AROLL'] = ref) } type="text" hidden />
          </div>
        </div>
        <div>
          <div style={ { gridRow: 1, gridColumn: 1, marginInlineEnd: '1em' } } hidden> Time: </div>
          <div style={ { gridRow: 1, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['TIME'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 2, gridColumn: 1, marginInlineEnd: '1em' } } hidden> Node: </div>
          <div style={ { gridRow: 2, gridColumn: 2 } }>
            <Input ref={ (ref) => (refInputs.current['NODE'] = ref) } type="text" hidden />
          </div>
          <div style={ { gridRow: 3, gridColumn: 1 } }>
            <Input ref={ (ref) => (refInputs.current['PLTIME'] = ref) } type="text" hidden />
          </div>
        </div>
      </div>
    );
  }
};
