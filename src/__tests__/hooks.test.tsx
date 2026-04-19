import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { FormatState, useFormatState } from "../hooks/useFormatState";

/**
 * Integration tests for custom hooks
 */

describe("useClickOutside", () => {
    it("calls handler when clicking outside the referenced element", () => {
        const handler = jest.fn();
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLElement>;
        document.body.appendChild(ref.current!);

        renderHook(() => useClickOutside(ref, handler));

        // Click outside
        act(() => {
            document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(handler).toHaveBeenCalledTimes(1);
        document.body.removeChild(ref.current!);
    });

    it("does not call handler when clicking inside the referenced element", () => {
        const handler = jest.fn();
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLElement>;
        document.body.appendChild(ref.current!);

        renderHook(() => useClickOutside(ref, handler));

        // Click inside
        act(() => {
            ref.current!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(handler).not.toHaveBeenCalled();
        document.body.removeChild(ref.current!);
    });

    it("calls handler on touchstart outside", () => {
        const handler = jest.fn();
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLElement>;
        document.body.appendChild(ref.current!);

        renderHook(() => useClickOutside(ref, handler));

        act(() => {
            document.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        });

        expect(handler).toHaveBeenCalledTimes(1);
        document.body.removeChild(ref.current!);
    });

    it("does not call handler when ref is null", () => {
        const handler = jest.fn();
        const ref = { current: null } as React.RefObject<HTMLElement>;

        renderHook(() => useClickOutside(ref, handler));

        act(() => {
            document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it("cleans up event listeners on unmount", () => {
        const handler = jest.fn();
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLElement>;
        document.body.appendChild(ref.current!);

        const { unmount } = renderHook(() => useClickOutside(ref, handler));
        unmount();

        act(() => {
            document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(handler).not.toHaveBeenCalled();
        document.body.removeChild(ref.current!);
    });
});

describe("useFormatState", () => {
    it("returns default format state", () => {
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLDivElement>;

        const { result } = renderHook(() => useFormatState(ref));

        const state: FormatState = result.current;
        expect(state.isBold).toBe(false);
        expect(state.isItalic).toBe(false);
        expect(state.isUnderline).toBe(false);
        expect(state.isAlignLeft).toBe(false);
        expect(state.isAlignCenter).toBe(false);
        expect(state.isAlignRight).toBe(false);
        expect(state.isBulletList).toBe(false);
        expect(state.isOrderedList).toBe(false);
        expect(state.currentFontSize).toBe("16px");
        expect(state.currentFontFamily).toBe("Arial");
        expect(state.currentColor).toBe("#000000");
    });

    it("cleans up selectionchange listener on unmount", () => {
        const ref = { current: document.createElement("div") } as React.RefObject<HTMLDivElement>;
        const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

        const { unmount } = renderHook(() => useFormatState(ref));
        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("selectionchange", expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });
});
