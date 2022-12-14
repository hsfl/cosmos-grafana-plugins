import React, { useCallback, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Button, InlineFieldRow, Input, Label, Select } from '@grafana/ui';
import { SimpleOptions } from 'types';
import { buildModuleUrl, TileMapServiceImageryProvider, Viewer as CesiumViewer } from 'cesium';
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
      console.log('here1', cesiumViewer.dataSources);
      // Get the czml document we started at the top of this file
      const cosmosDS = cesiumViewer.dataSources.getByName(datasourceName) as CosmosCesiumDatasource[];
      console.log('viewer clock', cesiumViewer.clock, 'ds clock', cosmosDS, cosmosDS[0].clock);
      // There should only ever be one
      // myczml[0] is our CZMLDataSource
      if (cosmosDS.length === 1) {
        console.log('here2', cosmosDS);
        // series is an array of query responses
        // fields is an array of the fields in those responses (in this case, 'historical' and 'predicted')
        // values are the rows within that field
        // const historical: string = data.series[0].fields.find((x) => x.name === 'historical')?.values.get(0);
        const Time = data.series[0].fields.find((field) => field.name === 'Time')?.values;
        const sx = data.series[0].fields.find((field) => field.name === 'sx')?.values;
        const sy = data.series[0].fields.find((field) => field.name === 'sy')?.values;
        const sz = data.series[0].fields.find((field) => field.name === 'sz')?.values;
        if (Time === undefined || sx === undefined || sy === undefined || sz === undefined) {
          return;
        }
        cosmosDS[0].load(Time, sx, sy, sz);
      }
    }
  }, [data, cesiumViewer]);

  useEffect(() => {
    if (cesiumViewer !== undefined) {
      // Add our custom datasource when viewer is loaded to dom
      if (!cesiumViewer.dataSources.getByName(datasourceName).length) {
        const cosmosDS = new CosmosCesiumDatasource(datasourceName);
        cesiumViewer.dataSources.add(cosmosDS);
      }
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
        requestRenderMode={true}
        maximumRenderTimeChange={0.5}
        // Track our custom datasource clock
        automaticallyTrackDataSourceClocks={true}
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
          <Input ref={(ref) => (refInputs.current['sx'] = ref)} type="number" /*value="-49.1624"*/ />
        </div>
        <div style={{ gridRow: 2, gridColumn: 2 }}>
          <Input ref={(ref) => (refInputs.current['sy'] = ref)} type="number" value="166.1392" />
        </div>
        <div style={{ gridRow: 3, gridColumn: 2 }}>
          <Input ref={(ref) => (refInputs.current['sz'] = ref)} type="number" value="501.0841" />
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
