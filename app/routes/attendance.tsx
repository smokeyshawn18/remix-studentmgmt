import { useState, useRef } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/db.server";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { toPng } from "html-to-image";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export async function loader() {
  // Get today's date (without time component)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch students from the database
  const students = await prisma.student.findMany({
    orderBy: { firstName: "asc" },
    include: {
      attendance: {
        where: {
          date: today,
        },
      },
    },
  });

  // Fetch all attendance records for today
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: today,
    },
    include: {
      student: true,
    },
  });

  // Get attendance stats for the last 7 days for the chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const lastWeekAttendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    include: {
      student: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Calculate attendance by day for the chart
  const attendanceByDay: Record<string, { present: number; absent: number }> =
    {};

  // Initialize with all 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    attendanceByDay[dateString] = { present: 0, absent: 0 };
  }

  // Fill in the actual data
  lastWeekAttendance.forEach((record) => {
    const dateString = new Date(record.date).toISOString().split("T")[0];
    if (!attendanceByDay[dateString]) {
      attendanceByDay[dateString] = { present: 0, absent: 0 };
    }

    if (record.present) {
      attendanceByDay[dateString].present += 1;
    } else {
      attendanceByDay[dateString].absent += 1;
    }
  });

  return {
    students,
    attendance: todayAttendance,
    weeklyAttendance: attendanceByDay,
  };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "mark") {
    const studentId = formData.get("studentId") as string;

    // Get the status for this specific student
    // The name format is status-{studentId}
    const statusKey = Array.from(formData.keys()).find(
      (key) => key.startsWith("status-") && key.includes(studentId)
    );

    let status = "present"; // Default value
    if (statusKey) {
      status = formData.get(statusKey) as string;
    }

    console.log(`Marking student ${studentId} as ${status}`);

    // In a real app, you would save this to the database
    try {
      // Check if the student exists first
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        console.error(`Student with ID ${studentId} not found`);
        return { error: "Student not found" };
      }

      // Convert status string to boolean for the present field
      const isPresent = status === "present";

      // Create or update the attendance record
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day

      const attendanceRecord = await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: today,
          },
        },
        update: {
          present: isPresent,
        },
        create: {
          studentId,
          date: today,
          present: isPresent,
        },
      });

      return {
        success: `Marked ${student.firstName} ${student.lastName} as ${isPresent ? "present" : "absent"}`,
        studentId,
      };
    } catch (error) {
      console.error("Error marking attendance:", error);
      return { error: "Failed to mark attendance" };
    }
  } else if (action === "generate-report") {
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!startDate || !endDate) {
      return { error: "Start and end dates are required for the report" };
    }

    try {
      // Convert string dates to Date objects
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Fetch attendance records for the date range
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          student: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      // Calculate attendance statistics by date
      const dateStats: Record<
        string,
        { present: number; absent: number; total: number }
      > = {};

      attendanceRecords.forEach((record) => {
        const dateString = new Date(record.date).toISOString().split("T")[0];
        if (!dateStats[dateString]) {
          dateStats[dateString] = { present: 0, absent: 0, total: 0 };
        }

        dateStats[dateString].total++;
        if (record.present) {
          dateStats[dateString].present++;
        } else {
          dateStats[dateString].absent++;
        }
      });

      // Return the records to be displayed along with statistics
      return {
        report: {
          startDate,
          endDate,
          records: attendanceRecords,
          dateStats,
        },
      };
    } catch (error) {
      console.error("Error generating attendance report:", error);
      return { error: "Failed to generate attendance report" };
    }
  } else if (action === "mark-bulk") {
    const date = formData.get("bulkDate") as string;
    const statusAll = formData.get("statusAll") as string;

    if (!date) {
      return { error: "Date is required for bulk attendance marking" };
    }

    try {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      // Get all students
      const students = await prisma.student.findMany();

      // Set attendance for all students
      const isPresent = statusAll === "present";

      // Create array of operations to perform
      const operations = students.map((student) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: student.id,
              date: selectedDate,
            },
          },
          update: {
            present: isPresent,
          },
          create: {
            studentId: student.id,
            date: selectedDate,
            present: isPresent,
          },
        })
      );

      // Execute all operations
      await Promise.all(operations);

      return {
        success: `Marked all ${students.length} students as ${isPresent ? "present" : "absent"} for ${date}`,
      };
    } catch (error) {
      console.error("Error marking bulk attendance:", error);
      return { error: "Failed to mark bulk attendance" };
    }
  }

  return null;
}

export default function Attendance() {
  const { students, attendance, weeklyAttendance } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<{
    error?: string;
    success?: string;
    report?: {
      startDate: string;
      endDate: string;
      records: Array<{
        id: string;
        date: string;
        present: boolean;
        student: {
          id: string;
          firstName: string;
          lastName: string;
        };
      }>;
      dateStats: Record<
        string,
        { present: number; absent: number; total: number }
      >;
    };
  }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Create refs for the charts
  const todayChartRef = useRef<HTMLDivElement>(null);
  const weeklyChartRef = useRef<HTMLDivElement>(null);
  const reportChartRef = useRef<HTMLDivElement>(null);
  const reportTableRef = useRef<HTMLDivElement>(null);

  // Group report records by date for easier display
  const reportByDate =
    actionData?.report?.records?.reduce(
      (acc, record) => {
        const date = new Date(record.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      },
      {} as Record<string, typeof actionData.report.records>
    ) || {};

  // Functions to download charts as images
  const downloadChart = (
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    if (ref.current) {
      toPng(ref.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = filename;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const downloadTodayChart = () => {
    if (todayChartRef.current) {
      toPng(todayChartRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "today-attendance.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const downloadWeeklyChart = () => {
    if (weeklyChartRef.current) {
      toPng(weeklyChartRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "weekly-attendance.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const downloadReportChart = () => {
    if (reportChartRef.current) {
      toPng(reportChartRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "attendance-report-chart.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const downloadReportTable = () => {
    if (reportTableRef.current) {
      toPng(reportTableRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "attendance-report-table.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  // Prepare chart data for today's attendance
  const todayChartData = {
    labels: ["Present", "Absent", "Not Marked"],
    datasets: [
      {
        data: [
          attendance.filter((record) => record.present).length,
          attendance.filter((record) => !record.present).length,
          students.length - attendance.length,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(201, 203, 207, 0.7)",
        ],
        borderColor: [
          "rgb(75, 192, 192)",
          "rgb(255, 99, 132)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for weekly attendance
  const weeklyChartData = {
    labels: Object.keys(weeklyAttendance).sort(),
    datasets: [
      {
        label: "Present",
        data: Object.keys(weeklyAttendance)
          .sort()
          .map((date) => weeklyAttendance[date].present),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
      {
        label: "Absent",
        data: Object.keys(weeklyAttendance)
          .sort()
          .map((date) => weeklyAttendance[date].absent),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for the report
  const reportChartData = actionData?.report
    ? {
        labels: Object.keys(actionData?.report?.dateStats || {}).sort(),
        datasets: [
          {
            label: "Present",
            data: Object.keys(actionData?.report?.dateStats || {})
              .sort()
              .map((date) => {
                return actionData?.report?.dateStats?.[date]?.present || 0;
              }),
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
          {
            label: "Absent",
            data: Object.keys(actionData?.report?.dateStats || {})
              .sort()
              .map((date) => {
                return actionData?.report?.dateStats?.[date]?.absent || 0;
              }),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <Layout>
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Attendance
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
          Track and manage student attendance
        </p>
      </div>

      {actionData?.success && (
        <Alert className="mt-4 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>{actionData.success}</AlertDescription>
        </Alert>
      )}

      {actionData?.error && (
        <Alert className="mt-4" variant="destructive">
          <AlertDescription>{actionData.error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">
            Take Attendance
          </h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Mark attendance for a specific date
          </p>

          <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-xs sm:text-sm">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs sm:text-sm"
              />
            </div>

            <Button className="h-9 text-xs sm:text-sm">Mark Attendance</Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">
            Attendance Report
          </h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            View attendance records for a specific period
          </p>

          <Form method="post" className="mt-3 sm:mt-4 grid gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate" className="text-xs sm:text-sm">
                From
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                className="h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate" className="text-xs sm:text-sm">
                To
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              name="action"
              value="generate-report"
              className="h-9 text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate Report"}
            </Button>
          </Form>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">
            Bulk Attendance
          </h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Mark all students at once
          </p>

          <Form method="post" className="mt-3 sm:mt-4 grid gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bulkDate" className="text-xs sm:text-sm">
                Date
              </Label>
              <Input
                id="bulkDate"
                name="bulkDate"
                type="date"
                className="h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="statusAll" className="text-xs sm:text-sm">
                Status
              </Label>
              <select
                id="statusAll"
                name="statusAll"
                className="rounded-md border bg-background px-3 py-1.5 text-xs sm:text-sm w-full"
                defaultValue="present"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <Button
              type="submit"
              name="action"
              value="mark-bulk"
              className="h-9 text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Marking..." : "Mark All Students"}
            </Button>
          </Form>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Today's Attendance Chart */}
        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">
              Today's Attendance
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTodayChart}
              className="h-8 text-xs"
            >
              Download Chart
            </Button>
          </div>

          <div className="mt-4" ref={todayChartRef}>
            <div className="bg-white p-4 rounded-md">
              <h4 className="text-center font-semibold mb-4">
                Today's Attendance - {new Date().toLocaleDateString()}
              </h4>
              <div className="h-64">
                <Pie
                  data={todayChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Total Students:</span>
                  <span className="font-medium">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Present:</span>
                  <span className="font-medium">
                    {attendance.filter((record) => record.present).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Absent:</span>
                  <span className="font-medium">
                    {attendance.filter((record) => !record.present).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance Rate:</span>
                  <span className="font-medium">
                    {students.length > 0
                      ? Math.round(
                          (attendance.filter((record) => record.present)
                            .length /
                            students.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Attendance Chart */}
        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">
              Weekly Attendance
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadWeeklyChart}
              className="h-8 text-xs"
            >
              Download Chart
            </Button>
          </div>

          <div className="mt-4" ref={weeklyChartRef}>
            <div className="bg-white p-4 rounded-md">
              <h4 className="text-center font-semibold mb-4">
                Weekly Attendance Trends
              </h4>
              <div className="h-64">
                <Bar
                  data={weeklyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                    scales: {
                      x: {
                        stacked: false,
                      },
                      y: {
                        stacked: false,
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-semibold">Today's Attendance</h2>

        <div className="mt-3 sm:mt-4">
          {students.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
              <div className="grid grid-cols-3 items-center p-4 border-b bg-muted">
                <div className="text-xs font-medium text-muted-foreground">
                  Student Name
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Status
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Action
                </div>
              </div>
              {students.map((student) => {
                // Find attendance record for this student
                const attendanceRecord = attendance.find(
                  (record) => record.studentId === student.id
                );

                // Determine status based on attendance record
                const currentStatus = attendanceRecord
                  ? attendanceRecord.present
                    ? "present"
                    : "absent"
                  : "";

                return (
                  <Form
                    key={student.id}
                    method="post"
                    className="border-b last:border-b-0"
                  >
                    <div className="grid grid-cols-3 items-center p-4">
                      <div className="text-xs sm:text-sm">
                        {student.firstName} {student.lastName}
                        {attendanceRecord && (
                          <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                            {attendanceRecord.present ? (
                              <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Present
                              </span>
                            ) : (
                              <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                Absent
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <div>
                        <select
                          name={`status-${student.id}`}
                          className="rounded-md border bg-background px-2 py-1 text-xs sm:text-sm w-full max-w-[150px]"
                          defaultValue={currentStatus || "present"}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="hidden"
                          name="studentId"
                          value={student.id}
                        />
                        <Button
                          type="submit"
                          name="action"
                          value="mark"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Saving..." : "Mark"}
                        </Button>
                      </div>
                    </div>
                  </Form>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 sm:p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-muted-foreground mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold">
                No students available
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
                Add students in the Students section first to mark attendance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Report Results */}
      {actionData?.report && (
        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold">
              Attendance Report:{" "}
              {new Date(actionData.report.startDate).toLocaleDateString()} -{" "}
              {new Date(actionData.report.endDate).toLocaleDateString()}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReportChart}
                className="h-8 text-xs"
              >
                Download Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReportTable}
                className="h-8 text-xs"
              >
                Download Table
              </Button>
            </div>
          </div>

          {/* Report Chart */}
          {reportChartData && (
            <div
              className="mt-4 rounded-lg border bg-card p-4 sm:p-6 shadow-sm"
              ref={reportChartRef}
            >
              <div className="bg-white p-4 rounded-md">
                <h3 className="text-center font-semibold mb-4">
                  Attendance Report:{" "}
                  {new Date(actionData.report.startDate).toLocaleDateString()} -{" "}
                  {new Date(actionData.report.endDate).toLocaleDateString()}
                </h3>
                <div className="h-64">
                  <Bar
                    data={reportChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        title: {
                          display: true,
                          text: "Attendance by Date",
                        },
                      },
                      scales: {
                        x: {
                          stacked: false,
                        },
                        y: {
                          stacked: false,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Report Table */}
          <div className="mt-4" ref={reportTableRef}>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-center font-semibold mb-4">
                Attendance Report:{" "}
                {new Date(actionData.report.startDate).toLocaleDateString()} -{" "}
                {new Date(actionData.report.endDate).toLocaleDateString()}
              </h3>
              <div className="mt-3 sm:mt-4">
                {Object.keys(reportByDate).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(reportByDate).map(([date, records]) => (
                      <div
                        key={date}
                        className="rounded-lg border overflow-hidden"
                      >
                        <div className="bg-muted p-3 border-b">
                          <h3 className="font-medium">{date}</h3>
                        </div>
                        <div className="p-0">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                  Student Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {records.map((record) => (
                                <tr key={record.id}>
                                  <td className="px-4 py-2 text-xs sm:text-sm">
                                    {record.student.firstName}{" "}
                                    {record.student.lastName}
                                  </td>
                                  <td className="px-4 py-2">
                                    {record.present ? (
                                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        Present
                                      </span>
                                    ) : (
                                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                        Absent
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Report Summary */}
                    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Report Summary
                      </h3>
                      <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span>Total Days:</span>
                          <span className="font-medium">
                            {Object.keys(reportByDate).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Records:</span>
                          <span className="font-medium">
                            {actionData.report.records.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Present:</span>
                          <span className="font-medium">
                            {
                              actionData.report.records.filter((r) => r.present)
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Absent:</span>
                          <span className="font-medium">
                            {
                              actionData.report.records.filter(
                                (r) => !r.present
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attendance Rate:</span>
                          <span className="font-medium">
                            {actionData.report.records.length > 0
                              ? Math.round(
                                  (actionData.report.records.filter(
                                    (r) => r.present
                                  ).length /
                                    actionData.report.records.length) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 sm:p-8 text-center">
                    <h3 className="text-base sm:text-lg font-semibold">
                      No attendance records found
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
                      No attendance records were found for the selected date
                      range.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
