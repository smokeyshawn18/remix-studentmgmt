import { useEffect, useState } from "react";
import { ReportChart } from "./ReportChart";

interface GradeReport {
  grades: Array<{
    id: string;
    score: number;
    date: Date | string;
    student: { firstName: string; lastName: string };
    course: { name: string };
  }>;
  stats: {
    count: number;
    average: number;
    highest: number;
    lowest: number;
  };
  progressData?: Array<{ date: string; score: number }>;
}

interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

interface ReportDashboardProps {
  report: GradeReport;
  gradeDistribution: GradeDistribution;
  courseAverages: Array<{ id: string; name: string; averageScore: number }>;
}

export function ReportDashboard({
  report,
  gradeDistribution,
  courseAverages,
}: ReportDashboardProps) {
  const [showProgressChart, setShowProgressChart] = useState(false);

  useEffect(() => {
    setShowProgressChart(
      !!report.progressData && report.progressData.length > 1
    );
  }, [report.progressData]);

  // Prepare chart data for grade distribution
  const gradeDistData = {
    labels: ["A (90-100)", "B (80-89)", "C (70-79)", "D (60-69)", "F (<60)"],
    datasets: [
      {
        data: [
          gradeDistribution.A,
          gradeDistribution.B,
          gradeDistribution.C,
          gradeDistribution.D,
          gradeDistribution.F,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderColor: [
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
          "rgb(255, 159, 64)",
          "rgb(255, 99, 132)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for course averages
  const courseAvgData = {
    labels: courseAverages.map((course) => course.name),
    datasets: [
      {
        label: "Average Score",
        data: courseAverages.map((course) => course.averageScore),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare progress data if available
  const progressChartData = report.progressData
    ? {
        labels: report.progressData.map((item) => item.date),
        datasets: [
          {
            label: "Score Progress",
            data: report.progressData.map((item) => item.score),
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col items-center">
          <p className="text-sm font-medium text-muted-foreground">
            Total Grades
          </p>
          <h3 className="text-3xl font-bold">{report.stats.count}</h3>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col items-center">
          <p className="text-sm font-medium text-muted-foreground">
            Average Score
          </p>
          <h3 className="text-3xl font-bold">
            {report.stats.average.toFixed(1)}
          </h3>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col items-center">
          <p className="text-sm font-medium text-muted-foreground">
            Highest Score
          </p>
          <h3 className="text-3xl font-bold">{report.stats.highest}</h3>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex flex-col items-center">
          <p className="text-sm font-medium text-muted-foreground">
            Lowest Score
          </p>
          <h3 className="text-3xl font-bold">{report.stats.lowest}</h3>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ReportChart
          type="pie"
          title="Grade Distribution"
          data={gradeDistData}
          fileName="grade-distribution"
        />

        <ReportChart
          type="bar"
          title="Course Averages"
          data={courseAvgData}
          fileName="course-averages"
        />
      </div>

      {showProgressChart && progressChartData && (
        <ReportChart
          type="line"
          title="Student Progress"
          data={progressChartData}
          fileName="student-progress"
        />
      )}

      <div className="rounded-lg border shadow-sm">
        <div className="border-b bg-muted p-4">
          <h3 className="text-lg font-semibold">Report Grades</h3>
        </div>

        <div className="divide-y">
          {report.grades.length > 0 ? (
            <>
              <div className="grid grid-cols-4 border-b bg-muted p-4 font-medium">
                <div>Student</div>
                <div>Course</div>
                <div>Score</div>
                <div>Date</div>
              </div>

              {report.grades.map((grade) => (
                <div
                  key={grade.id}
                  className="grid grid-cols-4 items-center p-4"
                >
                  <div>
                    {grade.student.firstName} {grade.student.lastName}
                  </div>
                  <div>{grade.course.name}</div>
                  <div>{grade.score.toFixed(1)}</div>
                  <div>{new Date(grade.date).toLocaleDateString()}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-8 text-center">
              <p>No grades match the selected criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
