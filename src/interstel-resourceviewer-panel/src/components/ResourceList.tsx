import React from 'react';
import { DisplaySeriesTuple } from 'types';

// A component for the graphical view of the resource usage levels

const colors = ["lightcoral", "skyblue", "lightgreen", "lightsalmon"];

export const ResourceList = (props: {
  // Array of series to display
  displayedSeries: DisplaySeriesTuple[],
  // Callback function to change displayedSeries
  setDisplayedSeriesCallback: (displayedSeries: DisplaySeriesTuple[]) => void,
  // Width of the render window for this graph
  width: number,
  // Height of the render window for this graph
  height: number
}) => {
  const { displayedSeries, setDisplayedSeriesCallback, width, height } = props;

  if (width < 10) {
    return null;
  }

  return (
  <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', height: height, width: width, overflow: 'scroll' }}>
        {
          // --- The resource names ---
          // This is a list of resource names, which are clickable buttons that show or hide
          // that resource in the graph view.
          // Iterate over every resource
          displayedSeries.map((dsTuple, series_idx) => {
            return (
                <div
                  key={`display-resource-name-${series_idx}`}
                  style={{
                    userSelect: 'none',
                    background: colors[series_idx],
                    margin: '0.5em',
                    padding: '0.5em',
                    borderRadius: '0.5em',
                    width: 'fit-content',
                    opacity: displayedSeries.some(x => x.name === dsTuple.name && x.show) ? 0.75 : 0.25
                  }}
                  onClick={() => {
                    let newDisplayedSeries: DisplaySeriesTuple[] = [];
                    // If this key is the only series currently selected for display,
                    // then on this click, display everything again.
                    const nothingElseIsDisplaying = displayedSeries.every((ds) => ds.name !== dsTuple.name ? !ds.show: true);
                    const thisDS = displayedSeries.find((ds) => ds.name === dsTuple.name);
                    if (thisDS !== undefined && thisDS.show && nothingElseIsDisplaying) {
                      newDisplayedSeries = displayedSeries.map((ds) => ({name: ds.name, show: true}));
                    } else {
                      // Otherwise, show only this series
                      newDisplayedSeries = displayedSeries.map((ds) => ({name: ds.name, show: ds.name === dsTuple.name ? true : false}));
                    }
                    setDisplayedSeriesCallback(newDisplayedSeries);
                  }}
                >
                  {dsTuple.name}
                </div>
            )
          })
        }
    </div>
  </div>
  );
};
