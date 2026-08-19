export const OFFLINE_SERVICE_WORKER_PATH = "/sw.js";

export type OfflineServiceWorkerContainer = Pick<
  ServiceWorkerContainer,
  "register"
>;

export function supportsOfflineServiceWorker(
  locationLike: Pick<Location, "protocol" | "hostname"> = window.location
) {
  return (
    locationLike.protocol === "https:" ||
    locationLike.hostname === "localhost" ||
    locationLike.hostname === "127.0.0.1"
  );
}

export function registerOfflineServiceWorker(
  serviceWorker:
    | OfflineServiceWorkerContainer
    | undefined = typeof navigator === "undefined"
    ? undefined
    : navigator.serviceWorker,
  locationLike: Pick<Location, "protocol" | "hostname"> = window.location
) {
  if (!serviceWorker || !supportsOfflineServiceWorker(locationLike)) return;

  void serviceWorker
    .register(OFFLINE_SERVICE_WORKER_PATH, { scope: "/" })
    .catch(() => undefined);
}
