import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "react-confetti-explosion";
import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion";
import {
  FaChevronLeft,
  FaCog,
  FaForward,
  FaPause,
  FaPlay,
  FaTrash,
  FaUndoAlt,
} from "react-icons/fa";
import { StateContext } from "../StateProvider";
import { TimerType } from "../types";
import {
  getHours,
  getMinutes,
  getSeconds,
  GradientSVG,
  prettyTime,
  RadialSeparators,
} from "../utils";
import Add from "./Add";
import Checkmark from "./Checkmark";
import Confirmation from "./Confirmation";
import "./Focus.css";

const confettiProps: ConfettiProps = {
  force: 0.6,
  duration: 2500,
  particleCount: 100,
  width: 1000,
  colors: ["#041E43", "#1471BF", "#5BB4DC", "#FC027B", "#66D805"],
};

const effect = new Audio("/sounds/complete.mp3");

function Focus({ name, delta, total, counter, color, days }: TimerType) {
  const [prevDelta, setPrevDelta] = useState(delta);
  const [taskOver, setTaskOver] = useState(false);
  const {
    state,
    signalStart,
    signalPause,
    signalStop,
    signalReset,
    countNext,
    editTimer,
    deleteTimer,
  } = useContext(StateContext);
  const [isRunning, setIsRunning] = useState(state.state.active);

  useEffect(() => {
    setIsRunning(state.state.active);
  }, [state.state.active]);

  useEffect(() => {
    if (delta >= total && prevDelta != delta) {
      // Delay so that the confetti shows up after the animation.
      setTimeout(() => {
        setTaskOver(true);
        // Don't play sound if the app isn't active.
        if (Capacitor.isNativePlatform() && !App.getState) {
          return;
        }
        effect.play();
      }, 150);
    }
    setPrevDelta(delta);
  }, [delta, total]);

  const init = {
    name,
    seconds: getSeconds(total!),
    minutes: getMinutes(total!),
    hour: getHours(total!),
    delta: delta,
    goal: counter ? total : 1,
    counter,
    color,
    days,
  };

  const handleBack = () => {
    // Handle the back swipe gesture here
    signalStop();
  };

  useEffect(() => {
    // Listen for the backButton event
    const backButtonListener = App.addListener("backButton", handleBack);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      backButtonListener.remove();
    };
  }, []);

  const emptyRect = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };

  const { width, height, x, y } = state.state.focusRect ?? emptyRect;
  return (
    <div className="container">
      <button onClick={() => handleBack()} className="back-button">
        <FaChevronLeft size={32} />
      </button>
      <h3 className="title">{name}</h3>
      <div className="timer-container">
        <GradientSVG />
        <motion.div
          key="focus-timer"
          initial={{
            width,
            height,
            x: x - window.innerWidth / 2,
            y: y - window.innerHeight / 2,
            opacity: 1,
          }}
          animate={{ width: 300, height: 300, x: 0, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgressbarWithChildren
            strokeWidth={6}
            background
            value={(delta! / total!) * 100}
            styles={buildStyles({
              pathColor: color,
              strokeLinecap: "butt",
              trailColor: color + "20",
              backgroundColor:
                delta < total
                  ? "var(--progress-fill)"
                  : color || "#1bb3e6" + "A0",
            })}
          >
            {delta < total ? (
              <h1 style={{ margin: "auto" }}>
                {counter
                  ? `${total - delta} left`
                  : `${prettyTime(total - delta)}`}
              </h1>
            ) : (
              <Checkmark animated={true} />
            )}
            {counter && total != 1 && delta != total && (
              <RadialSeparators
                count={total!}
                style={{
                  background: "var(--progress-fill)",
                  border: "1px solid var(--progress-fill)",
                  width: "19px",
                  height: `20px`,
                  margin: "-1px",
                }}
              />
            )}
          </CircularProgressbarWithChildren>
        </motion.div>
        {taskOver && (
          <div style={{ position: "absolute", left: "50%", top: "50%" }}>
            <ConfettiExplosion {...confettiProps} />
          </div>
        )}
        <br />
        <br />
        <div className="button-container">
          <button
            className="play-button"
            onClick={() =>
              counter ? countNext() : isRunning ? signalPause() : signalStart()
            }
            disabled={delta >= total}
          >
            {counter ? (
              <FaForward />
            ) : isRunning ? (
              <FaPause />
            ) : (
              <FaPlay style={{ position: "relative", left: "2px" }} />
            )}
          </button>
        </div>
      </div>
      <div className="footer-buttons">
        <Confirmation
          title="Reset Timer"
          body="Task data will be reset to zero. This action cannot be undone"
          callback={() => {
            signalReset();
            setTaskOver(false);
          }}
          disabled={delta == 0}
        >
          <FaUndoAlt />
        </Confirmation>
        <Confirmation
          title="Delete Timer"
          body="Task will be deleted. All previous task data will be preserved."
          callback={() => deleteTimer(name)}
        >
          <FaTrash />
        </Confirmation>
        <Add setHook={editTimer} initialValues={init}>
          <button className="action-button">
            <FaCog />
          </button>
        </Add>
      </div>
    </div>
  );
}

export default Focus;
