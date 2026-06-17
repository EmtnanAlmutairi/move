export type ConnectedDevice = {
  id: string;
  name: string;
  connected: boolean;
};

export async function listHealthDevices(): Promise<ConnectedDevice[]> {
  // TODO: Integrate with Apple HealthKit / Google Fit / wearable SDKs.
  return [
    { id: 'apple-health', name: 'Apple Health', connected: false },
    { id: 'google-fit', name: 'Google Fit', connected: false },
    { id: 'garmin', name: 'Garmin Connect', connected: false }
  ];
}
