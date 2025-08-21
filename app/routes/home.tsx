import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Layout } from "~/components/layout";
import type { LoaderFunction } from "react-router";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return JSON.stringify({ message: "Welcome to protected home page!" });
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Student Management System" },
    {
      name: "description",
      content: "A comprehensive student management system",
    },
  ];
}
export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Student Management System
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground text-sm sm:text-base md:text-xl sm:leading-8">
          A comprehensive solution for managing students, courses, attendance,
          and grades.
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link
            to="/students"
            className="inline-flex h-9 sm:h-10 items-center justify-center rounded-md bg-primary px-4 sm:px-8 text-xs sm:text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Manage Students
          </Link>
          <Link
            to="/courses"
            className="inline-flex h-9 sm:h-10 items-center justify-center rounded-md border border-input bg-background px-4 sm:px-8 text-xs sm:text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            View Courses
          </Link>
        </div>
      </div>

      <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Students</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Manage all your students in one place. Add new students, update
            their information, and track their progress.
          </p>
          <Link
            to="/students"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Students
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Courses</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Organize your courses and curriculum. Create new courses, assign
            students, and manage course materials.
          </p>
          <Link
            to="/courses"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Courses
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Attendance</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Track student attendance easily. Mark present/absent status and
            generate attendance reports.
          </p>
          <Link
            to="/attendance"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Attendance
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Grades</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Manage student grades for all courses. Input grades, calculate
            averages, and generate grade reports.
          </p>
          <Link
            to="/grades"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Grades
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Reports</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Generate and view various reports about students, courses,
            attendance, and grades.
          </p>
          <Link
            to="/reports"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Reports
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold">Settings</h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Configure your system settings, user permissions, and notification
            preferences.
          </p>
          <Link
            to="/settings"
            className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-primary"
          >
            View Settings
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
