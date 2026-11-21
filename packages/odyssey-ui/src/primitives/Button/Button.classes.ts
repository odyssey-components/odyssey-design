export const buttonClasses = {
  feedbackLayer: "pointer-events-none absolute inset-0 rounded-[inherit]",
  rippleLayer: "overflow-hidden [color:var(--_od-radial-ripple-color)]",
  spinner:
    "inline-block size-[1em] animate-[od-spin_0.7s_linear_infinite] rounded-full border-2 border-solid border-current [border-inline-end-color:transparent]",
  outlineWave: "od-Button-outlineWave",
  radialRipple: "od-Button-radialRipple",
  radialRippleChild: "od-Button-radialRippleChild",
  radialRippleLeaving: "od-Button-radialRippleLeaving",
} as const;
