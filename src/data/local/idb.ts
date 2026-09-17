/**
 * A very small IndexedDB wrapper.
 *
 * Recordings are audio blobs that must survive a reload and must never be
 * silently dropped, which rules out localStorage. This is deliberately
 * minimal — one database, two stores, promise-wrapped requests — rather than a
 * dependency, because the surface used here is four operations wide.
 */

const DB_NAME = 'devprep';
const DB_VERSION = 1;

export const BLOB_STORE = 'recordings';
export const KV_STORE = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
    request.onblocked = () =>
      reject(new Error('IndexedDB upgrade blocked by another open tab.'));
  });

  return dbPromise;
}

function run<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const request = operation(tx.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
      }),
  );
}

export const idb = {
  get<T>(storeName: string, key: string): Promise<T | undefined> {
    return run<T | undefined>(storeName, 'readonly', (store) => store.get(key));
  },

  put(storeName: string, key: string, value: unknown): Promise<void> {
    return run(storeName, 'readwrite', (store) => store.put(value, key)).then(() => undefined);
  },

  delete(storeName: string, key: string): Promise<void> {
    return run(storeName, 'readwrite', (store) => store.delete(key)).then(() => undefined);
  },

  clear(storeName: string): Promise<void> {
    return run(storeName, 'readwrite', (store) => store.clear()).then(() => undefined);
  },

  keys(storeName: string): Promise<IDBValidKey[]> {
    return run<IDBValidKey[]>(storeName, 'readonly', (store) => store.getAllKeys());
  },

  values<T>(storeName: string): Promise<T[]> {
    return run<T[]>(storeName, 'readonly', (store) => store.getAll());
  },
};

/** True when IndexedDB can actually be used, e.g. not in a locked-down frame. */
export async function isIdbAvailable(): Promise<boolean> {
  try {
    await openDatabase();
    return true;
  } catch {
    return false;
  }
}
