import React, { useEffect, useMemo, useState } from 'react';
import { PanelData } from '@grafana/data';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';

const colors = ["lightcoral", "skyblue", "lightgreen", "lightsalmon"];

export const ResourceViewer = (props: { data: PanelData; width: number; height: number }) => {
  const { data, width, height } = props;
//   const dimMax = Math.min(width, height);
  const [domain, setDomain] = useState<number[]>([]);
  const [dataSeries, setDataSeries] = useState<{[name: string]: number[]}>({});
  const [displayedSeries, setDisplayedSeries] = useState<string[]>([]);

  // bounds
  const xMax = width;
  const yMax = height - 120;

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
    data.series[0].fields.forEach((v) => {
      if (v.name === 'time_seconds') {
        return;
      }
      setDataSeries(dataSeries => ({...dataSeries, [v.name]: v.values.toArray()}));
      // Add all series for displaying if it is empty
      if (!(displayedSeries.length ?? 0)) {
        setDisplayedSeries(displayedSeries => [...displayedSeries, v.name]);
      }
    });
  }, [data, displayedSeries.length]);

  // scales, memoize for performance
  const xScale = useMemo(
  () =>
      scaleBand<number>({
      range: [0, xMax],
      round: true,
      domain: domain,
      padding: 0.4,
      }),
  [xMax, domain],
  );
  const yScale = useMemo(
    () => {
      // Get largest magnitude value, use as +/- scale limits
      // Filter among only the series selected for display
      let maxval = 1;
      for (const [key,v] of Object.entries(dataSeries)) {
        if (!(displayedSeries.some(x => x === key))) {
          continue;
        }
        maxval = Math.max(
          maxval,
          Math.abs(v.length ? Math.max(...v) : 1),
          Math.abs(v.length ? Math.min(...v) : -1)
        );
      }
      return scaleLinear<number>({
        range: [-yMax/2, yMax/2],
        round: true,
        domain: [-maxval,maxval],
      });
    },
    [yMax, dataSeries, displayedSeries],
  );

  if (width < 10 || !domain.length) {
    return null;
  }

  return (
    <svg width={width} height={height}>
    <rect width={width} height={height} fill="url(#teal)" rx={14} />
    <Group top={120 / 2}>
      {
        // Iterate over every resource
        Object.keys(dataSeries).map((key, series_idx) => {
          return (
            <Group
              key={`bargroup-${key}`}
              onClick={(event) => {
                setDisplayedSeries(displayedSeries => {
                  // If this key is the only series currently selected for display,
                  // then on this click, display everything again.
                  if (displayedSeries.length === 1 && displayedSeries[0] === key) {
                    return Object.keys(dataSeries).map((key) => key);
                  }
                  // Otherwise hide all but this series
                  return [key];
                })
              }}
            >
              <Text
                x={0}
                y={series_idx*20}
                verticalAnchor="start"
                fill={colors[series_idx]}
                opacity={displayedSeries.some(x => x === key) ? 0.75 : 0.25}
                style={{userSelect: 'none'}}
              >
                {key}
              </Text>
              {
                // Iterate over every point in the resource usage
                dataSeries[key].map((v,i) => {
                  // Scale value to graph coordinates
                  const v_yscaled = yScale(v) ?? 0;
                  const barWidth = xScale.bandwidth();
                  // Bar height is magnitude of scaled value
                  const barHeight = Math.abs(v_yscaled);
                  const barX = xScale(i);
                  // If value is negative, origin of bar is at center of graph,
                  //  if positive, then y must be displaced by the height
                  const barY = v > 0 ? yMax/2 - barHeight : yMax/2;
                  return (
                    <Bar
                      key={`bar-${i}`}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={colors[series_idx]}
                      opacity={displayedSeries.some(x => x === key) ? 0.75 : 0.1}
                      // onClick={() => {
                      //   //if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                      // }}
                    />
                  );
                })
              }
            </Group>
          )
        })
      }
    </Group>
  </svg>
  );
};
