import React, { useCallback, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Button, InlineFieldRow, Input, Label, Select } from '@grafana/ui';
import { SimpleOptions } from 'types';
import {
  buildModuleUrl,
  ClockRange,
  DataSourceCollection,
  JulianDate,
  TileMapServiceImageryProvider,
  Viewer as CesiumViewer,
} from 'cesium';
import { CesiumComponentRef, Globe, Viewer } from 'resium';
import { GlobeToolbar } from './GlobeToolbar';
import './css/globe.css';
import './css/widgets.css';
import { CosmosCesiumDatasource } from './helpers/CosmosCesiumDatasource';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

const globeTexture = new TileMapServiceImageryProvider({
  url: buildModuleUrl('Assets/Textures/NaturalEarthII'),
});

interface Props extends PanelProps<SimpleOptions> {}

const datasourceName = 'CosmosCesiumDatasource';
const datasources = new DataSourceCollection();
datasources.add(new CosmosCesiumDatasource(datasourceName));

export const OrbitDisplayPanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  // Cesium object
  const [cesiumViewer, setCesiumViewer] = useState<CesiumViewer>();

  const [refInputs, updateDOMRefs] = useDomUpdate(cesiumViewer);
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  // Update Cesium viewer with latest data
  useEffect(() => {
    if (cesiumViewer === undefined || !data.series.length) {
      return;
    }
    // No Cesium Ion services are being used, hide watermark
    cesiumViewer.cesiumWidget.creditContainer.parentNode?.removeChild(cesiumViewer.cesiumWidget.creditContainer);

    // Load new data into custom cesium datasource
    if (cesiumViewer.dataSources.length) {
      // console.log('here1', cesiumViewer.dataSources);
      // Get the czml document we started at the top of this file
      const cosmosDS = cesiumViewer.dataSources.get(0) as CosmosCesiumDatasource;
      // console.log('viewer clock', cesiumViewer.clock, 'ds clock', cosmosDS, cosmosDS.clock);
      // There should only ever be one
      // myczml[0] is our CZMLDataSource
      // if (cosmosDS.length === 1) {
      // console.log('here2', cosmosDS, 'timerange', data.timeRange);
      // series is an array of query responses
      // fields is an array of the fields in those responses (in this case, 'historical' and 'predicted')
      // values are the rows within that field
      // const historical: string = data.series[0].fields.find((x) => x.name === 'historical')?.values.get(0);
      const Time = data.series[0].fields.find((field) => field.name === 'Time')?.values;
      const sx = data.series[0].fields.find((field) => field.name === 's_x')?.values;
      const sy = data.series[0].fields.find((field) => field.name === 's_y')?.values;
      const sz = data.series[0].fields.find((field) => field.name === 's_z')?.values;
      if (Time === undefined || sx === undefined || sy === undefined || sz === undefined) {
        return;
      }
      cosmosDS.load(Time, sx, sy, sz, cesiumViewer.clock);
      // data.timeRange is in unix seconds, but the data.series Time is in unix milliseconds
      const timeRangeStart = JulianDate.fromDate(new Date(data.timeRange.from.unix() * 1000));
      const timeRangeStop = JulianDate.fromDate(new Date(data.timeRange.to.unix() * 1000));
      if (cesiumViewer.timeline !== undefined) {
        cesiumViewer.timeline.zoomTo(timeRangeStart, timeRangeStop);
      }
    //   cesiumViewer.clock.startTime = timeRangeStart;
    //   cesiumViewer.clock.stopTime = timeRangeStop;
    //   if (JulianDate.lessThan(cesiumViewer.clock.currentTime, cesiumViewer.clock.startTime)) {
    //     cesiumViewer.clock.currentTime = cesiumViewer.clock.startTime.clone();
    //   } else if (JulianDate.lessThan(cesiumViewer.clock.stopTime, cesiumViewer.clock.currentTime)) {
    //     cesiumViewer.clock.currentTime = cesiumViewer.clock.stopTime.clone();
    //   }
    //   cesiumViewer.clock.clockRange = ClockRange.CLAMPED;
      // }
    }
  }, [data, cesiumViewer]);

  useEffect(() => {
    if (cesiumViewer !== undefined) {
      // Add our custom datasource when viewer is loaded to dom
      if (!cesiumViewer.dataSources.length) {
        //cesiumViewer.dataSources.add();
      }
      // Disable fancy transition animations
      cesiumViewer.sceneModePicker.viewModel.duration = 0;
    }
  }, [cesiumViewer]);

  // Callback for Cesium viewer dom reference acquisition
  const refViewer = useCallback((viewer: CesiumComponentRef<CesiumViewer> | null) => {
    if (viewer !== null && viewer.cesiumElement !== undefined) {
      setCesiumViewer(viewer.cesiumElement);
    }
  }, []);

  return (
    <div style={{ width: width, height: height, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
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
        requestRenderMode={false}
        //maximumRenderTimeChange={0.5}
        // Track our custom datasource clock
        // automaticallyTrackDataSourceClocks={true}
        dataSources={datasources}
        //clockTrackedDataSource={datasources.get(0)}
        // clockViewModel={clockvm}
        // Various others to keep disabled
        fullscreenButton={false}
        homeButton={false}
        infoBox={false}
        navigationHelpButton={false}
      >
        <Globe enableLighting dynamicAtmosphereLighting={false} showGroundAtmosphere={false} />
        <GlobeToolbar data={String(data.series[0]?.fields.find((x) => x.name === 'predicted')?.values.get(0))} />
      </Viewer>
      <InlineFieldRow>
        <Label>
          <Select
            value={{ label: 'Target Earth' }}
            options={[{ label: 'Target Earth' }, { label: 'Target Sat' }]}
            onChange={() => {}}
            width="auto"
          />
          <Select
            value={{ label: 'View Normal' }}
            options={[{ label: 'View Normal' }, { label: 'View Nadir' }]}
            onChange={() => {}}
            width="auto"
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
      <div
        style={{
          alignItems: 'center',
          display: 'grid',
          columnGap: '1em',
          gridTemplateRows: 'auto auto auto',
          gridTemplateColumns: 'auto 0.5fr 0px auto 0.5fr',
        }}
      >
        <div style={{ gridRow: 1, gridColumn: 1 }}>Latitude</div>
        <div style={{ gridRow: 2, gridColumn: 1 }}>Longitude</div>
        <div style={{ gridRow: 3, gridColumn: 1 }}>Altitude</div>
        <div style={{ gridRow: 1, gridColumn: 2 }}>
          <Input ref={(ref) => (refInputs.current['s_x'] = ref)} type="number" value="0" />
        </div>
        <div style={{ gridRow: 2, gridColumn: 2 }}>
          <Input ref={(ref) => (refInputs.current['s_y'] = ref)} type="number" value="0" />
        </div>
        <div style={{ gridRow: 3, gridColumn: 2 }}>
          <Input ref={(ref) => (refInputs.current['s_z'] = ref)} type="number" value="0" />
        </div>
        <div style={{ gridRow: 1, gridColumn: 4 }}>in Beta Angle</div>
        <div style={{ gridRow: 2, gridColumn: 4 }}>Time to Eclipse</div>
        <div style={{ gridRow: 3, gridColumn: 4 }}>Time to Sunlight</div>
        <div style={{ gridRow: 1, gridColumn: 5 }}>
          <Input ref={(ref) => (refInputs.current['beta'] = ref)} type="number" value="" />
        </div>
        <div style={{ gridRow: 2, gridColumn: 5 }}>
          <Input ref={(ref) => (refInputs.current['eclipse'] = ref)} type="number" value="" />
        </div>
        <div style={{ gridRow: 3, gridColumn: 5 }}>
          <Input ref={(ref) => (refInputs.current['sunlight'] = ref)} type="number" value="" />
        </div>
      </div>
    </div>
  );
};
