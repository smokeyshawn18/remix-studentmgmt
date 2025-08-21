import { useRef } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { toPng } from "html-to-image";
import { Button } from "~/components/ui/button";

interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
  }[];
}

interface ReportChartProps {
  type: "pie" | "bar" | "line";
  title: string;
  data: ChartData;
  fileName: string;
}

export function ReportChart({ type, title, data, fileName }: ReportChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadChart = () => {
    if (chartRef.current) {
      toPng(chartRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button onClick={downloadChart} variant="outline" size="sm">
          Download
        </Button>
      </div>

      <div ref={chartRef} className="bg-white p-4 rounded-lg">
        {type === "pie" && <Pie data={data} options={options} />}
        {type === "bar" && <Bar data={data} options={options} />}
        {type === "line" && <Line data={data} options={options} />}
      </div>
    </div>
  );
}
