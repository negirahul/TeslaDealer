import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tesladealer',
  appName: 'Tesla Dealer',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
