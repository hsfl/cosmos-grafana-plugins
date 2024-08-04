type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

// Quantized change info
export interface UsageChange {
    secondIndex: number;
    resourceChange: number;
}

// Dictionary of resource name to an array of its changed values
type ResourceChanges = {[resourceName: string]: UsageChange[]};

// Holds the changes made to the resource usages
// Passed to the backend
export interface DataChanges {
    eventName: string;
    updated: ResourceChanges;
}

// The parsed dataseries for internal use
export type ResourceUsage = {[resourceName: string]: number[]};

export interface DisplaySeriesTuple {
    // Name of the series
    name: string;
    // Show or hide this series
    show: boolean;
}
