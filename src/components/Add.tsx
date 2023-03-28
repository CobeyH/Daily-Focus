import { useEffect, useReducer, useRef, useState } from "react";
import { Color, TwitterPicker } from "react-color";
import { State, TimerType } from "../types";
import "./Add.css";
import DaySelector from "./DaySelector";

const range = (start: number = 0, stop: number = 31, step = 5) =>
  Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

function Add({
  setHook,
  children,
  initialValues = {
    name: "",
    seconds: 0,
    minutes: 0,
    hour: 0,
    goal: 1,
    delta: 0,
    counter: false,
    color: "#1bb3e6",
    days: [0, 1, 2, 3, 4, 5, 6],
  },
  reset = false,
  timers,
}: {
  setHook: any;
  children: any;
  initialValues?: any;
  reset?: boolean;
  timers?: TimerType[];
}) {
  const [modal, setModal] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Close color picker when the user clicks outside it.
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (pickerRef.current && pickerRef.current.contains(event.target)) {
        setDisplayPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  function reducer(state: State, action: any) {
    switch (action.type) {
      default:
        return { ...state, ...action };
    }
  }
  const [formValues, setFormValues] = useReducer(reducer, initialValues);

  const [counter, setCounter] = useState(initialValues.counter);
  const [selectedDays, setSelectedDays] = useState(initialValues.days);
  const [displayPicker, setDisplayPicker] = useState(false);

  const { name, delta, seconds, minutes, hour, goal, color } = formValues;

  function handleFormChange(event: any) {
    const { name, value } = event.target;
    setFormValues({ [name]: value.slice(0, 16) });
  }

  function handleColorChange(color: Color) {
    setFormValues({ color });
  }

  const nameExists =
    timers &&
    timers.some((timer) => timer.name.toLowerCase() === name.toLowerCase());

  function handleFormSubmit() {
    setModal(!modal);
    const params: TimerType = {
      name: name
        .split(" ")
        .map(
          (s: string) =>
            s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase()
        )
        .join(" "),
      delta,
      total: !counter
        ? Number(hour) * 3600 + Number(minutes) * 60 + Number(seconds)
        : goal,
      counter,
      color,
      days: selectedDays,
    };
    setHook(params);
    if (reset) setFormValues(initialValues);
  }
  function handleFormCancel() {
    setModal(!modal);
    setFormValues(initialValues);
  }

  return (
    <>
      <a
        onClick={() => {
          setModal(true);
          setFormValues(initialValues);
        }}
      >
        {children}
      </a>
      <dialog open={modal}>
        <article className="modal">
          <label>
            Activity
            <input
              type="text"
              name="name"
              placeholder="Activity name like Running, Reading..."
              value={name}
              onChange={handleFormChange}
              autoComplete="nope"
            />
            {nameExists && (
              <strong
                style={{ color: "salmon", position: "relative", bottom: 10 }}
              >
                This activity name already exists
              </strong>
            )}
          </label>
          <label>
            Color
            <input
              type="color"
              name="color"
              value={color}
              onClick={(e) => {
                e.preventDefault();
                setDisplayPicker((display) => !display);
              }}
              readOnly
            />
          </label>
          <div>
            {displayPicker ? (
              <div className="popover">
                <div className="cover" ref={pickerRef} />
                <TwitterPicker
                  color={color}
                  onChangeComplete={(e) => {
                    handleColorChange(e.hex);
                    setDisplayPicker(false);
                  }}
                  styles={{
                    default: {
                      triangle: {
                        borderColor:
                          "transparent transparent var(--background-color)",
                      },
                      card: { background: "var(--background-color)" },
                      hash: { display: "none" },
                      input: { display: "none" },
                    },
                  }}
                />
              </div>
            ) : null}
          </div>
          <div className="inline">
            Type:
            <button
              className={counter ? "secondary" : ""}
              onClick={() => setCounter(!counter)}
            >
              Timer
            </button>
            <button
              className={!counter ? "secondary" : ""}
              onClick={() => setCounter(!counter)}
            >
              Counter
            </button>
          </div>
          <DaySelector value={selectedDays} setDays={setSelectedDays} />
          {selectedDays.length < 1 && (
            <strong
              style={{ color: "salmon", position: "relative", bottom: 8 }}
            >
              Select at least one day
            </strong>
          )}
          <div style={{ height: 98 }}>
            {!counter ? (
              <div className="inline">
                <label>
                  Hour
                  <select name="hour" value={hour} onChange={handleFormChange}>
                    {range(0, 10, 1).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Minutes
                  <select
                    name="minutes"
                    value={minutes}
                    onChange={handleFormChange}
                  >
                    {range(0, 60, 1).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Seconds
                  <select
                    name="seconds"
                    value={seconds}
                    onChange={handleFormChange}
                  >
                    {range(0, 60, 1).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div>
                <label>
                  Goal
                  <select name="goal" value={goal} onChange={handleFormChange}>
                    {range(1, 13, 1).map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <br />
          </div>
          <footer style={{ display: "flex" }}>
            <button
              role="button"
              className="secondary"
              onClick={handleFormCancel}
            >
              Cancel
            </button>
            <button
              role="button"
              data-target="modal-example"
              onClick={handleFormSubmit}
              disabled={
                name.trim() === "" ||
                (counter ? false : hour + minutes + seconds <= 0) ||
                nameExists ||
                selectedDays.length < 1
              }
            >
              Confirm
            </button>
          </footer>
        </article>
      </dialog>
    </>
  );
}

export default Add;
