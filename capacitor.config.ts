
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.db8bb4f0e45c4505b8893c0b4e78eacc',
  appName: 'onibus-kids-tracker',
  webDir: 'dist',
  server: {
    url: 'https://db8bb4f0-e45c-4505-b889-3c0b4e78eacc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
