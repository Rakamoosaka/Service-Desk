export type ServiceRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  kumaMonitorId: string | null;
  kumaMonitorName: string | null;
  isActive: boolean;
  lastSyncedAt: string | Date | null;
};

export type ApplicationRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier: string;
  lastSyncedAt: string | Date | null;
  services: ServiceRecord[];
};
