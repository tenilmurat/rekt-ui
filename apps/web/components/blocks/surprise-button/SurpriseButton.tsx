"use client";

export type SurpriseButtonProps = {
  /** The button's text. */
  label?: string;
  /** Text size. */
  size?: "sm" | "md" | "lg";
  /** How long the colour band takes to sweep through the label, in milliseconds. */
  speed?: number;
  /** Lift the label with a small spring while hovered. */
  lift?: boolean;
  /** Called when the button is pressed. */
  onClick?: () => void;
};

/**
 * A text button. Hovering sweeps a colour band once through the label, left
 * to right, and the text settles on ink with a small springy lift; it presses
 * in on click. The band is a copy of the label laid over the real one, hidden
 * from screen readers.
 */
export function SurpriseButton({
  label = "Surprise me",
  size = "md",
  speed = 700,
  lift = true,
  onClick,
}: SurpriseButtonProps) {
  return (
    <button
      type="button"
      className="rk-surprise"
      data-size={size}
      data-lift={lift}
      onClick={onClick}
      style={{ "--rk-surprise-speed": `${Math.max(0, speed)}ms` } as React.CSSProperties}
    >
      <span className="rk-surprise__label">
        {label}
        <span className="rk-surprise__sweep" aria-hidden="true">
          {label}
        </span>
      </span>
    </button>
  );
}
