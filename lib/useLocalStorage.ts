"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state via useSyncExternalStore — hydration-safe
 * (server snapshot = initial value; client value swaps in after hydration)
 * and free of setState-in-effect patterns.
 */

interface Store<T> {
  cached: T;
  loaded: boolean;
  listeners: Set<() => void>;
}

const stores = new Map<string, Store<unknown>>();

function getStore<T>(key: string, initial: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = { cached: initial, loaded: false, listeners: new Set() };
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

function readSnapshot<T>(key: string, initial: T): T {
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

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (next: T | ((prev: T) => T)) => void] {
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
    (next: T | ((prev: T) => T)) => {
      const store = getStore(key, initial);
      const current = readSnapshot(key, initial);
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      store.cached = resolved;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage full/unavailable: keep in-memory value.
      }
      store.listeners.forEach((l) => l());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, setValue];
}
