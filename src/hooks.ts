import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Channel, LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { OverviewProps } from "./components/Overview";
import { initial, Save, State, TimerType } from "./types";
import { Dayjs } from "dayjs";
import { SkuInfo } from "./iap";

export function useTimer() {
  const [state, setState] = useState<State>(initial);
  const [isLoaded, setLoaded] = useState(false);
  const [active, setActive] = useState(true);
  const intervalIdRef = useRef<NodeJS.Timeout>();

  // ask for notification permission
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.requestPermissions();

    const channel: Channel = {
      id: "main",
      name: "Task Finished",
      description: "Triggers when a timer completes in the app.",
      sound: "harp.mp3",
      importance: 4,
      visibility: 1,
      lights: true,
      vibration: true,
    };
    LocalNotifications.createChannel(channel);
  }

  App.addListener("appStateChange", ({ isActive }) => {
    if (active != isActive) {
      setActive(isActive);
    }
  });

  // initial load
  useEffect(() => {
    if (!active) return;
    Preferences.get({ key: "state" }).then((res) => {
      if (res.value) {
        setState(JSON.parse(res.value));
        setLoaded(true);
      }
    });
  }, [active]);

  // runs once after loading state
  useEffect(() => {
    if (!isLoaded) return;

    // daily reset check
    const lastDate = dayjs(state.state.date);
    const now = dayjs();
    if (!now.isSame(lastDate, "day")) {
      saveAllTimers(lastDate);
      resetAllTimers();
    }
    //TODO: Handle case where it's the same day
    // increment check if not daily reset not happened
    else if (state.state.active) {
      fastForwardTimer();
    }
    setLoaded(false);
  }, [isLoaded, state]);

  function fastForwardTimer() {
    const prevDate = dayjs(state.state.date).startOf("second");
    const now = dayjs().startOf("second");
    let seconds = now.diff(prevDate, "seconds");

    const newTimers = [...state.state.timers];
    newTimers[state.state.focus].delta = Math.min(
      newTimers[state.state.focus].total,
      newTimers[state.state.focus].delta + seconds
    );
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: newTimers,
          date: dayjs().startOf("second").valueOf(),
        },
      };
    });
  }

  const intervalFunction = useCallback(async () => {
    await Preferences.set({
      key: "state",
      value: JSON.stringify(state),
    });

    // daily reset check
    const prevDate = dayjs(state.state.date);

    if (!dayjs().isSame(prevDate, "day")) {
      saveAllTimers(prevDate);
      resetAllTimers();
      return;
    }

    // check for timer active
    if (state.state.active) {
      const newTimers = [...state.state.timers];
      const delta = newTimers[state.state.focus].delta;
      const total = newTimers[state.state.focus].total;

      // timer can be decremented, do that
      if (delta < total) {
        fastForwardTimer();
      }
      // timer already at 0, set active to false
      else {
        setState((prevState) => {
          return {
            state: {
              ...prevState.state,
              date: dayjs().valueOf(),
              active: false,
            },
          };
        });
      }
    }
    // no decrement -- update date in state
    else {
      setState((prevState) => {
        return {
          state: {
            ...prevState.state,
            date: dayjs().valueOf(),
          },
        };
      });
    }
  }, [state, setState]);

  useEffect(() => {
    intervalIdRef.current = setInterval(intervalFunction, 1000);
    return () => clearInterval(intervalIdRef.current!);
  }, [intervalFunction]);

  // addition
  function addTimer(props: TimerType) {
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: [...prevState.state.timers, props],
        },
      };
    });
  }

  // edit
  function editTimer(props: TimerType) {
    const newTimers = [...state.state.timers];
    newTimers[state.state.focus] = props;
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: newTimers,
        },
      };
    });
  }

  // Set pro mode
  function setProMode(skuInfo: SkuInfo) {
    if (skuInfo === undefined) return;
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          promode: skuInfo.isPro ?? prevState.state.promode,
        },
      };
    });
  }

  // removal
  function deleteTimer(name: string) {
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          active: false,
          focus: -1,
          timers: prevState.state.timers.filter((t) => t.name !== name),
        },
      };
    });
  }

  // focus
  function focusTimer(idx: number) {
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          focus: idx,
        },
      };
    });
  }

  function setFocusRect(rect: DOMRect | null) {
    if (rect == null) return;
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          focusRect: {
            width: rect.width,
            height: rect.height,
            x: rect.x + rect.width,
            y: rect.y + rect.height,
          },
        },
      };
    });
  }

  async function sendNotification() {
    const now = dayjs();
    const delta = state.state.timers[state.state.focus].delta;
    const total = state.state.timers[state.state.focus].total;
    const future = now.add(total - delta, "seconds");

    if (now.diff(future, "days") > 1) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: state.state.timers[state.state.focus].name + " Finished!",
          body: "Congratulations, you have completed your task.",
          smallIcon: "icon",
          id: 1,
          schedule: {
            at: future.toDate(),
            allowWhileIdle: true,
          },
          sound: "harp3.mp3",
          channelId: "main",
        },
      ],
    });
  }

  async function cancelNotification() {
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }],
    });
  }

  function countNext() {
    const newTimers = [...state.state.timers];
    newTimers[state.state.focus].delta += 1;
    newTimers[state.state.focus].delta = Math.min(
      newTimers[state.state.focus].total,
      newTimers[state.state.focus].delta
    );
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: newTimers,
        },
      };
    });
  }

  // start
  function signalStart() {
    sendNotification();
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          active: true,
          date: dayjs().valueOf(),
        },
      };
    });
  }

  // pause
  function signalPause() {
    cancelNotification();
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          active: false,
          date: dayjs().valueOf(),
        },
      };
    });
  }

  function clearAllData() {
    setState(initial);
  }

  // stop
  function signalStop() {
    cancelNotification();
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          active: false,
          focus: -1,
        },
      };
    });
  }

  // reset
  function signalReset() {
    signalPause();
    cancelNotification();
    const newTimers = [...state.state.timers];
    newTimers[state.state.focus].delta = 0;
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: newTimers,
        },
      };
    });
  }

  function saveAllTimers(date: Dayjs) {
    const overall = getOverall(date);
    // Push timer for last day with data
    const newSave = {
      timers: state.state.timers,
      completion: Math.round((overall.delta / overall.total) * 100),
      date: date.valueOf(),
    };
    // Add saves to state

    setState((prevState: State) => {
      return {
        state: {
          ...prevState.state,
          saves: [...(prevState.state.saves || []), newSave],
          date: dayjs().valueOf(),
        },
      };
    });
  }

  function clearSaves() {
    setState((prevState: State) => {
      return {
        state: {
          ...prevState.state,
          saves: [],
        },
      };
    });
  }

  // reset all
  function resetAllTimers() {
    cancelNotification();
    const newTimers = state.state.timers.map((t) => {
      return {
        ...t,
        delta: 0,
      };
    });
    setState((prevState) => {
      return {
        state: {
          ...prevState.state,
          timers: newTimers,
        },
      };
    });
  }

  // accumulated timer data
  function getOverall(date: Dayjs): OverviewProps {
    const reducer = (accumulator: TimerType, currentValue: TimerType) => ({
      name: "",
      delta:
        Number(accumulator.delta) +
        Number(currentValue.delta) / Number(currentValue.total),
      total: Number(accumulator.total) + 1,
      counter: false,
      reverse: false,
      color: "",
      days: [],
    });
    const todayTimers = state.state.timers.filter((t: TimerType) =>
      t.days.includes(date.day())
    );
    const { delta, total } = todayTimers.reduce(reducer, {
      name: "",
      delta: 0,
      total: 0,
      counter: false,
      reverse: false,
      color: "",
      days: [],
    });

    return {
      delta: (total - delta) / todayTimers.length || 0,
      total: total / todayTimers.length || 0,
    };
  }

  return {
    state,
    setState,
    addTimer,
    deleteTimer,
    focusTimer,
    setFocusRect,
    signalStart,
    signalPause,
    signalStop,
    signalReset,
    resetAllTimers,
    getOverall,
    countNext,
    editTimer,
    saveAllTimers,
    clearSaves,
    clearAllData,
    setProMode,
  };
}
