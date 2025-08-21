import { useState, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import { Layout } from "~/components/layout";
import { prisma } from "~/lib/db.server";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { GradeForm } from "~/components/grades/GradeForm";
import { ReportForm } from "~/components/grades/ReportForm";
import { GradeTable } from "~/components/grades/GradeTable";
import { ReportDashboard } from "~/components/grades/ReportDashboard";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export async function loader() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: "asc" },
  });

  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
  });

  const grades = await prisma.grade.findMany({
    include: {
      student: true,
      course: true,
    },
    orderBy: { date: "desc" },
  });

  // Calculate average grade per course for charts
  const courseAverages = (await prisma.$queryRaw`
    SELECT c.id, c.name, AVG(g.score) as "averageScore"
    FROM "courses" c
    JOIN "grades" g ON c.id = g."courseId"
    GROUP BY c.id, c.name
    ORDER BY c.name
  `) as Array<{ id: string; name: string; averageScore: number }>;

  // Calculate average grade per student
  const studentAverages = (await prisma.$queryRaw`
    SELECT s.id, s."firstName", s."lastName", AVG(g.score) as "averageScore"
    FROM "students" s
    JOIN "grades" g ON s.id = g."studentId"
    GROUP BY s.id, s."firstName", s."lastName"
    ORDER BY s."lastName", s."firstName"
  `) as Array<{
    id: string;
    firstName: string;
    lastName: string;
    averageScore: number;
  }>;

  // Get grade distribution (how many A's, B's, etc.)
  const gradeDistribution = {
    A: 0, // 90-100
    B: 0, // 80-89
    C: 0, // 70-79
    D: 0, // 60-69
    F: 0, // Below 60
  };

  grades.forEach((grade) => {
    if (grade.score >= 90) gradeDistribution.A++;
    else if (grade.score >= 80) gradeDistribution.B++;
    else if (grade.score >= 70) gradeDistribution.C++;
    else if (grade.score >= 60) gradeDistribution.D++;
    else gradeDistribution.F++;
  });

  return {
    students,
    courses,
    grades,
    courseAverages,
    studentAverages,
    gradeDistribution,
  };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "add-grade") {
    const studentId = formData.get("studentId") as string;
    const courseId = formData.get("courseId") as string;
    const score = parseFloat(formData.get("score") as string);

    if (!studentId || !courseId || isNaN(score)) {
      return { error: "All fields are required", type: "add" };
    }

    // Check if grade already exists and update instead of creating
    const existingGrade = await prisma.grade.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingGrade) {
      await prisma.grade.update({
        where: { id: existingGrade.id },
        data: { score },
      });

      return {
        success: "Grade updated successfully",
        type: "add",
      };
    } else {
      await prisma.grade.create({
        data: {
          studentId,
          courseId,
          score,
        },
      });

      return {
        success: "Grade added successfully",
        type: "add",
      };
    }
  } else if (action === "generate-report") {
    const studentId = formData.get("reportStudentId") as string;
    const courseId = formData.get("reportCourseId") as string;

    let filters = {};

    if (studentId) {
      filters = { ...filters, studentId };
    }

    if (courseId) {
      filters = { ...filters, courseId };
    }

    const reportGrades = await prisma.grade.findMany({
      where: filters,
      include: {
        student: true,
        course: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate statistics for the report
    let totalScore = 0;
    let highestScore = 0;
    let lowestScore = 100;

    reportGrades.forEach((grade) => {
      totalScore += grade.score;
      if (grade.score > highestScore) highestScore = grade.score;
      if (grade.score < lowestScore) lowestScore = grade.score;
    });

    const averageScore =
      reportGrades.length > 0 ? totalScore / reportGrades.length : 0;

    // For line chart - track progress over time if a single student and course are selected
    let progressData = null;
    if (studentId && courseId) {
      const studentProgressGrades = await prisma.grade.findMany({
        where: {
          studentId,
          courseId,
        },
        orderBy: { date: "asc" },
      });

      progressData = studentProgressGrades.map((grade) => ({
        date: new Date(grade.date).toLocaleDateString(),
        score: grade.score,
      }));
    }

    return {
      report: {
        grades: reportGrades,
        stats: {
          count: reportGrades.length,
          average: averageScore,
          highest: highestScore,
          lowest: lowestScore,
        },
        progressData,
      },
      success: "Report generated successfully",
      type: "report",
    };
  }

  return null;
}

export default function Grades() {
  const {
    students,
    courses,
    grades,
    courseAverages,
    studentAverages,
    gradeDistribution,
  } = useLoaderData<typeof loader>();

  const actionData = useActionData<any>();
  const [showReport, setShowReport] = useState(false);

  // Set state based on action data
  useEffect(() => {
    if (actionData?.type === "report" && actionData?.success) {
      setShowReport(true);
    } else if (actionData?.type === "add") {
      setShowReport(false);
    }
  }, [actionData]);

  return (
    <Layout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and view student grades
        </p>
      </div>

      {/* Notification for success or error */}
      {actionData?.success && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionData.success}</AlertDescription>
        </Alert>
      )}

      {actionData?.error && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{actionData.error}</AlertDescription>
        </Alert>
      )}

      {/* Grade Management Section */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <GradeForm students={students} courses={courses} />
        <ReportForm students={students} courses={courses} />
      </div>

      {/* Report Dashboard */}
      {showReport && actionData?.report && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Grade Report</h2>
          <ReportDashboard
            report={actionData.report}
            gradeDistribution={gradeDistribution}
            courseAverages={courseAverages}
          />
        </div>
      )}

      {/* Grade Overview Table */}
      {!showReport && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Grade Overview</h2>
          <GradeTable grades={grades} />
        </div>
      )}
    </Layout>
  );
}
