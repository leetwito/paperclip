// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ActingAsProvider, useActingAs } from "./ActingAsContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let capturedSetter: ((id: string | null) => void) | null = null;

function Probe() {
  const { actingAsId, setActingAsId } = useActingAs();
  capturedSetter = setActingAsId;
  return (
    <div>
      <span data-testid="id">{actingAsId ?? "none"}</span>
    </div>
  );
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

beforeEach(() => {
  localStorage.clear();
  capturedSetter = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  container = null;
  root = null;
  capturedSetter = null;
});

function getIdText(): string | null | undefined {
  return container?.querySelector('[data-testid="id"]')?.textContent;
}

describe("ActingAsContext", () => {
  it("defaults to null when nothing is stored", () => {
    act(() => {
      root!.render(
        <ActingAsProvider companyId="co-1">
          <Probe />
        </ActingAsProvider>,
      );
    });
    expect(getIdText()).toBe("none");
  });

  it("persists selection to localStorage scoped by company", () => {
    act(() => {
      root!.render(
        <ActingAsProvider companyId="co-1">
          <Probe />
        </ActingAsProvider>,
      );
    });
    act(() => {
      capturedSetter?.("persona-1");
    });
    expect(getIdText()).toBe("persona-1");
    expect(localStorage.getItem("paperclip:acting-as:co-1")).toBe("persona-1");
  });

  it("re-hydrates from localStorage on mount", () => {
    localStorage.setItem("paperclip:acting-as:co-1", "persona-2");
    act(() => {
      root!.render(
        <ActingAsProvider companyId="co-1">
          <Probe />
        </ActingAsProvider>,
      );
    });
    expect(getIdText()).toBe("persona-2");
  });

  it("clears localStorage when setter called with null", () => {
    localStorage.setItem("paperclip:acting-as:co-1", "persona-3");
    act(() => {
      root!.render(
        <ActingAsProvider companyId="co-1">
          <Probe />
        </ActingAsProvider>,
      );
    });
    expect(getIdText()).toBe("persona-3");
    act(() => {
      capturedSetter?.(null);
    });
    expect(getIdText()).toBe("none");
    expect(localStorage.getItem("paperclip:acting-as:co-1")).toBeNull();
  });
});
