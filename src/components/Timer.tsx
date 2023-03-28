import { useContext, useRef } from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { StateContext } from "../StateProvider";
import { TimerType } from "../types";
import { prettyTime, RadialSeparators } from "../utils";
import Checkmark from "./Checkmark";
import "./Checkmark.css";

type TimerProps = TimerType & {
  idx: number;
};

function Timer({ name, delta, total, counter, idx, color }: TimerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { focusTimer, setFocusRect } = useContext(StateContext);

  return (
    <div className="timer foreground">
      <a
        onClick={() => {
          focusTimer(idx);
          setFocusRect(ref.current?.getBoundingClientRect() ?? null);
        }}
      >
        <div className="timer-title">
          <strong>{name}</strong>
        </div>
        <div ref={ref}>
          <CircularProgressbarWithChildren
            value={(delta / total) * 100}
            background
            // backgroundPadding={delta == 0 ? 100 : 0}
            strokeWidth={10}
            styles={buildStyles({
              pathColor: color,
              strokeLinecap: "butt",
              trailColor: color + "20",
              // trailColor: "#2e2e2e",
              backgroundColor:
                delta < total
                  ? "var(--timer-color)"
                  : color || "#1bb3e6" + "A0",
            })}
          >
            {delta < total ? (
              <h3 style={{ margin: "auto" }}>
                {counter
                  ? `${total - delta} left`
                  : `${prettyTime(total - delta)}`}
              </h3>
            ) : (
              <Checkmark animated={false} />
            )}
            {counter && total != 1 && delta != total && (
              <RadialSeparators
                count={total!}
                style={{
                  background: "var(--timer-color)",
                  width: "12px",
                  height: `${15}%`,
                  margin: "-1px",
                }}
              />
            )}
          </CircularProgressbarWithChildren>
        </div>
      </a>
    </div>
  );
}

export default Timer;
