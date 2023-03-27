import "react-calendar-heatmap/dist/styles.css";
import {
  calculateAverageCompletion,
  calculateTotalCompletions,
} from "../analyticsUtils";
import Card from "../components/Analytics/Card";
import Heatmap from "../components/Analytics/Heatmap";
import Summary from "../components/Analytics/Summary";
import { Save } from "../types";
import "./Analytics.css";
import "../components/Analytics/Heatmap";

function Analytics({ saves }: { saves: Save[] }) {
  return (
    <div className="analytics">
      <div className="heading span2"> Stats </div>
      <Card>
        <div className="stat-container">
          <h2 className="stat">{calculateAverageCompletion(saves) + "%"}</h2>
          <h4 className="stat">Average</h4>
        </div>
      </Card>
      <Card>
        <div className="stat-container">
          <h2 className="stat">{calculateTotalCompletions(saves)}</h2>
          <h4 className="stat">Completions</h4>
        </div>
      </Card>
      <Card title="Last Week" span2>
        <Summary data={saves} />
      </Card>
      <Card title="Summary" span2>
        <Heatmap data={saves} />
      </Card>
    </div>
  );
}

export default Analytics;
