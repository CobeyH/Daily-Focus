import { Save } from "../../types";
import CalendarHeatmap from "react-calendar-heatmap";
import dayjs from "dayjs";
import "./Heatmap.css";

function Heatmap({ data }: { data: Save[] }) {
  const lastThreeMonths = data.filter((save: Save) => {
    return Math.abs(dayjs().diff(dayjs(save.date), "months")) <= 3;
  });
  return (
    <CalendarHeatmap
      showWeekdayLabels
      gutterSize={2.5}
      startDate={dayjs().subtract(3, "months").toDate()}
      endDate={dayjs().subtract(1, "day").toDate()}
      values={lastThreeMonths.map((save: Save) => {
        return {
          date: dayjs(save.date).format("YYYY-MM-DD"),
          count: save.completion,
        };
      })}
      classForValue={(value) => {
        if (!value) {
          return "color-empty";
        }
        return `color-scale-${Math.round(value.count / 25)}`;
      }}
    />
  );
}

export default Heatmap;
