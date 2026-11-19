export function randomVisitorToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

/** A random, first-party browser ID; no personal details or fingerprinting. */
export function getVisitorIdentity(): Promise<string | null> {
  return new Promise(resolve => {
    let database: IDBDatabase | undefined;
    let settled = false;
    const finish = (identity: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      database?.close();
      resolve(identity);
    };
    const timeout = window.setTimeout(() => finish(null), 5000);

    try {
      const open = indexedDB.open('shifra-anonymous-visitors', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('identity');
      open.onerror = () => finish(null);
      open.onblocked = () => finish(null);
      open.onsuccess = () => {
        database = open.result;
        if (settled) { database.close(); return; }
        database.onversionchange = () => database?.close();
        try {
          // IndexedDB serializes these transactions across tabs, so simultaneous
          // first visits reuse one ID rather than creating one per tab.
          const transaction = database.transaction('identity', 'readwrite');
          const store = transaction.objectStore('identity');
          const read = store.get('visitor');
          let identity: string | null = null;
          read.onsuccess = () => {
            if (typeof read.result === 'string' && /^[a-f0-9]{32}$/.test(read.result)) {
              identity = read.result;
            } else {
              identity = randomVisitorToken();
              store.put(identity, 'visitor');
            }
          };
          transaction.oncomplete = () => finish(identity);
          transaction.onabort = () => finish(null);
          transaction.onerror = () => finish(null);
        } catch { finish(null); }
      };
    } catch { finish(null); }
  });
}
