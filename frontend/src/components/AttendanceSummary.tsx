import { STATUS_STYLE } from "./StatusStyles";

export default function AttendanceSummary(
  {showTotal, summary} : {
    showTotal: boolean;
    summary:{
      present: number,
      late: number,
      absent:number,
      total?:number
    }
  }
) {
  const summaryArr = [
    { label: `${summary.present ?? 0} present`, ...STATUS_STYLE["On time"] },
    { label: `${summary.late ?? 0} late`, ...STATUS_STYLE["Late"] },
    { label: `${summary.absent ?? 0} absent`, ...STATUS_STYLE["Absent"] },
  ]

  if (showTotal && summary.total) {
    summaryArr.push({
			label: `${summary.total ?? 0} total`,
			bg: "var(--light-grey-purple)",
			color: "var(--dark-blue-indigo)",
		})
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {summaryArr.map((s) => (
        <span
          key={s.label}
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: s.bg, color: s.color }}
        >
          {s.label}
        </span>
      ))}
    </div>
  )
}