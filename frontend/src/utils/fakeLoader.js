// Shared cosmetic loader delay — used wherever a client-side flow should
// look like a real API call (demo placebet, demo reports, initial page
// loaders). One constant so the timing stays consistent app-wide.
export const FAKE_LOADER_MS = 1000;

export const fakeLoaderDelay = (ms = FAKE_LOADER_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));
