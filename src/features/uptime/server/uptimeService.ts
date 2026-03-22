import { uptimeKumaStatusPageProvider } from "@/features/uptime/server/uptimeKumaStatusPageProvider";

export async function getApplicationUptime(
  applicationSlug: string,
  uptimeKumaIdentifier?: string | null,
) {
  if (!uptimeKumaIdentifier) {
    return uptimeKumaStatusPageProvider.getStatus("");
  }

  return uptimeKumaStatusPageProvider.getStatus(uptimeKumaIdentifier);
}

export async function getApplicationUptimeByIdentifier(identifier: string) {
  return uptimeKumaStatusPageProvider.getStatus(identifier);
}
