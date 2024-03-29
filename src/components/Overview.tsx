import { parseTime } from "../utils";

export type OverviewProps = {
  delta: number;
  total: number;
};

function Overview({ delta, total }: OverviewProps) {
  return (
    <div className="overview">
      <h2 style={{ marginBottom: 15 }}> Today </h2>
      Overall completion{" "}
      <strong>{Math.round((delta / total) * 100) || 0} %</strong>
      <progress value={delta} max={total} />
    </div>
  );
}

export default Overview;
