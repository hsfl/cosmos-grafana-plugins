import React, { useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { CzmlPacket, SimpleOptions } from 'types';
import {
  buildModuleUrl,
  TileMapServiceImageryProvider,
  Viewer as CesiumViewer,
  CzmlDataSource as CesiumCzmlDataSource,
} from 'cesium';
import { CesiumComponentRef, CzmlDataSource, Globe, Viewer } from 'resium';
import { GlobeToolbar } from './GlobeToolbar';
import './globe.css';

require('../node_modules/cesium/Source/Widgets/widgets.css');

const globeTexture = new TileMapServiceImageryProvider({
  url: buildModuleUrl('Assets/Textures/NaturalEarthII'),
});

interface Props extends PanelProps<SimpleOptions> {}

export const OrbitDisplayPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const viewer = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [dataState, setDataState] = useState(data);
  //let [dat, setdat] = useState<CzmlPacket[] | undefined>();
  //   let dat = 0;
  const czml0 = [
    {
      id: 'document',
      name: 'CosmosOrbitalDisplay',
      version: '1.0',
    },
  ];

  useEffect(() => {
    setDataState(data);
  }, [data]);

  // TODO: look into why I need this delay. Surely there's a smarter way of doing this
  setTimeout(() => {
    // viewer.current.cesiumElement is the Cesium Viewer
    if (viewer.current?.cesiumElement && viewer.current?.cesiumElement.dataSources.length) {
      // Get the czml document we started at the top of this file
      let myczml = viewer.current.cesiumElement.dataSources.getByName('CosmosOrbitalDisplay') as CesiumCzmlDataSource[];
      // There should only ever be one
      // myczml[0] is our CZMLDataSource
      if (myczml.length === 1) {
        // series is an array of query responses
        // fields is an array of the fields in those responses (in this case, 'historical' and 'predicted')
        // values are the rows within that field
        let historical: string = data.series[0].fields.find((x) => x.name === 'historical')?.values.get(0);
        if (historical !== '') {
          const czmlified: CzmlPacket[] = JSON.parse(historical);
          myczml[0].process(czmlified);
        }
        let predicted: string = data.series[0].fields.find((x) => x.name === 'predicted')?.values.get(0);
        if (predicted !== '') {
          const czmlified: CzmlPacket[] = JSON.parse(predicted);
          myczml[0].process(czmlified);
        }
      }
    }
  }, 100);

  //   const handlechange = (e: CesiumCzmlDataSource) => {
  //     console.log('detected change');
  //     //setdat(czml1);
  //   };
  console.log('rerender globe panel');

  return (
    <div>
      <div id="cesiumContainer"></div>
      <Viewer
        id="cesium-container-id"
        ref={viewer}
        // Don't touch these three as it enables offline Cesium use
        imageryProvider={globeTexture}
        baseLayerPicker={false}
        geocoder={false}
        // These two display the time controls
        animation={true}
        timeline={true}
        // Various others to keep disabled
        fullscreenButton={false}
        homeButton={false}
        infoBox={false}
        navigationHelpButton={false}
      >
        <CzmlDataSource data={czml0} /*onChange={handlechange}*/></CzmlDataSource>
        <Globe enableLighting />
        <GlobeToolbar data={String(dataState.series[0]?.fields.find((x) => x.name === 'predicted')?.values.get(0))} />
      </Viewer>
    </div>
  );
};
