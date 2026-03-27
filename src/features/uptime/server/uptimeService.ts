import { uptimeKumaStatusPageProvider } from "@/features/uptime/server/uptimeKumaStatusPageProvider";

export async function getServiceUptime(uptimeKumaIdentifier?: string | null) {
  if (!uptimeKumaIdentifier) {
    return uptimeKumaStatusPageProvider.getStatus("");
  }

  return uptimeKumaStatusPageProvider.getStatus(uptimeKumaIdentifier);
}

export async function getServiceUptimeByIdentifier(identifier: string) {
  return uptimeKumaStatusPageProvider.getStatus(identifier);
}
