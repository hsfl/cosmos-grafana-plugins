type Routes = 'comm' | 'orbit';
type Dests = 'iobcfm' | 'unibapfm';
type Radios = 'RXS' | 'TXS' | 'UHF' | 'Simplex' | 'Net' | 'All';

export interface SimpleOptions {
  btnLabel: string;
  route: Routes;
  dest: Dests;
  cmdID: number;
  args: string;
  radioout: Radios;
}
