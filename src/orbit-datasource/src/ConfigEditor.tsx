import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onBackendUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      backendurl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };
  onDBUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      dburl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };
  onOrgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      org: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAuthKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        authKey: event.target.value,
      },
    });
  };

  onResetAuthKey = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        authKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        authKey: '',
      },
    });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Cosmos Backend URL"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onBackendUrlChange}
            value={jsonData.backendurl || ''}
            placeholder={'cosmos_backend or 172.17.0.0'}
            tooltip={'Hostname or URL to cosmos_backend container'}
          />
        </div>

        <div className="gf-form">
          <FormField
            label="Database URL"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onDBUrlChange}
            value={jsonData.dburl || ''}
            placeholder="http://influxdb:8086"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Organization"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onOrgChange}
            value={jsonData.org || ''}
            placeholder="InfluxDB bucket organization name"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.authKey) as boolean}
              value={secureJsonData.authKey || ''}
              label="Auth Key"
              placeholder="InfluxDB bucket authentication key"
              labelWidth={6}
              inputWidth={20}
              onReset={this.onResetAuthKey}
              onChange={this.onAuthKeyChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
