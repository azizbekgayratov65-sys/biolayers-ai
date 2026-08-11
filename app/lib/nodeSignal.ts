export type NodeInterfaceMode =
  | "idle"
  | "route"
  | "connect"
  | "evidence"
  | "hypothesis"
  | "research"
  | "success"
  | "warning";

export function signalNode(
  mode: NodeInterfaceMode,
  message?: string,
  duration = 2200,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "biolayers:node",
      {
        detail: {
          mode,
          message,
          duration,
        },
      },
    ),
  );
}