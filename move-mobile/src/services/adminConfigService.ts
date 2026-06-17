import { adminConfig } from '../data/mockData';
import { AdminConfig } from '../types';

export async function fetchAdminConfig(): Promise<AdminConfig> {
  // TODO: Replace with Firestore read from admin-controlled document.
  return Promise.resolve(adminConfig);
}
