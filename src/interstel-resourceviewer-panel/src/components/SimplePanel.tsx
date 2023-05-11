import React, { useEffect, useCallback, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Button } from '@grafana/ui';
import { ResourceViewer } from 'components/ResourceViewer';
import { ResourceEditorTabular } from 'components/ResourceEditorTabular';
import { diffResourceChanges } from 'utility/compare';
import { SimpleOptions, type ResourceUsage } from 'types';

enum ViewMode {
  GRAPH, TABULAR, GRAPHEDITOR, TABLEEDITOR
};

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  // Timestamps
  const [domain, setDomain] = useState<number[]>([]);
  // The original data before changes, compare before saving to get only the changes, or to reset all changes
  const [dataSeriesOriginal, setDataSeriesOriginal] = useState<ResourceUsage>({});
  // Resource usage at the timestamp
  const [dataSeriesModified, setDataSeriesModified] = useState<ResourceUsage>({});
  // State for view mode of the data
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRAPH);

  // Update state with new data
  useEffect(() => {
    if (!data.series.length) {
      return;
    }
    const time_domain = data.series[0].fields.find((x) => x.name === 'time_seconds');
    if (time_domain === undefined) {
      return;
    }
    setDomain(time_domain.values.toArray());
    // Grab every other series
    setDataSeriesOriginal({});
    setDataSeriesModified({});
    data.series[0].fields.forEach((v) => {
      if (v.name === 'time_seconds') {
        return;
      }
      setDataSeriesOriginal(dataSeries => ({...dataSeries, [v.name]: v.values.toArray()}));
      setDataSeriesModified(dataSeries => ({...dataSeries, [v.name]: [...v.values.toArray()]}));
    });
  }, [data]);

  // Callback for children to set dataSeries
  // Modifies a single resource usage value. If it's a new change, updates the changed values list
  const setData = useCallback((name: string, idx: number, value: number) => {
    setDataSeriesModified(dataSeries => {
      if (dataSeries[name] !== undefined && dataSeries[name].length > idx) {
        dataSeries[name][idx] = value;
      }
      return {...dataSeries}
    });
  }, [setDataSeriesModified]);

  const onChangeViewClick = () => {
    setViewMode(viewMode => viewMode === ViewMode.GRAPH ? ViewMode.TABULAR : ViewMode.GRAPH);
  };

  const onSaveClick = () => {
    // Get only the changes, then send to backend
    console.log('Save clicked', diffResourceChanges(dataSeriesModified, dataSeriesOriginal));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
        <Button
          variant='secondary'
          icon={viewMode === ViewMode.GRAPH ? 'table' : 'graph-bar'}
          onClick={onChangeViewClick}
        />
        <Button
          variant='secondary'
          icon={'save'}
          onClick={onSaveClick}
        />
      </div>
      {
        viewMode === ViewMode.GRAPH ? <ResourceViewer domain={domain} dataSeries={dataSeriesModified} width={width} height={height-40} /> :
        viewMode === ViewMode.TABULAR ? <ResourceEditorTabular domain={domain} dataSeries={dataSeriesModified} setData={setData} width={width} height={height-40} /> :
        null
      }
        
    </div>
  );
};
