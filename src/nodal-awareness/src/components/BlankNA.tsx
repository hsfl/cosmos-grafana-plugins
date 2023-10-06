import React, { useMemo, useState } from 'react';
import { scaleLinear } from '@visx/scale';
import { motion } from 'framer-motion';
import { Input, RadioButtonGroup, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

export const BlankNodalAwarenessPlot = (props: {
  width: number;
  height: number;
  //radialArray: number[];
  //dotRadius: number;
}) => {
  const [radialArray] = useState<number[]>([0, 22.5, 45.0, 67.5]);
  const radialTicks = radialArray;
  const { width, height } = props;
  const dimMax = Math.min(width, height);
  const padding = Math.min(dimMax / 2 / (radialTicks.length + 1), 100000);
  const yMax = height / 2;

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [90, 0],
        range: [1, yMax],
      }),
    [yMax]
  );
  // const angle = (d: Point) => xScale(getTheta(d)) ?? 0;
  // const radius = (d: Point) => yScale(getRadius(d)) ?? 0;

  if (width < 10) {
    return null;
  }

  const horizonCX = (width * 0.6) / 2;
  const horizonCY = height / 2.5 + height / 5;

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  return (
    <motion.svg width={width * 0.6} height={height}>
      <motion.rect width={width * 0.6} height={height} fill={'#000'} rx={0} />
      {/** Horizon subcircle */}
      <motion.g>
        <motion.circle
          cx={horizonCX}
          cy={horizonCY}
          fill="#f00"
          fillOpacity={0.2}
          r={dimMax / 2.5 - padding}
          stroke="#f00"
          strokeOpacity={0.2}
        />
      </motion.g>

      {/** Awareness Grid group */}
      <motion.g>
        {/** Concentric rings */}
        {radialTicks.map((v, i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = dimMax / 2 / (radialTicks.length + 1);
          const r = tickSpacing * ringIdx;
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          return (
            <motion.circle
              key={`radial-circle-${i}`}
              cx={gridCenterX}
              cy={gridCenterY}
              fill="none"
              r={r}
              stroke="#f00"
              //strokeWidth="4"
              strokeLinecap="round"
              //transition={{ ease: "easeInOut", repeat: Infinity, duration: 2 }}
            />
          );
        })}

        {/** Tick labels (Slant) */}
        {radialTicks.map((v, i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = dimMax / 2 / (radialTicks.length + 1);
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          return (
            <motion.text
              key={`radial-tick-${i}`}
              x={gridCenterX}
              y={gridCenterY + tickSpacing * ringIdx}
              fill="#f00"
              pointerEvents="none"
            >
              {v}
            </motion.text>
          );
        })}
        {/** Dashed radial lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((v, i) => {
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          const gridRadius = dimMax / 2 - padding;
          const x2 = Math.cos((i * Math.PI) / 4) * gridRadius + gridCenterX;
          const y2 = Math.sin((i * Math.PI) / 4) * gridRadius + gridCenterY;
          return (
            <motion.line
              key={`radial-line-${i}`}
              x1={gridCenterX}
              y1={gridCenterY}
              x2={x2}
              y2={y2}
              stroke="#f00"
              strokeDasharray={4}
            />
          );
        })}
      </motion.g>
    </motion.svg>
  );
};

const radialTicks: number[] = [0, 22.5, 45.0, 67.5];

export const BlankNodalAwarenessPlotText = (props: { width: number; height: number }) => {
  const { width, height } = props;
  const dimMax = Math.min(width, height);
  const padding = Math.min(dimMax / 2 / (radialTicks.length + 1), 100000);
  const yMax = height / 2;
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [90, 0],
        range: [1, yMax],
      }),
    [yMax]
  );

  if (width < 10) {
    return null;
  }

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  return (
    <div style={{ width: width * 0.6, height: height, overflow: 'scroll' }}>
      <motion.svg width={width * 0.6} height={height + 50}>
        <motion.rect width={width * 0.6} height={height + 50} fill={'#000'} rx={0} />
        <motion.text x="10" y="15" initial="hidden" animate="visible" style={{ fill: 'red' }}>
          <tspan x="10" dy="1em">
            Central Node
          </tspan>
          <tspan x="10" dy="1em">
            Node Type:
          </tspan>
          <tspan x="10" dy="1em">
            Name:
          </tspan>
        </motion.text>
        <motion.text x="10" y="70" initial="hidden" animate="visible" style={{ fill: '#32CD32' }}>
          <tspan x="10" dy="1em">
            Node Type:
          </tspan>
          <tspan x="10" dy="1em">
            Node Name:
          </tspan>
          <tspan x="10" dy="1em">
            Azimuth:
          </tspan>
          <tspan x="10" dy="1em">
            Elevation:
          </tspan>
          <tspan x="10" dy="1em">
            Slant Range:
          </tspan>
        </motion.text>
      </motion.svg>
    </div>
  );
};

export const BlankTargetChart = (props: { width: number; height: number }) => {
  //const { data, width, height } = props;
  const defaultOptions = [
    { label: 'Az/Elev', value: 'Az/Elev' },
    { label: 'Az/Slant', value: 'Az/Slant' },
  ];
  const [, setValue] = useState<SelectableValue<string>>();
  const [selected, setSelected] = useState<string>(defaultOptions[0].value!);

  return (
    <div
      style={{
        alignItems: 'center',
        alignContent: 'start',
        justifyItems: 'center',
        textAlign: 'center',
        display: 'grid',
        gridTemplateRows: 'auto auto auto',
        gridTemplateColumns: '1fr 6em 6em 6em 6em 6em 6em',
        //width: props.width,
        //height: props.height,
        overflow: 'scroll',
      }}
    >
      <div>
        <Select
          value={{ label: 'ECI' }}
          options={[{ label: 'ECI' }, { label: 'ICRF' }, { label: 'GEOD' }, { label: 'GEOS' }, { label: 'LVLH' }]}
          onChange={(v) => {
            setValue(v.value);
          }}
          width={10}
        />
      </div>
      {/** Column labels */}
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 2 }}>Type</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 3 }}>Lon</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 4 }}>Lat</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 5 }}>Alt</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 6 }}>Slant Range</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 7 }}>Elev</div>

      {/** Row cells */}
      {/** Node 1 */}
      <div style={{ gridRow: 2, gridColumn: 2 }}>
        <Input label="Type" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={' '}></Input>
      </div>
      {/* Node 2*/}
      <div style={{ gridRow: 3, gridColumn: 2 }}>
        <Input label="Type" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={' '}></Input>
      </div>
      {/* Node 3*/}
      <div style={{ gridRow: 4, gridColumn: 2 }}>
        <Input label="Type" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={' '}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={' '}></Input>
      </div>
      {/* Az/Elev, Az/Slant Option*/}
      <div style={{ marginBottom: '32px' }}>
        <RadioButtonGroup
          options={defaultOptions}
          value={selected}
          onChange={(v) => {
            setSelected(v!);
          }}
          size="sm"
        />
      </div>
    </div>
  );
};
