import { defaults } from 'lodash';

import React from 'react';
import { Button, InlineFieldRow } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { nodeSimParams } from 'QueryFieldsSim';
import { nodeQueryParams } from 'QueryFieldsOperational';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Note: state is currently stored in the prop, which means everything will rerender after every
// keystroke in the fields, which is incredibly silly.
// Perhaps a combination of a settimeout and useeffect to update the prop only after a second after
// the user is finished typing could be better.
export const QueryEditor = (props: Props) => {
  const query = defaults(props.query, defaultQuery);
  const { isSimMode, simNodeList } = query;

  // Handle Run Propagator click, TODO: move to separate plugin
  const onSubmitClick = () => {
    const { onRunQuery } = props;
    onRunQuery();
  };

  // Add a node to the query
  const onAddNodeClick = () => {
    const { onChange, query } = props;
    onChange({
      ...query,
      simNodeList: [...simNodeList, { node_name: '', utc: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0 }],
    });
  };

  // Remove last node from query
  const onRemoveNodeClick = () => {
    const { onChange, query } = props;
    if (query.simNodeList.length > 1) {
      onChange({
        ...query,
        simNodeList: simNodeList.slice(0, -1),
      });
    }
  };

  // For generic use of the propagator for all results
  const SimulationMode = () => {
    return simNodeList.map((el, i) => nodeSimParams(i, props, query));
  };

  // For querying the database for existing values, using the propagator to provide if necessary
  const OperationalMode = () => {
    return nodeQueryParams(props, query);
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
