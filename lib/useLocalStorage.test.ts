// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPendingWrite, readSnapshot, writeValue } from "./useLocalStorage";

/**
 * Tests the storage layer behind useLocalStorage (the hook itself is a thin
 * useSyncExternalStore wrapper) with a stubbed window: debounced writes,
 * coalescing, and the pagehide flush that makes refresh-mid-edit safe.
 */

type Listener = () => void;

function makeFakeWindow() {
  const backing = new Map<string, string>();
  const pageHideListeners: Listener[] = [];
  return {
    backing,
    firePageHide: () => pageHideListeners.forEach((l) => l()),
    window: {
      localStorage: {
        getItem: (k: string) => backing.get(k) ?? null,
        setItem: (k: string, v: string) => void backing.set(k, v),
      },
      addEventListener: (type: string, listener: Listener) => {
        if (type === "pagehide") pageHideListeners.push(listener);
      },
      removeEventListener: () => {},
    },
  };
}

let fake: ReturnType<typeof makeFakeWindow>;
let keyCounter = 0;
let key: string;

beforeEach(() => {
  fake = makeFakeWindow();
  vi.stubGlobal("window", fake.window);
  vi.useFakeTimers();
  key = `test-key-${++keyCounter}`; // fresh key per test (module store is shared)
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("writeValue without debounce", () => {
  it("persists to localStorage immediately", () => {
    writeValue(key, [] as string[], ["a"]);
    expect(fake.backing.get(key)).toBe('["a"]');
  });

  it("supports functional updates from the current value", () => {
    writeValue(key, [] as string[], ["a"]);
    writeValue(key, [] as string[], (prev) => [...prev, "b"]);
    expect(fake.backing.get(key)).toBe('["a","b"]');
  });
});

describe("writeValue with debounce", () => {
  it("updates the in-memory snapshot immediately but defers the write", () => {
    writeValue(key, "", "typed", 400);
    expect(readSnapshot(key, "")).toBe("typed");
    expect(fake.backing.get(key)).toBeUndefined();
    vi.advanceTimersByTime(400);
    expect(fake.backing.get(key)).toBe('"typed"');
  });

  it("coalesces rapid writes into one final write", () => {
    const setItem = vi.spyOn(fake.window.localStorage, "setItem");
    for (const v of ["s", "sp", "spr", "spring"]) {
      writeValue(key, "", v, 400);
      vi.advanceTimersByTime(100); // each write lands inside the previous window
    }
    expect(setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(fake.backing.get(key)).toBe('"spring"');
  });

  it("flushes the pending value on pagehide (refresh mid-debounce loses nothing)", () => {
    writeValue(key, "", "half-typed batch", 400);
    expect(fake.backing.get(key)).toBeUndefined();
    fake.firePageHide(); // simulate refresh/navigation before the timer fires
    expect(fake.backing.get(key)).toBe('"half-typed batch"');
  });

  it("flushPendingWrite is a no-op when nothing is pending", () => {
    writeValue(key, "", "v", 400);
    vi.advanceTimersByTime(400);
    const setItem = vi.spyOn(fake.window.localStorage, "setItem");
    flushPendingWrite(key);
    expect(setItem).not.toHaveBeenCalled();
  });
});

describe("readSnapshot", () => {
  it("restores a stored JSON value", () => {
    fake.backing.set(key, '[{"id":"row-1","baseUrl":"https://a.com"}]');
    expect(readSnapshot(key, [] as unknown[])).toEqual([
      { id: "row-1", baseUrl: "https://a.com" },
    ]);
  });

  it("falls back to the initial value on corrupt JSON", () => {
    fake.backing.set(key, "{not json");
    expect(readSnapshot(key, ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back to the initial value when the key is absent", () => {
    expect(readSnapshot(key, "initial")).toBe("initial");
  });
});
