/**
 * Adds data to browser cache
 * @param cacheName Key used for fetching and storing this data from the cache
 * @param url URL of the thing
 * @param response Data to add to cache
 * @returns True on success
 */
export const addToCache = (cacheName: string, url: string, response: any): boolean => {
  const data = new Response(JSON.stringify(response));

  if ('caches' in window) {
    // Open given cache and store data
    caches.open(cacheName).then((cache) => {
      cache.put(url, data);
    });
  } else {
    return false;
  }
  return true;
};

export const getData = async (cacheName: string, url: string) => {
  // const cacheVersion = 1;
  // const cacheName = ...
  // const url = ...
  let cachedData = await getCachedData(cacheName, url);

  if (cachedData) {
    return cachedData;
  }

  return cachedData;
};

const getCachedData = async (cacheName: string, url: string) => {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }
  return await cachedResponse.json();
};
