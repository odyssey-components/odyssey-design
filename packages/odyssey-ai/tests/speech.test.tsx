import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSpeechInput } from "../src/speech";

describe("speech input", () => {
  it("degrades when browser speech recognition is unavailable", () => {
    const { result } = renderHook(() => useSpeechInput());
    expect(result.current.supported).toBe(false);
  });

  it("starts and aborts a supported recognition session", () => {
    const start = vi.fn();
    const abort = vi.fn();
    class Recognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult = null;
      onerror = null;
      onend = null;
      start = start;
      stop = vi.fn();
      abort = abort;
    }
    Object.assign(window, { SpeechRecognition: Recognition });
    const { result, unmount } = renderHook(() => useSpeechInput());
    act(() => result.current.start());
    expect(result.current.isListening).toBe(true);
    expect(start).toHaveBeenCalledOnce();
    unmount();
    expect(abort).toHaveBeenCalledOnce();
    Reflect.deleteProperty(window, "SpeechRecognition");
  });
});
