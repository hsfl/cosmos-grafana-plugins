import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BusEventWithPayload, PanelProps } from '@grafana/data';
import { Button, InlineFieldRow, Input, Label, Select } from '@grafana/ui';
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

class TimeEvent extends BusEventWithPayload<number> {
  static type = 'COSMOS-TimeEvent';
}

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
  ];

  const updateDOMRefs = useCallback((data, refIdx) => {
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
        // Various others to keep disabled
        fullscreenButton={false}
        homeButton={false}
        infoBox={false}
        navigationHelpButton={false}
      >
        <CzmlDataSource data={czml0} /*onChange={handlechange}*/></CzmlDataSource>
        <Globe enableLighting />
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
