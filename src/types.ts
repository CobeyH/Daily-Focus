import dayjs, { Dayjs } from "dayjs";
import { OverviewProps } from "./components/Overview";
import { SkuInfo } from "./iap";

export const FREE_MAX_TIMERS = 3;

export type TimerType = {
  name: string;
  delta: number;
  total: number;
  counter: boolean;
  color: string;
  days: number[];
};

export type FocusRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type State = {
  state: {
    date: number;
    active: boolean;
    focus: number;
    focusRect: FocusRect | null;
    timers: TimerType[];
    saves: Save[];
    promode: boolean;
  };
};

export type Save = {
  date: number;
  timers: TimerType[];
  completion: number;
};

export type themeOption = "dark" | "light";

export const initial: State = {
  state: {
    date: dayjs().valueOf(),
    active: false,
    focus: -1,
    focusRect: null,
    timers: [],
    saves: [],
    promode: false,
  },
};

export type Hooks = {
  state: State;
  setState: (state: State) => void;
  addTimer: (timer: TimerType) => void;
  deleteTimer: (timer: string) => void;
  focusTimer: (idx: number) => void;
  setFocusRect: (rect: DOMRect | null) => void;
  signalStart: () => void;
  signalPause: () => void;
  signalStop: () => void;
  signalReset: () => void;
  resetAllTimers: () => void;
  getOverall: (date: Dayjs) => OverviewProps;
  countNext: () => void;
  editTimer: (timer: TimerType) => void;
  saveAllTimers: (date: Dayjs) => void;
  clearSaves: () => void;
  clearAllData: () => void;
  setProMode: (sku: SkuInfo) => void;
};

export enum TabType {
  Main,
  Analytics,
  Settings,
}
