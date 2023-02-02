import {
  defined,
  Cartesian3,
  Clock,
  ClockRange,
  DataSourceClock,
  DeveloperError,
  EntityCluster,
  EntityCollection,
  Event as CesiumEvent,
  JulianDate,
  ReferenceFrame,
  SampledPositionProperty,
  TimeIntervalCollection,
} from 'cesium';

/**
 * This class is an example of a custom DataSource.  It loads JSON data as
 * defined by Google's WebGL Globe, https://github.com/dataarts/webgl-globe.
 * @alias CosmosCesiumDatasource
 * @constructor
 *
 * @param {String} [name] The name of this data source.  If undefined, a name
 *                        will be derived from the url.
 *
 * @example
 * const dataSource = new Cesium.CosmosCesiumDatasource();
 * dataSource.loadUrl('sample.json');
 * viewer.dataSources.add(dataSource);
 */
//  function CosmosCesiumDatasource(name: string) {
//   //All public configuration is defined as ES5 properties
//   //These are just the "private" variables and their defaults.
//   this._name = name;
//   this._changed = new Cesium.Event();
//   this._error = new Cesium.Event();
//   this._isLoading = false;
//   this._loading = new Cesium.Event();
//   this._entityCollection = new Cesium.EntityCollection();
//   this._seriesNames = [];
//   this._seriesToDisplay = undefined;
//   this._heightScale = 10000000;
//   this._entityCluster = new Cesium.EntityCluster();
// }

export class CosmosCesiumDatasource {
  name: string;
  clock: DataSourceClock;
  changedEvent: CesiumEvent;
  errorEvent: CesiumEvent;
  isLoading: boolean;
  loadingEvent: CesiumEvent;
  entities: EntityCollection;
  clustering: EntityCluster;
  show: boolean;
  update(time: JulianDate): boolean {
    return true;
  }
  constructor(name: string) {
    this.name = name;
    //this.clock = undefined as any; // Per Cesium-documentation, clock will be undefined for static data
    this.clock = new DataSourceClock();
    const timeRange = TimeIntervalCollection.fromIso8601({ iso8601: '2022-10-22T20:00:00Z/2022-10-22T21:00:00Z' });
    this.clock.clockRange = ClockRange.UNBOUNDED;
    this.clock.currentTime = timeRange.start;
    this.clock.startTime = timeRange.start;
    this.clock.stopTime = timeRange.stop;
    this.changedEvent = new CesiumEvent();
    //this.changedEvent.addEventListener(()=> {return this.changedEvent});
    this.errorEvent = new CesiumEvent();
    this.isLoading = false;
    this.loadingEvent = new CesiumEvent();
    this.entities = new EntityCollection(this);
    this.clustering = new EntityCluster();
    this.show = true;
  }

  setLoading(isLoading: boolean): void {
    if (this.isLoading !== isLoading) {
      if (isLoading) {
        this.entities.suspendEvents();
      } else {
        this.entities.resumeEvents();
      }
      this.isLoading = isLoading;
      this.loadingEvent.raiseEvent([isLoading]);
    }
  }
  // TODO: fix any type
  load(Time: any, sx: any, sy: any, sz: any, viewerClock: Clock): void {
    if (!defined(sx) || !defined(sy) || !defined(sz)) {
      throw new DeveloperError('data is required.');
    }

    //It's a good idea to suspend events when making changes to a
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    // entities.suspendEvents();
    //Clear out any data that might already exist.
    const entities = this.entities;
    entities.removeAll();
    this.setLoading(true);

    // Data will be
    const maxLen = Math.max(Time.length, sx.length, sy.length, sz.length);
    // console.log('maxLen:', maxLen, Time, sx, sy, sz);
    const pos: SampledPositionProperty = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    for (let i = 0; i < maxLen; i++) {
      // if (sx[i] == null || sy[i] == null || sz)
      const julianDate = new Date(Time.get(i));
      // console.log(julianDate, sx.get(i), sy.get(i), sz.get(i));
      pos.addSample(JulianDate.fromDate(julianDate), Cartesian3.fromElements(sx.get(i), sy.get(i), sz.get(i)));
    }
    //pos.addSamplesPackedArray([0, 5000000, 8500000, 0, 953550008, 8000000, 2500000, 0], JulianDate.fromIso8601('2021-02-25T23:30:00Z'));
    const timeRangeStart = JulianDate.fromDate(new Date(Time.get(0)));
    const timeRangeStop = JulianDate.fromDate(new Date(Time.get(Time.length-1)));
    const timeRange = TimeIntervalCollection.fromJulianDateArray({ julianDates: [timeRangeStart, timeRangeStop] });
    entities.add({
      id: 'Sat2Id',
      name: 'Sat2',
      path: {
        width: 2,
      },
      position: pos,
      model: {
        uri: './public/plugins/hsfl-orbit-display/img/GenericSatellite.glb',
        scale: 1.0,
        minimumPixelSize: 64,
      },
      availability: timeRange,
    });
    let clock = new DataSourceClock();
    if (this.clock === undefined) {
      this.clock = new DataSourceClock();
    }
    clock.clockRange = ClockRange.CLAMPED;
    clock.currentTime = timeRangeStop;
    clock.startTime = timeRangeStart;
    clock.stopTime = timeRangeStop;
    viewerClock.clockRange = clock.clockRange;
    viewerClock.currentTime = clock.currentTime;
    viewerClock.startTime = clock.startTime;
    viewerClock.stopTime = clock.stopTime;
    if (!clock.equals(this.clock)) {
      this.clock = clock.clone();
    }

    // Loop over each series
    // for (let x = 0; x < data.length; x++) {
    //     const series = data[x];
    //     const seriesName = series[0];
    //     const coordinates = series[1];

    //     //Add the name of the series to our list of possible values.
    //     this._seriesNames.push(seriesName);

    //     //Make the first series the visible one by default
    //     const show = x === 0;
    //     if (show) {
    //     this._seriesToDisplay = seriesName;
    //     }

    //     //Now loop over each coordinate in the series and create
    //     // our entities from the data.
    //     for (let i = 0; i < coordinates.length; i += 3) {
    //     const latitude = coordinates[i];
    //     const longitude = coordinates[i + 1];
    //     const height = coordinates[i + 2];

    //     //Ignore lines of zero height.
    //     if (height === 0) {
    //         continue;
    //     }

    //     const color = Cesium.Color.fromHsl(0.6 - height * 0.5, 1.0, 0.5);
    //     const surfacePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
    //     const heightPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height * heightScale);

    //     //WebGL Globe only contains lines, so that's the only graphics we create.
    //     const polyline = new Cesium.PolylineGraphics();
    //     polyline.material = new Cesium.ColorMaterialProperty(color);
    //     polyline.width = new Cesium.ConstantProperty(2);
    //     polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.NONE);
    //     polyline.positions = new Cesium.ConstantProperty([surfacePosition, heightPosition]);

    //     //The polyline instance itself needs to be on an entity.
    //     const entity = new Cesium.Entity({
    //         id: `${seriesName} index ${i.toString()}`,
    //         show: show,
    //         polyline: polyline,
    //         //seriesName: seriesName, //Custom property to indicate series name
    //     });

    //     //Add the entity to the collection.
    //     entities.add(entity);
    //     }
    // }

    //Once all data is processed, call resumeEvents and raise the changed event.
    //entities.resumeEvents();
    this.changedEvent.raiseEvent();
    this.setLoading(false);
  }
}

// export function CosmosCesiumDatasource(this: Cesium.CustomDataSource, name: string) {
//   //All public configuration is defined as ES5 properties
//   //These are just the "private" variables and their defaults.
//   this.name = name;
//   this.changedEvent = new Cesium.Event();
//   this.errorEvent = new Cesium.Event();
//   this.isLoading = false;
//   this.loadingEvent = new Cesium.Event();
//   this.entities = new Cesium.EntityCollection();
//   //   this.seriesNames = [];
//   //   this._seriesToDisplay = undefined;
//   //   this._heightScale = 10000000;
//   this.clustering = new Cesium.EntityCluster();
// }

// Object.defineProperties(CosmosCesiumDatasource.prototype, {
//   //The below properties must be implemented by all DataSource instances

//   /**
//    * Gets a human-readable name for this instance.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {String}
//    */
//   name: {
//     get: function (): string {
//       return this._name;
//     },
//     set: function (name: string) {
//       this._name = name;
//     },
//   },
//   /**
//    * Get the clock
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {DataSourceClock}
//    */
//   clock: {
//     // value: undefined,
//     // writable: false,
//     get: function (): DataSourceClock {
//       return this._clock;
//     },
//   },
//   /**
//    * Gets the collection of Entity instances.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {EntityCollection}
//    */
//   entities: {
//     get: function (): EntityCollection {
//       return this._entityCollection;
//     },
//   },
//   /**
//    * Gets a value indicating if the data source is currently loading data.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Boolean}
//    */
//   isLoading: {
//     get: function (): boolean {
//       return this._isLoading;
//     },
//   },
//   /**
//    * Gets an event that will be raised when the underlying data changes.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Event}
//    */
//   changedEvent: {
//     get: function (): Event {
//       return this._changed;
//     },
//   },
//   /**
//    * Gets an event that will be raised if an error is encountered during
//    * processing.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Event}
//    */
//   errorEvent: {
//     get: function (): Event {
//       return this._error;
//     },
//   },
//   /**
//    * Gets an event that will be raised when the data source either starts or
//    * stops loading.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Event}
//    */
//   loadingEvent: {
//     get: function (): Event {
//       return this._loading;
//     },
//   },

//   //These properties are specific to this DataSource.

//   /**
//    * Gets the array of series names.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {String[]}
//    */
//   seriesNames: {
//     get: function (): string[] {
//       return this._seriesNames;
//     },
//   },
//   /**
//    * Gets or sets the name of the series to display.  WebGL JSON is designed
//    * so that only one series is viewed at a time.  Valid values are defined
//    * in the seriesNames property.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {String}
//    */
//   seriesToDisplay: {
//     get: function (): string[] {
//       return this._seriesToDisplay;
//     },
//     set: function (value: string[]) {
//       this._seriesToDisplay = value;

//       //Iterate over all entities and set their show property
//       //to true only if they are part of the current series.
//       const collection = this._entityCollection;
//       const entities = collection.values;
//       collection.suspendEvents();
//       for (let i = 0; i < entities.length; i++) {
//         const entity = entities[i];
//         entity.show = value === entity.seriesName;
//       }
//       collection.resumeEvents();
//     },
//   },
//   /**
//    * Gets or sets the scale factor applied to the height of each line.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Number}
//    */
//   heightScale: {
//     get: function (): number {
//       return this._heightScale;
//     },
//     set: function (value: number) {
//       if (value <= 0) {
//         throw new Cesium.DeveloperError('value must be greater than 0');
//       }
//       this._heightScale = value;
//     },
//   },
//   /**
//    * Gets whether or not this data source should be displayed.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {Boolean}
//    */
//   show: {
//     get: function (): boolean {
//       return this._entityCollection;
//     },
//     set: function (value: boolean) {
//       this._entityCollection = value;
//     },
//   },
//   /**
//    * Gets or sets the clustering options for this data source. This object can be shared between multiple data sources.
//    * @memberof CosmosCesiumDatasource.prototype
//    * @type {EntityCluster}
//    */
//   clustering: {
//     get: function (): EntityCluster {
//       return this._entityCluster;
//     },
//     set: function (value: EntityCluster) {
//       if (!Cesium.defined(value)) {
//         throw new Cesium.DeveloperError('value must be defined.');
//       }
//       this._entityCluster = value;
//     },
//   },
// });

// /**
//  * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
//  * @param {Object} url The url to be processed.
//  * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
//  */
// CosmosCesiumDatasource.prototype.loadUrl = function (url) {
//   if (!Cesium.defined(url)) {
//     throw new Cesium.DeveloperError("url is required.");
//   }

//   //Create a name based on the url
//   const name = Cesium.getFilenameFromUri(url);

//   //Set the name if it is different than the current name.
//   if (this._name !== name) {
//     this._name = name;
//     this._changed.raiseEvent(this);
//   }

//   //Load the URL into a json object
//   //and then process is with the `load` function.
//   const that = this;
//   return Cesium.Resource.fetchJson(url)
//     .then(function (json) {
//       return that.load(json, url);
//     })
//     .catch(function (error) {
//       //Otherwise will catch any errors or exceptions that occur
//       //during the promise processing. When this happens,
//       //we raise the error event and reject the promise.
//       this._setLoading(false);
//       that._error.raiseEvent(that, error);
//       return Promise.reject(error);
//     });
// };

// /**
//  * Loads the provided data, replacing any existing data.
//  * @param {Array} data The object to be processed.
//  */
// CosmosCesiumDatasource.prototype.load = function (data: any) {
//   //>>includeStart('debug', pragmas.debug);
//   if (!Cesium.defined(data)) {
//     throw new Cesium.DeveloperError('data is required.');
//   }
//   //>>includeEnd('debug');

//   //Clear out any data that might already exist.
//   this._setLoading(true);
//   this._seriesNames.length = 0;
//   this._seriesToDisplay = undefined;

//   const heightScale = this.heightScale;
//   const entities = this._entityCollection;

//   //It's a good idea to suspend events when making changes to a
//   //large amount of entities.  This will cause events to be batched up
//   //into the minimal amount of function calls and all take place at the
//   //end of processing (when resumeEvents is called).
//   entities.suspendEvents();
//   entities.removeAll();

//   //WebGL Globe JSON is an array of series, where each series itself is an
//   //array of two items, the first containing the series name and the second
//   //being an array of repeating latitude, longitude, height values.
//   //
//   //Here's a more visual example.
//   //[["series1",[latitude, longitude, height, ... ]
//   // ["series2",[latitude, longitude, height, ... ]]

//   // Loop over each series
//   for (let x = 0; x < data.length; x++) {
//     const series = data[x];
//     const seriesName = series[0];
//     const coordinates = series[1];

//     //Add the name of the series to our list of possible values.
//     this._seriesNames.push(seriesName);

//     //Make the first series the visible one by default
//     const show = x === 0;
//     if (show) {
//       this._seriesToDisplay = seriesName;
//     }

//     //Now loop over each coordinate in the series and create
//     // our entities from the data.
//     for (let i = 0; i < coordinates.length; i += 3) {
//       const latitude = coordinates[i];
//       const longitude = coordinates[i + 1];
//       const height = coordinates[i + 2];

//       //Ignore lines of zero height.
//       if (height === 0) {
//         continue;
//       }

//       const color = Cesium.Color.fromHsl(0.6 - height * 0.5, 1.0, 0.5);
//       const surfacePosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
//       const heightPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height * heightScale);

//       //WebGL Globe only contains lines, so that's the only graphics we create.
//       const polyline = new Cesium.PolylineGraphics();
//       polyline.material = new Cesium.ColorMaterialProperty(color);
//       polyline.width = new Cesium.ConstantProperty(2);
//       polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.NONE);
//       polyline.positions = new Cesium.ConstantProperty([surfacePosition, heightPosition]);

//       //The polyline instance itself needs to be on an entity.
//       const entity = new Cesium.Entity({
//         id: `${seriesName} index ${i.toString()}`,
//         show: show,
//         polyline: polyline,
//         //seriesName: seriesName, //Custom property to indicate series name
//       });

//       //Add the entity to the collection.
//       entities.add(entity);
//     }
//   }

//   //Once all data is processed, call resumeEvents and raise the changed event.
//   entities.resumeEvents();
//   this._changed.raiseEvent(this);
//   this._setLoading(false);
// };
