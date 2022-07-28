import React, { useEffect, useState } from 'react';
import { AppEvents, PanelProps } from '@grafana/data';
import { getBackendSrv, getDataSourceSrv, SystemJS } from '@grafana/runtime';
import { Button, Pagination } from '@grafana/ui';
import { SimpleOptions } from 'types';
import { simForm } from 'formUI/SimForm';
import { nodeForm } from 'formUI/NodeForm';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropagatorArgs } from './types';
import { addToCache, getData } from './utils/caching';

interface Props extends PanelProps<SimpleOptions> {}

interface CallResourcesResponse {
  Status: number;
  Body: string;
}

const propArgsCacheName = 'CosmosSimPanelNodeList';
const cacheURL = 'http://localhost:3000/';

export const CosmosSimPanel: React.FC<Props> = ({ width, height, options, data, replaceVariables }) => {
  const [page, setPage] = useState(1);
  const [propagatorArgs, setPropagatorArgs] = useState<PropagatorArgs>({
    start: 0,
    end: null,
    runcount: 1,
    simdt: 60,
    telem: ['poseci'],
    nodes: [
      {
        node_name: '',
        utc: 0,
        eci: {
          px: 0,
          py: 0,
          pz: 0,
          vx: 0,
          vy: 0,
          vz: 0,
        },
        phys: null,
        kep: null,
        shape: null,
        force: null,
      },
    ],
  });

  useEffect(() => {
    // Note to self: does localhost work on deployment too?
    getData(propArgsCacheName, cacheURL).then((resp) => {
      if (!resp) {
        return;
      }
      setPropagatorArgs(resp);
    });
  }, []);

  const onSubmitClick = async () => {
    const payload = propagatorArgs;
    const ds = await getDataSourceSrv().get('orbit-datasource');
    try {
      const observable = getBackendSrv()
        .fetch<CallResourcesResponse>({
          method: 'POST',
          url: `api/datasources/${ds.id}/resources/propagator_db`,
          data: payload,
        })
        .pipe(map((response) => response));
      const resp = await firstValueFrom(observable);
      console.log('success!', resp.data);
      const events = await SystemJS.load('app/core/app_events');
      events.emit(AppEvents.alertSuccess, [resp.status + ' (' + resp.statusText + ')']);
      // Cache successful params
      addToCache(propArgsCacheName, cacheURL, propagatorArgs);
    } catch (error: any) {
      const events = await SystemJS.load('app/core/app_events');
      events.emit(AppEvents.alertError, [error.status + ' (' + error.statusText + ')']);
      console.log('error!', error.status, error.statusText);
    }
  };

  // Add a node
  const onAddNodeClick = () => {
    setPropagatorArgs((p) => {
      return {
        ...p,
        nodes: [
          ...p.nodes,
          {
            node_name: '',
            utc: 0,
            eci: {
              px: 0,
              py: 0,
              pz: 0,
              vx: 0,
              vy: 0,
              vz: 0,
            },
            phys: null,
            kep: null,
            shape: null,
            force: null,
          },
        ],
      };
    });
  };

  // Remove last node from query
  const onRemoveNodeClick = () => {
    if (propagatorArgs.nodes.length > 1) {
      setPropagatorArgs((p) => {
        return { ...p, nodes: p.nodes.slice(0, -1) };
      });
    }
  };

  return (
    <div style={{ width: width, height: height, overflow: 'auto' }}>
      <div style={{ marginBlockEnd: '1em' }}>
        {simForm(propagatorArgs, setPropagatorArgs)}
        {nodeForm(propagatorArgs.nodes[page - 1], page, setPropagatorArgs)}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Button
            size={'md'}
            variant={'secondary'}
            fill={'outline'}
            icon={'minus-circle'}
            onClick={onRemoveNodeClick}
          />
          <Button size={'md'} variant={'secondary'} fill={'outline'} icon={'plus-circle'} onClick={onAddNodeClick} />
          <Button
            style={{ marginInlineStart: '5em' }}
            size={'md'}
            variant={'primary'}
            fill={'outline'}
            onClick={onSubmitClick}
          >
            Submit
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Pagination numberOfPages={propagatorArgs.nodes.length} currentPage={page} onNavigate={setPage} />
      </div>
    </div>
  );
};
