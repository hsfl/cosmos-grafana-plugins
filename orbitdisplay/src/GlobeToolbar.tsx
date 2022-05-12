import React, { useState } from 'react';
import { Button, IconButton, Modal } from '@grafana/ui';
import { CzmlPacket, HashNum } from 'types';

// Currently only works for simulated data from the orbital propagator
// Sorts by timestamp
const czmlToTabDelim = (czml: string) => {
  let tabdata = '';
  let czmljson: CzmlPacket[];

  try {
    czmljson = JSON.parse(czml);
  } catch (e) {
    tabdata = 'Error in converting czml!\n';
    if (typeof e === 'string') {
      tabdata += e + '\n';
    } else if (e instanceof Error) {
      tabdata += e.message + '\n';
    }
    tabdata += 'CZML string:\n' + czml + '\n';
    return tabdata;
  }

  // List of unique node names
  let nodes: string[] = [];
  // Dict mapping node names to index positions in czmljson
  // Needs to be changed if a node's data becomes separated into multiple packets
  let node2idx: HashNum = {};
  // To refer to starting epochs later
  let epochs: HashNum = {};
  // Indexes into each list, use later for time sorting
  let t_idx_map: HashNum = {};

  // Build up dicts for later use, primarily interested in position and attitudes
  // note: this assumes one packet per node, may need adjust later
  for (let i = 0; i < czmljson.length; i++) {
    // Not a node
    if (czmljson[i].id === 'document') {
      continue;
    }

    // Assume that position will always be included in orbital sim data, hence the lack of suffix
    const pos = czmljson[i]?.position;
    if (pos?.cartesian !== undefined) {
      // Grab unique node names
      if (!nodes.includes(czmljson[i].id)) {
        nodes.push(czmljson[i].id);
      }
      // populate dicts
      node2idx[czmljson[i].id] = i;
      const epoch_utc = Date.parse(pos.epoch);
      const epoch_mjd = 40587 + epoch_utc / 1000 / 86400;
      epochs[czmljson[i].id] = epoch_mjd;
      t_idx_map[czmljson[i].id] = 0;
    }
    // Any additional orbital stuff gets suffixes (e.g., 'o' in the case of orientation, etc.)
    // Also assumes that the extra stuff has timestamps aligned with the position ones
    // orientation + 'o'
    const ori = czmljson[i]?.orientation;
    if (ori?.unitQuaternion !== undefined) {
      node2idx[czmljson[i].id + 'o'] = i;
      const epoch_utc = Date.parse(ori.epoch);
      const epoch_mjd = 40587 + epoch_utc / 1000 / 86400;
      // Note: not actually using 'additional orbital stuff' epochs currently
      epochs[czmljson[i].id + 'o'] = epoch_mjd;
      t_idx_map[czmljson[i].id + 'o'] = 0;
    }
  } // end for

  // Add headers
  tabdata += 'node_name\ttime\teci_x\teci_y\teci_z\tatt_w\tatt_x\tatt_y\tatt_z\n';

  // Advance iterators for each node in lidx until all iterators have reached their end,
  // grabbing the earliest timestamp per iteration
  while (true) {
    let earliest_time = Number.MAX_VALUE;
    let earliest_node = '';
    // First get earliest time
    for (let node of nodes) {
      // Position check, will always be in data
      const node_pos = czmljson[node2idx[node]].position!.cartesian;
      const pos_t_idx = t_idx_map[node];
      if (pos_t_idx + 3 < node_pos.length) {
        const mjd = epochs[node] + node_pos[pos_t_idx] / 86400;
        // May also need to check for floating point non-equality depending on how we want to output stuff
        if (mjd < earliest_time) {
          earliest_time = mjd;
          earliest_node = node;
        }
      }
    }
    // Nothing set if all iterators fully advanced
    if (earliest_node === '') {
      break;
    }
    // Create entry for earliest timestamp, then advance its iterator
    const name = czmljson[node2idx[earliest_node]].id;
    const pos = czmljson[node2idx[earliest_node]].position!.cartesian;
    const t_idx = t_idx_map[earliest_node];
    //            node     mjd               eci x              eci y              eci z
    tabdata += `${name}\t${earliest_time}\t${pos[t_idx + 1]}\t${pos[t_idx + 2]}\t${pos[t_idx + 3]}`;
    // Additional orbital stuff, assumes aligned timestamps with positional data (same epochs and offsets)
    // orientation
    if (earliest_node + 'o' in node2idx) {
      const node_ori = czmljson[node2idx[earliest_node]].orientation!.unitQuaternion;
      const ori_t_idx = t_idx_map[earliest_node + 'o'];
      if (ori_t_idx + 4 < node_ori.length) {
        //              w                           x                           y
        tabdata += `\t${node_ori[ori_t_idx + 1]}\t${node_ori[ori_t_idx + 2]}\t${node_ori[ori_t_idx + 3]}\t${
          //z
          node_ori[ori_t_idx + 4]
        }`;
        // Advance iterator
        t_idx_map[earliest_node + 'o'] += 5;
      }
    }
    // Complete line
    tabdata += '\n';
    // Advance iterator
    t_idx_map[earliest_node] += 4;
  } // end while

  return tabdata;
};

export const GlobeToolbar = ({ data }: { data: string }) => {
  // List of formations, hardcoded for now
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // Downloadable data file stored here
  // let link:HTMLAnchorElement | null = null;

  // Convert czml string to tab-delimitted format then save file to Downloads
  const onSaveClick = () => {
    const t = new Date();
    const timestamp = `${t.getFullYear()}${t.getMonth()}${t.getDate()}${t.getHours()}${t.getMinutes()}${t.getSeconds()}${t.getMilliseconds()}`;
    let link: HTMLAnchorElement = document.createElement('a');
    const tabdata = czmlToTabDelim(data);
    link.href = 'data:application/octet-stream,' + encodeURIComponent(tabdata);
    const filename = `data${timestamp}.txt`;
    link.download = filename;
    link.click();
  };

  const onModalClose = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <div className="globetoolbar-container">
        <div className="globetoolbar-container-left">
          <IconButton name="cog" size="lg" variant="secondary" onClick={() => setModalIsOpen(true)}></IconButton>
        </div>
      </div>
      <Modal title="Orbit Data" isOpen={modalIsOpen} onDismiss={onModalClose}>
        <Button variant="primary" onClick={onSaveClick}>
          Save Tab-delimited file
        </Button>
      </Modal>
    </div>
  );
};
