import { useContext, useEffect, useState } from "react";
import Confirmation from "../components/Confirmation";
import { purchaseSKU, SkuInfo } from "../iap";
import { StateContext } from "../StateProvider";
import { themeOption } from "../types";

function Settings({
  theme,
  setTheme,
  proSku,
}: {
  theme: themeOption;
  setTheme: (theme: themeOption) => void;
  proSku: SkuInfo;
}) {
  const { state, clearSaves, clearAllData } = useContext(StateContext);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div style={{ height: "100vh" }}>
      <div className="heading"> Settings </div>
      <div style={{ padding: 20 }}>
        <Confirmation
          type="settings-button"
          title="Clear Save Data"
          body="All stats from previous days will be deleted. Today's data and your timers will be preserved."
          callback={() => clearSaves()}
        >
          Clear Saves
        </Confirmation>
        <Confirmation
          type="settings-button"
          title="Clear All Data"
          body="All stats and tasks will be deleted. Your app be reset to factory default."
          callback={() => clearAllData()}
        >
          Clear All Data
        </Confirmation>
        <Confirmation
          title={"Buy Pro"}
          body={
            "Upgrade to Pro Mode and unlock unlimited tasks, giving you the freedom to track all of your habits without any restrictions."
          }
          callback={() => purchaseSKU(proSku)}
          type={"settings-button"}
          invert
          confirmText="Purchase"
          disabled={!proSku?.proSku || state.state.promode}
        >
          Upgrade Pro Mode
        </Confirmation>
        <button
          className="settings-button"
          onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}

export default Settings;
