import { useEffect, useState } from 'react';
import { adminConfig } from '../data/mockData';
import { fetchAdminConfig } from '../services/adminConfigService';
import { AdminConfig } from '../types';

export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(adminConfig);

  useEffect(() => {
    fetchAdminConfig()
      .then((nextConfig) => {
        setConfig({
          ...adminConfig,
          ...nextConfig
        });
      })
      .catch(() => {
        setConfig(adminConfig);
      });
  }, []);

  return config;
}
