import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BusEventWithPayload, PanelData, PanelProps } from '@grafana/data';
import { Button, InlineFieldRow, Input, Label, Select } from '@grafana/ui';
import { CzmlPacket, SimpleOptions } from 'types';
import {
  buildModuleUrl,
  TileMapServiceImageryProvider,
  Viewer as CesiumViewer,
  CzmlDataSource as CesiumCzmlDataSource,
  SampledPositionProperty as CesiumSampledPositionProperty,
  JulianDate,
} from 'cesium';
import { CesiumComponentRef, CzmlDataSource, Globe, Viewer } from 'resium';
import { GlobeToolbar } from './GlobeToolbar';
import './css/globe.css';
import './css/widgets.css';
//import { CosmosCesiumDatasource } from './helpers/CosmosCesiumDatasource';

//require('../node_modules/cesium/Source/Widgets/widgets.css');
//import 'Cesium/Widgets/widgets.css';

const globeTexture = new TileMapServiceImageryProvider({
  url: buildModuleUrl('Assets/Textures/NaturalEarthII'),
});

interface Props extends PanelProps<SimpleOptions> {}

class TimeEvent extends BusEventWithPayload<number> {
  static type = 'COSMOS-TimeEvent';
}

const offset = 59270.9494213 * 86400; //59483.25*86400;
const lat0 = 20;

export const OrbitDisplayPanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  // Cesium object
  const [cesiumViewer, setCesiumViewer] = useState<CesiumViewer>();
  // The index into the data array
  const refIdx = useRef<number>(0);
  // DOM text references for animation
  const refLatitude = useRef<HTMLInputElement>(null);

  // Subscribe to time panel's time events
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
      refIdx.current = event.payload;
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  const czml0 = [
    {
      id: 'document',
      name: 'CosmosOrbitalDisplay',
      version: '1.0',
    },
    {
      id: 'TEST',
      name: 'Model',
      //availability: "2021-09-26T06:00:00Z/2021-09-26T08:30:00Z",
      availability: '2021-02-25T22:47:10Z/2021-02-26T01:17:10Z',
      position: {
        cartographicDegrees: [
          // time(s) lon lat alt
          offset + 0,
          lat0 - 0,
          22,
          600000,
          offset + 600,
          lat0 - 20,
          22,
          600000,
          offset + 1200,
          lat0 - 40,
          22,
          600000,
          offset + 1800,
          lat0 - 60,
          22,
          600000,
          offset + 2400,
          lat0 - 80,
          22,
          600000,
          offset + 3000,
          lat0 - 100,
          22,
          600000,
          offset + 3600,
          lat0 - 120,
          22,
          600000,
          offset + 4200,
          lat0 - 140,
          22,
          600000,
          offset + 4800,
          lat0 - 160,
          22,
          600000,
          offset + 5400,
          lat0 - 180,
          22,
          600000,
          offset + 6000,
          lat0 - 200,
          22,
          600000,
          offset + 6600,
          lat0 - 220,
          22,
          600000,
          offset + 7200,
          lat0 - 240,
          22,
          600000,
          offset + 7800,
          lat0 - 260,
          22,
          600000,
          offset + 8400,
          lat0 - 280,
          22,
          600000,
          offset + 9000,
          lat0 - 300,
          22,
          600000,
          offset + 9600,
          lat0 - 320,
          22,
          600000,
          //offset+9600, lat0 -  0, 22,  600000,
        ],
        epoch: '1858-11-17T00:00:00Z',
        interpolationAlgorithm: 'LAGRANGE',
        interpolationDegree: 3,
        referenceFrame: 'FIXED',
      },
      model: {
        gltf: './public/plugins/hsfl-orbit-display/img/GenericSatellite.glb',
        scale: 1.0,
        minimumPixelSize: 64,
      },
      path: {
        show: true,
      },
    },
  ];

  const updateDOMRefs = useCallback((data: PanelData, refIdx: React.MutableRefObject<number>) => {
    if (
      !data.series.length || // Check if there is valid query result
      data.series[0].fields.length < 2 || // Check if there are time and value columns in query
      refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      refIdx.current = 0;
      return;
    }
    if (refLatitude.current !== null) {
      refLatitude.current.value = data.series[0].fields[1].values.get(refIdx.current);
      refIdx.current++;
    }
    return;
  }, []);

  useEffect(() => {
    updateDOMRefs(data, refIdx);
    const updateTime = setInterval(() => {
      updateDOMRefs(data, refIdx);
    }, 500);
    return () => {
      clearInterval(updateTime);
    };
  }, [updateDOMRefs, data /* add event here */]);

  // useEffect(() => {
  //   //console.log(data);
  //   //setDataState(data);
  // }, [data]);

  // Update Cesium viewer with latest data
  useEffect(() => {
    let myczml = cesiumViewer?.dataSources.getByName('CosmosOrbitalDisplay') as CesiumCzmlDataSource[];
    if (cesiumViewer !== undefined && myczml.length) {
      if (myczml[0].entities.getById('mytestentity') === undefined) {
        const pos: CesiumSampledPositionProperty = new CesiumSampledPositionProperty(0);
        pos.addSamplesPackedArray([0, 10000000, 0, 0, 953550008, 10000000, 0, 0], JulianDate.fromIso8601('2021-02-26'));
        myczml[0].entities.add({
          position: pos,
          model: {
            uri: './public/plugins/hsfl-orbit-display/img/GenericSatellite.glb',
            scale: 1.0,
            minimumPixelSize: 64,
          },
        });
      }
      if (!cesiumViewer.dataSources.getByName('mytestdatasource').length) {
        //cesiumViewer.dataSources.add(new CosmosCesiumDatasource('mytestdatasource'));
        console.log(cesiumViewer.dataSources);
      }
    }
    if (cesiumViewer === undefined || !data.series.length) {
      return;
    }
    // No Cesium Ion services are being used, hide watermark
    cesiumViewer.cesiumWidget.creditContainer.parentNode?.removeChild(cesiumViewer.cesiumWidget.creditContainer);
    if (cesiumViewer.dataSources.length) {
      // Get the czml document we started at the top of this file
      let myczml = cesiumViewer.dataSources.getByName('CosmosOrbitalDisplay') as CesiumCzmlDataSource[];
      // There should only ever be one
      // myczml[0] is our CZMLDataSource
      if (myczml.length === 1) {
        // series is an array of query responses
        // fields is an array of the fields in those responses (in this case, 'historical' and 'predicted')
        // values are the rows within that field
        let historical: string = data.series[0].fields.find((x) => x.name === 'historical')?.values.get(0);
        if (historical !== undefined) {
          const czmlified: CzmlPacket[] = JSON.parse(historical);
          myczml[0].process(czmlified);
        }
        let predicted: string = data.series[0].fields.find((x) => x.name === 'predicted')?.values.get(0);
        if (predicted !== undefined) {
          const czmlified: CzmlPacket[] = JSON.parse(predicted);
          myczml[0].process(czmlified);
        }
      }
    }
  }, [data, cesiumViewer]);

  // Callback for Cesium viewer dom reference acquisition
  const refViewer = useCallback((viewer: CesiumComponentRef<CesiumViewer> | null) => {
    if (viewer !== null && viewer.cesiumElement !== undefined) {
      setCesiumViewer(viewer.cesiumElement);
    }
  }, []);

  return (
    <div style={{ width: width, height: height, overflow: 'auto' }}>
      <div id="cesiumContainer"></div>
      <Viewer
        id="cesium-container-id"
        ref={refViewer}
        style={{ height: '70%' }}
        // Don't touch these three as it enables offline Cesium use
        imageryProvider={globeTexture}
        baseLayerPicker={false}
        geocoder={false}
        creditContainer={undefined}
        // These two display the time controls
        animation={options.showAnimation}
        timeline={options.showTimeline}
        // Enables explicit render mode
        requestRenderMode={true}
        maximumRenderTimeChange={0.5}
        // Various others to keep disabled
        fullscreenButton={false}
        homeButton={false}
        infoBox={false}
        navigationHelpButton={false}
      >
        <CzmlDataSource data={czml0} /*onChange={handlechange}*/></CzmlDataSource>
        <Globe enableLighting dynamicAtmosphereLighting={false} showGroundAtmosphere={false} />
        <GlobeToolbar data={String(data.series[0]?.fields.find((x) => x.name === 'predicted')?.values.get(0))} />
      </Viewer>
      <InlineFieldRow>
        <Label>
          <Select
            value={{ label: 'Target Earth' }}
            options={[{ label: 'Target Earth' }, { label: 'Archival' }]}
            onChange={() => {}}
            width={13}
          />
          <Select
            value={{ label: 'View Normal' }}
            options={[{ label: 'View Normal' }, { label: 'Archival' }]}
            onChange={() => {}}
            width={13}
          />
          <Button
            style={{ marginInlineStart: '1em' }}
            size={'md'}
            variant={'secondary'}
            fill={'outline'}
            onClick={() => {}}
          >
            View Options
          </Button>
        </Label>
      </InlineFieldRow>
      <InlineFieldRow>
        <Label>
          {'Latitude'}
          <Input ref={refLatitude} style={{ marginInline: '1em' }} width={10} type="number" /*value="-49.1624"*/ />
          {'in Beta Angle'}
          <Input style={{ marginInlineStart: '1em' }} width={8} type="number" value="" />
        </Label>
      </InlineFieldRow>
      <InlineFieldRow>
        <Label>
          {'Longitude'}
          <Input style={{ marginInline: '1em' }} width={10} type="number" value="166.1392" />
          {'Time to Eclipse'}
          <Input style={{ marginInlineStart: '1em' }} width={8} type="number" value="" />
        </Label>
      </InlineFieldRow>
      <InlineFieldRow>
        <Label>
          {'Altitude'}
          <Input style={{ marginInline: '1em' }} width={10} type="number" value="501.0841" />
          {'Time to Sunlight'}
          <Input style={{ marginInlineStart: '1em' }} width={8} type="number" value="" />
        </Label>
      </InlineFieldRow>
    </div>
  );
};
