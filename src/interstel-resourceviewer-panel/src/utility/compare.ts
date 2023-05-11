import { UsageChange, DataChanges,  type ResourceUsage } from 'types';

// Compares the modified dataseries to the original, and returns the changes made as a DataChange object
export const diffResourceChanges = (modifiedDataSeries: ResourceUsage, originalDataSeries: ResourceUsage): DataChanges => {
  // Collection of changes to push to db
  const dataChanges: DataChanges = {
    eventName:'',
    updated: {},
  };
  Object.keys(modifiedDataSeries).forEach((resourceName) => {
    const modified = modifiedDataSeries[resourceName];
    const original = originalDataSeries[resourceName];
    const changes: UsageChange[] = dataChanges.updated[resourceName] = [];
    // New resource was added to this event
    if (original === undefined) {
      modified.forEach((v,i) => {
        changes.push({secondIndex: i, resourceChange: v});
      });
      return;
    }
    // Find changes
    // Handle changes in event duration afterward
    for (let i=0; i<Math.min(modified.length,original.length); i++) {
      // Assumes both modified and orig arrays are already sorted and that timestep delta is 1 (i.e., timeDomain is [0,1,2,3,...])
      if (modified[i] !== original[i]) {
        changes.push({secondIndex: i, resourceChange: modified[i]});
      }
    };
    // Handle changes in event duration
    // If the modified is shorter, then change all usage to 0 from the orig, which backend handles as deletion
    if (modified.length < original.length) {
      for (let i=modified.length; i<original.length; i++) {
        changes.push({secondIndex: i, resourceChange: 0});
      };
    }
    // If the modified is longer, then it's treated as all new changes
    else if (modified.length > original.length) {
      for (let i=original.length; i<modified.length; i++) {
        changes.push({secondIndex: i, resourceChange: modified[i]});
      };
    }
  });

  return dataChanges;
}
