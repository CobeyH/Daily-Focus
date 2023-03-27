import { Capacitor } from "@capacitor/core";
import dayjs from "dayjs";
import { useContext } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { FaPlus } from "react-icons/fa";
import Add from "../components/Add";
import Confirmation from "../components/Confirmation";
import Focus from "../components/Focus";
import Timer from "../components/Timer";
import { purchaseSKU, SkuInfo } from "../iap";
import { StateContext } from "../StateProvider";
import { FREE_MAX_TIMERS, TimerType } from "../types";

function Main({ proSku }: { proSku: SkuInfo }) {
  const { state, addTimer } = useContext(StateContext);

  const today = dayjs().day();

  return (
    <div style={{ height: "100vh" }}>
      {state.state.focus == -1 && <div className="heading"> Today </div>}
      {state.state.focus !== -1 ? (
        <div>
          <Focus {...state.state.timers[state.state.focus]} />
        </div>
      ) : (
        <div className="page">
          {state.state.timers.length === 0 && (
            <div className="timer">
              <Add setHook={addTimer} reset={true} timers={state.state.timers}>
                <CircularProgressbarWithChildren value={0}>
                  <FaPlus size={32} />
                </CircularProgressbarWithChildren>
              </Add>
            </div>
          )}
          <div className="child">
            {state.state.timers.map((t: TimerType, idx: number) => {
              if (!t.days.includes(today)) return;
              return <Timer key={t.name} {...t} idx={idx} color={t.color} />;
            })}
          </div>
          {/* PRO_MODE */}
          {/* {state.state.promode || */}
          {state.state.timers.length < FREE_MAX_TIMERS ||
          Capacitor.isNativePlatform() ? (
            <Add setHook={addTimer} reset={true} timers={state.state.timers}>
              <button className="add">
                <FaPlus />
              </button>
            </Add>
          ) : (
            <Confirmation
              title={"Buy Pro"}
              body={
                <div>You have reached the three task limit for the free trial. The developers are currently working on adding a <strong>Pro Mode</strong> which will soon be available.</div>
              }
              // PRO_MODE
              // body={
              //   "You have reached the three task limit for the trial period. Buy pro mode to add more activities. $" +
              //   proSku?.proSku?.product.price
              // }
              // callback={() => purchaseSKU(proSku)}
              callback={() => console.log("No Pro Implemented")}
              type={"add"}
              invert
              // confirmText="Purchase"
              confirmText="Wait"
              //disabled={!proSku?.proSku}
            >
              <FaPlus />
            </Confirmation>
          )}
        </div>
      )}
    </div>
  );
}

export default Main;
