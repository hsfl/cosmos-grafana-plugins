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
import { currentMJD, numEqual } from 'utils/utilFunctions';

interface Props extends PanelProps<SimpleOptions> {}

interface CallResourcesResponse {
  Status: number;
  Body: string;
}

const propArgsCacheName = 'CosmosSimPanelNodeList';
const cacheURL = 'http://localhost:3000/';

// Start 5 hours ago so that we can see some stuff displayed elsewhere too (since Grafana dashboard default is last 6 hours)
const defaultTime = currentMJD(-300 / 86400);
const defaultecipx = -5014944.9754353;
const defaultecipy = 4559800.15742258;
const defaultecipz = 40947.5065633976;
const defaultecivx = -2999.70852659995;
const defaultecivy = -3355.15564920299;
const defaultecivz = 6170.92704728395;

// Replacer function for JSON.stringify, ignores null values
const ignoreNull = (key: string, value: any) => {
  return value === null ? undefined : value;
};

export const CosmosSimPanel: React.FC<Props> = ({ width, height, options, data, replaceVariables }) => {
  const [page, setPage] = useState(1);
  const [propagatorArgs, setPropagatorArgs] = useState<PropagatorArgs>({
    start: defaultTime,
    end: null,
    runcount: 90,
    simdt: 60,
    telem: ['poseci', 'veleci'],
    nodes: [
      {
        name: 'node0',
        utc: defaultTime,
        eci: {
          px: defaultecipx,
          py: defaultecipy,
          pz: defaultecipz,
          vx: defaultecivx,
          vy: defaultecivy,
          vz: defaultecivz,
        },
        phys: null,
        kep: null,
        shape: null,
        force: null,
      },
    ],
    db: true,
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
    const payload = JSON.parse(JSON.stringify(propagatorArgs, ignoreNull));
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
      // Cache successful params if some stuff were modified
      if (!numEqual(propagatorArgs.start, defaultTime)) {
        addToCache(propArgsCacheName, cacheURL, propagatorArgs);
      }
    } catch (error: any) {
      const events = await SystemJS.load('app/core/app_events');
      events.emit(AppEvents.alertError, [error.status + ' (' + error.statusText + ')']);
      console.log('error!', error.status, error.statusText);
    }
  };

  // Add a node
  const onAddNodeClick = () => {
    let useDefaults = numEqual(propagatorArgs.start, defaultTime);
    setPropagatorArgs((p) => {
      return {
        ...p,
        nodes: [
          ...p.nodes,
          {
            name: 'node' + p.nodes.length.toString(),
            utc: useDefaults ? defaultTime : 0,
            eci: {
              // Vague offset values taken from a previous run of a string-of-pearls formation
              px: useDefaults ? defaultecipx + 200 * (p.nodes.length + 1) : 0,
              py: useDefaults ? defaultecipy + 200 * (p.nodes.length + 1) : 0,
              pz: useDefaults ? defaultecipz - 200 * (p.nodes.length + 1) : 0,
              vx: useDefaults ? defaultecivx - 0.5 * (p.nodes.length + 1) : 0,
              vy: useDefaults ? defaultecivy + 0.4 * (p.nodes.length + 1) : 0,
              vz: useDefaults ? defaultecivz + 0.03 * (p.nodes.length + 1) : 0,
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
