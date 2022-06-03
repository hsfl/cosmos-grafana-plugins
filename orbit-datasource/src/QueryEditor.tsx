import { defaults } from 'lodash';

import React from 'react';
import { Button, InlineFieldRow } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { nodeSimParams } from 'QueryFieldsSim';
import { nodeOpParams } from 'QueryFieldsOperational';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Note: state is currently stored in the prop, which means everything will rerender after every
// keystroke in the fields, which is incredibly silly.
// Perhaps a combination of a settimeout and useeffect to update the prop only after a second after
// the user is finished typing could be better.
export const QueryEditor = (props: Props) => {
  const query = defaults(props.query, defaultQuery);
  const { isSimMode, opNodeList, simNodeList } = query;

  // Handle Run Propagator click, TODO: move to separate plugin
  const onSubmitClick = () => {
    const { onRunQuery } = props;
    onRunQuery();
  };

  // Add a node to the query
  const onAddNodeClick = () => {
    const { onChange, query } = props;
    if (isSimMode) {
      onChange({
        ...query,
        simNodeList: [...simNodeList, { node_name: '', utc: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0 }],
      });
    } else {
      onChange({
        ...query,
        opNodeList: [
          ...opNodeList,
          {
            node_name: '',
            tag_name: opNodeList[0].tag_name,
            tag_value: opNodeList[0].tag_value,
            px: opNodeList[0].px,
            py: opNodeList[0].py,
            pz: opNodeList[0].pz,
            vx: opNodeList[0].vx,
            vy: opNodeList[0].vy,
            vz: opNodeList[0].vz,
          },
        ],
      });
    }
  };

  // Remove last node from query
  const onRemoveNodeClick = () => {
    const { onChange, query } = props;
    if (isSimMode) {
      if (query.simNodeList.length > 1) {
        onChange({
          ...query,
          simNodeList: simNodeList.slice(0, -1),
        });
      }
    } else {
      if (query.opNodeList.length > 1) {
        onChange({
          ...query,
          opNodeList: opNodeList.slice(0, -1),
        });
      }
    }
  };

  // For generic use of the propagator for all results
  const SimulationMode = () => {
    return simNodeList.map((el, i) => nodeSimParams(i, props, query));
  };

  // For querying the database for existing values, using the propagator to provide if necessary
  const OperationalMode = () => {
    return opNodeList.map((el, i) => nodeOpParams(i, props, query));
  };

  return (
    <div>
      {isSimMode ? SimulationMode() : OperationalMode()}
      <InlineFieldRow>
        <Button onClick={onAddNodeClick}>Add Node +</Button>
        <Button onClick={onRemoveNodeClick}>Remove Node -</Button>
        {isSimMode ? <Button onClick={onSubmitClick}>Run Propagator</Button> : null}
      </InlineFieldRow>
    </div>
  );
};
