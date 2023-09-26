import {
  Cartesian3,
  Cartographic,
  Clock,
  ClockRange,
  Color,
  CylinderGraphics,
  ConstantPositionProperty,
  DataSourceClock,
  DeveloperError,
  Ellipsoid,
  EntityCluster,
  EntityCollection,
  Event as CesiumEvent,
  // HeadingPitchRoll,
  IntersectionTests,
  Interval,
  JulianDate,
  Matrix3,
  PathGraphics,
  PointGraphics,
  Quaternion,
  Ray,
  ReferenceFrame,
  SampledProperty,
  SampledPositionProperty,
  TimeInterval,
  TimeIntervalCollection,
  Transforms,
} from 'cesium';
import { SimpleOptions } from 'types';
import { DataFrame } from '@grafana/data';

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
  clearEntities(): void {
    //Clear out any data that might already exist.
    const entities = this.entities;
    entities.removeAll();
  }

  async load_node(node_name: string, series: DataFrame, viewerClock: Clock, options: SimpleOptions): Promise<void> {
    const time = series.fields.find((field) => field.name === 'time')?.values;
    const sx = series.fields.find((field) => field.name === 's_x')?.values;
    const sy = series.fields.find((field) => field.name === 's_y')?.values;
    const sz = series.fields.find((field) => field.name === 's_z')?.values;
    const qsw = series.fields.find((field) => field.name === 'q_s_w')?.values;
    const qsx = series.fields.find((field) => field.name === 'q_s_x')?.values;
    const qsy = series.fields.find((field) => field.name === 'q_s_y')?.values;
    const qsz = series.fields.find((field) => field.name === 'q_s_z')?.values;
    if (
      time === undefined ||
      sx === undefined ||
      sy === undefined ||
      sz === undefined ||
      qsw === undefined ||
      qsx === undefined ||
      qsy === undefined ||
      qsz === undefined
    ) {
      throw new DeveloperError('data is required.');
    }
    const node_type = series.fields.find((field) => field.name === 'node_type')?.values.get(0) ?? 0;
    let node_model = undefined;
    let node_path: PathGraphics | undefined = undefined;
    let node_graphic: PointGraphics | undefined = undefined;
    // if node is type 0 = a satellite, use a model for this
    if (node_type === 0) {
      node_model = {
        uri: './public/plugins/hsfl-orbit-display/img/GenericSatellite.glb',
        scale: 1.0,
        minimumPixelSize: 64,
      };
      node_path = new PathGraphics({
        leadTime: 0,
        width: 2,
        show: options.showPath,
      });
    } else {
      // Every other type is just a sphere, and with no trailing path
      node_graphic = new PointGraphics({
        // color: Color.BROWN,
        color: Color.RED.withAlpha(0.5),
        outlineColor: Color.WHITE,
        // outlineWidth: 2,
        outlineWidth: 1,
        // pixelSize: 10,
        pixelSize: 5,
        show: options.showFormationGoalLocations, // TODO: assumes this is a goal location without any other checks
      });
    }
    //It's a good idea to suspend events when making changes to a
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    // entities.suspendEvents();
    this.setLoading(true);

    const timeRangeStart = JulianDate.fromDate(new Date(time.get(0)));
    const timeRangeStop = JulianDate.fromDate(new Date(time.get(time.length - 1)));
    const timeRange = TimeIntervalCollection.fromJulianDateArray({ julianDates: [timeRangeStart, timeRangeStop] });
    const interval = new TimeInterval({ start: timeRangeStart, stop: timeRangeStop });
    // Wait for ICRF data for time interval that coordinate conversions will take place in
    await Transforms.preloadIcrfFixed(interval).then(() => {});

    const entities = this.entities;

    // Length of all the arrays to minimally fully iterate over
    const minLen = Math.min(time.length, sx.length, sy.length, sz.length);
    // All the satellite positions
    const positions: SampledPositionProperty = new SampledPositionProperty(ReferenceFrame.FIXED);
    // All the sensor cone's positions
    const sensor_positions: SampledPositionProperty = new SampledPositionProperty(ReferenceFrame.FIXED);
    // All the satellite's attitudes
    const orientations: SampledProperty = new SampledProperty(Quaternion);
    // All the sensor lengths to use for rendering
    const sensor_lengths: SampledProperty = new SampledProperty(Number);
    // All the sensor's radii at the far end of the cone
    const sensor_radii: SampledProperty = new SampledProperty(Number);
    // Collection of time intervals for when sensors are active
    const sensor_time_ranges: TimeIntervalCollection = new TimeIntervalCollection();
    let current_sensor_time_interval_start = 0;
    let current_sensor_time_interval_stop = 0;
    // Iterate over every position/attitude point, adding it for rendering
    for (let i = 0; i < minLen; i++) {
      const julianDate = JulianDate.fromDate(new Date(time.get(i)));
      /////////////////////////////////////////////////////////////////////////////////////////////////
      // For whomever needs to make sense of this in the future:
      // Cesium handles everything internally in ECEF coordinates.
      // If the reference frame is specified as INERTIAL, any position coordinates added to pos will be
      // assumed to be inertial coordinates (i.e., ECI) and converted into ECEF coordinates internally.
      // If passing in ECI coordinates (e.g., pos.eci) then specify the SampledPositionProperty as INERTIAL.
      //   (or convert to ECEF first and then use FIXED)
      // If passing in Geocentric coordinates (e.g, pos.geoc), use FIXED.
      // Cesium/CZML uses Earth-Fixed axises for orientation, so a conversion to ECEF is necessary if passing in
      // ICRF quaternions (e.g., att.icrf).
      // If passing in att.geoc, then no such conversion is necessary, just use as is.
      // Also, since every attitude quaternion in COSMOS is the quaternion that defines the passive rotation from
      // the whatever-coordinate system into body frame, an active rotation like how it's applied here in Cesium
      // will rotate from body-frame to the whatever-coordinate system. In other words, the COSMOS quaternions can
      // just be used as is without needing to acquire the conjugate or anything.
      // (Aside from the ICRF->ECEF conversion mentioned above)
      // Code here assumes orientation comes in initially in ICRF (i.e., assumes it came from att.icrf)
      /////////////////////////////////////////////////////////////////////////////////////////////////

      const ECI_to_ECEF_matrix = Transforms.computeIcrfToFixedMatrix(julianDate);
      const ECI_to_ECEF = Quaternion.fromRotationMatrix(ECI_to_ECEF_matrix);

      // Position in ECI
      const sat_position: Cartesian3 = Cartesian3.fromElements(sx.get(i), sy.get(i), sz.get(i));
      // Position now in ECEF
      Matrix3.multiplyByVector(ECI_to_ECEF_matrix, sat_position, sat_position);
      positions.addSample(julianDate, sat_position);

      // orientation for body frame -> ICRF
      let orientation = new Quaternion(qsx.get(i), qsy.get(i), qsz.get(i), qsw.get(i));
      // orientation now for body frame -> ECEF
      Quaternion.multiply(ECI_to_ECEF, orientation, orientation);
      // TEMPORARY: These commented out lines flip Z to point down (i.e., so that the sensor points +Z)
      // const vertical_flip_hpr = new HeadingPitchRoll(0, Math.PI, 0);
      // const vertical_flip_Q = Quaternion.fromHeadingPitchRoll(vertical_flip_hpr);
      // const ecef_w_body_vertical_flip = Quaternion.multiply(orientation, vertical_flip_Q, new Quaternion());
      // orientations.addSample(julianDate, ecef_w_body_vertical_flip);
      orientations.addSample(julianDate, orientation);

      // Only for satellites
      if (node_type !== 0) {
        continue;
      }

      // Don't display sensor cones if option is toggled off. Remove any in the entities list too.
      if (!options.showSensorCones) {
        const sensor_id = node_name + 'sensorid';
        const entity = entities.getById(sensor_id);
        if (entity !== undefined) {
          entities.removeById(sensor_id);
        }
        continue;
      }

      // Sensor cones
      // First determine the distance to the ground by doing a raycast
      // TODO: direction of sensor should be configurable, currently pointing -Z)
      const sensor_vector = Cartesian3.fromElements(0, 0, -1);
      const orientation_matrix = Matrix3.fromQuaternion(orientation);
      Matrix3.multiplyByVector(orientation_matrix, sensor_vector, sensor_vector);
      // Cartesian3.normalize(sensor_vector, sensor_vector);
      // Get intersection with Earth
      const sensor_ray = new Ray(sat_position, sensor_vector);
      const intersection: Interval = IntersectionTests.rayEllipsoid(sensor_ray, Ellipsoid.WGS84);
      // If the sensor is pointing off into space, make the length the altitude
      const altitude: number = Cartesian3.magnitude(sat_position) - 6378000;
      const sensor_length: number = intersection !== undefined ? intersection.start : altitude;

      // Some temporary logic to enable sensor cone rendering only when pointing at target.
      // Consider when we'd like to enable sensor cones
      // Using the check: if < 1 deg off nadir or pointing into space, then disable.
      const sat_position_unit: Cartesian3 = Cartesian3.normalize(sat_position, new Cartesian3());
      const cross: Cartesian3 = Cartesian3.cross(sat_position_unit, sensor_vector, new Cartesian3());
      if (Math.asin(Cartesian3.magnitude(cross)) < Math.PI / 180) {
        // If stop is non-zero, push
        if (current_sensor_time_interval_start !== 0 && current_sensor_time_interval_stop !== 0) {
          // Push interval
          sensor_time_ranges.addInterval(
            new TimeInterval({
              start: JulianDate.fromDate(new Date(current_sensor_time_interval_start)),
              stop: JulianDate.fromDate(new Date(current_sensor_time_interval_stop)),
            })
          );
          // Reset interval
          current_sensor_time_interval_start = 0;
          current_sensor_time_interval_stop = 0;
        }
        continue;
        // If start is nonzero, don't update start
      } else if (current_sensor_time_interval_start === 0) {
        // If start is zero, this is start of new window
        current_sensor_time_interval_start = time.get(i);
      }
      current_sensor_time_interval_stop = time.get(i);

      // Get offset of sensor position from the satellite's position
      const sensor_midpoint: Cartesian3 = Ray.getPoint(sensor_ray, sensor_length / 2);
      // Cartesian3.add(sat_position, sensor_vector, sensor_midpoint);
      sensor_positions.addSample(julianDate, sensor_midpoint);
      sensor_lengths.addSample(julianDate, sensor_length * 0.95);

      // Half-angle of the sensor cone
      const sensor_angle = (5 * Math.PI) / 180;
      const radius = sensor_length * Math.tan(sensor_angle);
      sensor_radii.addSample(julianDate, radius);
    }
    // Add final interval
    if (current_sensor_time_interval_start !== 0 && current_sensor_time_interval_stop !== 0) {
      sensor_time_ranges.addInterval(
        new TimeInterval({
          start: JulianDate.fromDate(new Date(current_sensor_time_interval_start)),
          stop: JulianDate.fromDate(new Date(current_sensor_time_interval_stop)),
        })
      );
    }

    const entity = entities.getById(node_name + 'id');
    if (entity === undefined) {
      entities.add({
        id: node_name + 'id',
        name: node_name,
        orientation: orientations,
        path: node_path,
        position: positions,
        model: node_model,
        point: node_graphic,
        availability: timeRange,
      });
    } else {
      entity.path = node_path;
      entity.point = node_graphic;
      entity.position = positions;
      entity.availability = timeRange;
    }
    if (node_type !== 0) {
      return;
    }
    if (options.showSensorCones) {
      const entitySensor = entities.getById(node_name + 'sensorid');
      if (entitySensor === undefined) {
        entities.add({
          id: node_name + 'sensorid',
          name: node_name + 'sensor',
          orientation: orientations,
          position: sensor_positions,
          cylinder: new CylinderGraphics({
            bottomRadius: sensor_radii,
            topRadius: 0,
            length: sensor_lengths,
            slices: 16,
            material: Color.WHITE.withAlpha(0.5),
          }),
          availability: sensor_time_ranges,
        });
      } else {
        entitySensor.position = sensor_positions;
        entitySensor.orientation = orientations;
        entitySensor.availability = sensor_time_ranges;
      }
    }

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
  }

  load_stationary_target(node_name: string, series: DataFrame, viewerClock: Clock, options: SimpleOptions): void {
    const name = series.fields.find((field) => field.name === 'name')?.values;
    const lat = series.fields.find((field) => field.name === 'lat')?.values;
    const lon = series.fields.find((field) => field.name === 'lon')?.values;
    const h = series.fields.find((field) => field.name === 'h')?.values;
    if (name === undefined || lat === undefined || lon === undefined || h === undefined) {
      return;
    }
    let node_model = undefined;
    let node_graphic = undefined;
    node_graphic = {
      color: Color.RED,
      outlineColor: Color.WHITE,
      outlineWidth: 2,
      pixelSize: 10,
      show: true,
    };
    //It's a good idea to suspend events when making changes to a
    //large amount of entities.  This will cause events to be batched up
    //into the minimal amount of function calls and all take place at the
    //end of processing (when resumeEvents is called).
    // entities.suspendEvents();
    this.setLoading(true);

    const entities = this.entities;

    for (let i = 0; i < name.length; i++) {
      const entity_id = name.get(i) + 'id';
      const entity_name = name.get(i);
      const entity = entities.getById(entity_id);
      // Remove all existing targets if they exist, and don't add any new ones
      if (!options.showTargets) {
        if (entity !== undefined) {
          entities.removeById(entity_id);
        }
        continue;
      }
      const cart: Cartographic = new Cartographic(lon.get(i), lat.get(i), h.get(i));
      const c3: Cartesian3 = Cartographic.toCartesian(cart);
      const pos: ConstantPositionProperty = new ConstantPositionProperty(c3, ReferenceFrame.FIXED);

      if (entity === undefined) {
        entities.add({
          id: entity_id,
          name: entity_name,
          position: pos,
          model: node_model,
          point: node_graphic,
        });
      } else {
        entity.position = pos;
      }
    }
  }

  // TODO: fix any type
  async load(node_name: string, series: DataFrame, viewerClock: Clock, options: SimpleOptions): Promise<void> {
    if (node_name === 'Targets') {
      this.load_stationary_target(node_name, series, viewerClock, options);
    } else {
      this.load_node(node_name, series, viewerClock, options);
    }

    //Once all data is processed, call resumeEvents and raise the changed event.
    //entities.resumeEvents();
    this.changedEvent.raiseEvent();
    this.setLoading(false);
  }
}
