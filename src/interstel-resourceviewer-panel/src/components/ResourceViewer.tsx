import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AxisLeft } from '@visx/axis';
// import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';

const colors = ["lightcoral", "skyblue", "lightgreen", "lightsalmon"];

// A component for the graphical view of the resource usage levels

export const ResourceViewer = (props: {
  // Timestamps
  domain: number[],
  // Resource usage at the timestamp
  dataSeries: {[name: string]: number[]},
  // Width of the render window for this graph
  width: number,
  // Height of the render window for this graph
  height: number
}) => {
  const { domain, dataSeries, width, height } = props;
  const [displayedSeries, setDisplayedSeries] = useState<string[]>([]);
  // Cumulative sum of resource usage
  const [dataSeriesCumulative, setDataSeriesCumulative] = useState<{[name: string]: number[]}>({});
  // Reference to base svg element, to acquire local mouse positions within it
  const svgRef = useRef<SVGSVGElement>(null);

  // bounds
  const xMax = width;
  const yMax = height - 120;
  // Margin between top of component and where the rendering starts
  const topMargin = 10;
  // Margin between text area and graph area
  const graphTopMargin = 120/2;
  const centerOfGraphY = graphTopMargin + yMax/2;

  // Add all names initially
  useEffect(() => {
    if (displayedSeries.length ?? 0 !== 0) {
        return;
    }
    // Add all series for displaying if it is empty
    Object.keys(dataSeries).forEach((name) => {
      setDisplayedSeries(displayedSeries => [...displayedSeries, name]);
    });
  }, [dataSeries, displayedSeries.length]);

  // Compute cumulative sum for displaying
  useEffect(() => {
    Object.keys(dataSeries).forEach((name) => {
      const accumulated = dataSeries[name].reduce((accumulator: number[], v: number, i: number) => {
        // Calculate running sum
        if (i === 0) {
          accumulator.push(v);
        } else {
          accumulator.push(accumulator[i-1] + v);
        }
        return accumulator;
      },[]);
      setDataSeriesCumulative(d => ({...d, [name]: accumulated}));
    });
  }, [dataSeries]);

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
      for (const [key,v] of Object.entries(dataSeriesCumulative)) {
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
        range: [yMax/2, -yMax/2],
        round: true,
        domain: [-maxval,maxval],
      });
    },
    [yMax, dataSeriesCumulative, displayedSeries],
  );

  if (width < 10 || !domain.length) {
    return null;
  }

  return (
    <svg width={width} height={height} ref={svgRef}>
    <rect width={width} height={height} fill="url(#teal)" rx={14} />
    <Group top={topMargin}>
      {
        // Iterate over every resource
        Object.keys(dataSeriesCumulative).map((key, series_idx) => {
          return (
            <Group key={`bargroup-${key}`} >
              {/* Name of resource, clickable */}
              <Text
                x={0}
                y={series_idx*20}
                verticalAnchor="start"
                fill={colors[series_idx]}
                opacity={displayedSeries.some(x => x === key) ? 0.75 : 0.25}
                style={{userSelect: 'none'}}
                onClick={(event) => {
                  setDisplayedSeries(displayedSeries => {
                    // If this key is the only series currently selected for display,
                    // then on this click, display everything again.
                    if (displayedSeries.length === 1 && displayedSeries[0] === key) {
                      return Object.keys(dataSeriesCumulative).map((key) => key);
                    }
                    // Otherwise hide all but this series
                    return [key];
                  })
                }}
              >
                {key}
              </Text>
              {/* Bars */}
              {
                // Iterate over every point in the resource usage
                dataSeriesCumulative[key].reduce((accumulator: JSX.Element[], v,i) => {
                  // Only display series' selected for displaying
                  if (!displayedSeries.some(x => x === key)) {
                    return accumulator;
                  }
                  // Scale value to graph coordinates
                  const v_yscaled = yScale(v) ?? 0;
                  const barWidth = xScale.bandwidth();
                  // Bar height is magnitude of scaled value
                  const barHeight = Math.abs(v_yscaled);
                  const barX = xScale(i);
                  // If value is negative, origin of bar is at center of graph,
                  //  if positive, then y must be displaced by the height
                  const barY = v > 0 ? yMax/2 - barHeight : yMax/2;
                  accumulator.push(
                    <Group top={graphTopMargin}>
                        {/* Visible bar */}
                        <Bar
                          key={`bar-${i}`}
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={colors[series_idx]}
                          opacity={1}
                        />
                        {/* Full-length bar in front of the visible bar graph*/}
                        <Bar
                          key={`clickable-bar-${i}`}
                          x={barX}
                          y={0}
                          width={barWidth}
                          height={yMax}
                          fill={'white'}
                          opacity={0} // Hidden, but clickable
                          onClick={(e) => {
                            // console.log(`clicked: ${key} index: ${i} new: ${svgRef.current !== null ? localPoint(svgRef.current, e)?.y : 0}`);
                          }}
                        />
                      </Group>
                  );
                  return accumulator;
                }, [])
              }
            </Group>
          )
        })
      }
      {/* Graph axes and grids */}
      <AxisLeft
        scale={yScale}
        top={centerOfGraphY}
        left={50}
        label={'hi'}
        tickLabelProps={{
          fill: 'black',
          fontSize: 11,
          textAnchor: 'middle',
          dx: -20
        }}
      />
      <GridRows
        scale={yScale}
        top={centerOfGraphY}
        left={50}
        width={width}
        height={height}
      />
    </Group>
  </svg>
  );
};
