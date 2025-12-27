export interface DriverSettings {
  name: string;
  phone: string;
  defaultBataPerDay: number;
}

export const DEFAULT_DRIVER_SETTINGS: DriverSettings = {
  name: '',
  phone: '',
  defaultBataPerDay: 500,
};
