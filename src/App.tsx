import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import "./App.css";
import NavBar from "./components/NavBar";
import ThemeProvider from "./components/ThemeProvider";
import { initGlassfy, SkuInfo } from "./iap";
import Analytics from "./Pages/Analytics";
import Main from "./Pages/Main";
import Settings from "./Pages/Settings";
import { StateContext } from "./StateProvider";
import { TabType, themeOption } from "./types";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const { state, getOverall, setProMode } = useContext(StateContext);

  const [[tab, direction], setTab] = useState([TabType.Main, 0]);
  const [theme, setTheme] = useState<themeOption>("dark");

  var { delta } = getOverall(dayjs());
  delta *= 100;
  if (state.state.timers.length == 0) delta = 100;

  const [proSku, setProSku] = useState<SkuInfo>({
    isPro: undefined,
    proSku: undefined,
  });

  // PRO_MODE
  // useEffect(() => {
  //   async function init() {
  //     const skuInfo = await initGlassfy();
  //     setProSku(skuInfo);
  //     setProMode(skuInfo);
  //   }
  //   init();
  // }, []);

  // Set up gesture controls for page navigation.
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (state.state.focus !== -1) return;
      setTab((t) => [Math.min(2, t[0] + 1), 1]);
    },
    onSwipedRight: () => {
      setTab((t) => [Math.max(0, t[0] - 1), -1]);
    },
  });

  // Load the theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as themeOption);
    }
  }, []);

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      };
    },
  };
  // init
  return (
    <ThemeProvider theme={theme}>
      <div
        style={{ height: "100vh", background: "var(--background-color)" }}
        {...handlers}
      >
        {/* <pre style={{ height: 200 }}>{JSON.stringify(state, undefined, 2)}</pre> */}

        {/* Animation for switching between pages */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={tab}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              duration: 5,
            }}
          >
            <div
              style={{
                height: `${100-delta}%`,
                width: "100vw",
                background: "var(--progress-fill)",
                transition: "all 0.5s",
                position: "absolute",
                zIndex: 0,
                bottom: 0,
              }}
            />
            {tab === TabType.Main && <Main proSku={proSku} />}
            {tab === TabType.Analytics && (
              <div>
                <Analytics saves={state.state.saves} />
              </div>
            )}
            {tab === TabType.Settings && (
              <Settings theme={theme} setTheme={setTheme} proSku={proSku} />
            )}
          </motion.div>
        </AnimatePresence>
        {state.state.focus === -1 && <NavBar tab={tab} setTab={setTab} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
