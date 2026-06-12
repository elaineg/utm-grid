"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state via useSyncExternalStore — hydration-safe
 * (server snapshot = initial value; client value swaps in after hydration)
 * and free of setState-in-effect patterns.
 *
 * Optional `debounceMs`: in-memory state (and subscribers) update
 * immediately, but the localStorage write is deferred until the value has
 * been stable for that long. Pending writes are flushed on `pagehide`, so a
 * refresh or navigation mid-debounce still persists the latest value.
 */

interface Store<T> {
  cached: T;
  loaded: boolean;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setTimeout> | null;
  flushOnPageHide: boolean;
}

const stores = new Map<string, Store<unknown>>();

function getStore<T>(key: string, initial: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = {
      cached: initial,
      loaded: false,
      listeners: new Set(),
      timer: null,
      flushOnPageHide: false,
    };
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

/** Read the current value for a key, loading from localStorage once. */
export function readSnapshot<T>(key: string, initial: T): T {
  const store = getStore(key, initial);
  if (!store.loaded) {
    store.loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) store.cached = JSON.parse(raw) as T;
    } catch {
      // Corrupt JSON or storage unavailable: keep the initial value.
    }
  }
  return store.cached;
}

function persist(key: string, store: Store<unknown>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(store.cached));
  } catch {
    // Storage full/unavailable: keep in-memory value.
  }
}

/** Write any pending debounced value for `key` to localStorage immediately. */
export function flushPendingWrite(key: string): void {
  const store = stores.get(key);
  if (store && store.timer !== null) {
    clearTimeout(store.timer);
    store.timer = null;
    persist(key, store);
  }
}

/**
 * Update the in-memory value (notifying subscribers synchronously) and
 * persist to localStorage — immediately, or debounced by `debounceMs`.
 */
export function writeValue<T>(
  key: string,
  initial: T,
  next: T | ((prev: T) => T),
  debounceMs = 0
): void {
  const store = getStore(key, initial);
  const current = readSnapshot(key, initial);
  store.cached = typeof next === "function" ? (next as (prev: T) => T)(current) : next;

  if (debounceMs > 0) {
    if (store.timer !== null) clearTimeout(store.timer);
    store.timer = setTimeout(() => {
      store.timer = null;
      persist(key, store);
    }, debounceMs);
    if (!store.flushOnPageHide) {
      store.flushOnPageHide = true;
      window.addEventListener("pagehide", () => flushPendingWrite(key));
    }
  } else {
    persist(key, store);
  }

  store.listeners.forEach((l) => l());
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  options?: { debounceMs?: number }
): [T, (next: T | ((prev: T) => T)) => void] {
  const debounceMs = options?.debounceMs ?? 0;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const store = getStore(key, initial);
      store.listeners.add(onChange);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          store.loaded = false; // re-read on next snapshot
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        store.listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const value = useSyncExternalStore(
    subscribe,
    () => readSnapshot(key, initial),
    () => initial
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => writeValue(key, initial, next, debounceMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, debounceMs]
  );

  return [value, setValue];
}
