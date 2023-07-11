type SeriesSize = 'sm' | 'md' | 'lg';
type CircleColor = 'red' | 'green' | 'blue';




export interface SimpleOptions {
  color: CircleColor;
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
