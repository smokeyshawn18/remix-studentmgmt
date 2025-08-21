import { Link, useLoaderData } from "react-router";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/db.server";
import { BillingType } from "@prisma/client";

export async function loader() {
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: {
      students: true,
    },
  });

  return { courses };
}

export default function Courses() {
  const { courses } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Courses
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your courses and curriculum
          </p>
        </div>
        <Link to="/courses/new">
          <Button className="h-9 text-xs sm:text-sm">Add Course</Button>
        </Link>
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex w-full sm:max-w-sm items-center gap-2">
            <div className="relative w-full">
              <Input
                placeholder="Search courses..."
                className="max-w-full h-9 text-xs sm:text-sm"
              />
            </div>
            <Button variant="secondary" className="h-9 text-xs">
              Search
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="sort" className="text-xs hidden sm:inline-block">
              Sort by:
            </Label>
            <select
              id="sort"
              className="rounded-md border bg-background px-2 sm:px-3 py-1 text-xs sm:text-sm h-9"
            >
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="dateDesc">Start Date (Newest)</option>
              <option value="dateAsc">Start Date (Oldest)</option>
            </select>
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-full sm:w-auto">
                      Course Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      Students
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map((course) => (
                    <tr key={course.id} className="bg-card">
                      <td className="px-4 py-3 text-xs sm:text-sm">
                        <div>
                          <div>{course.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                            {new Date(course.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">
                        {new Date(course.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm hidden md:table-cell">
                        {course.endDate
                          ? new Date(course.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm hidden md:table-cell">
                        {course.price
                          ? `${course.price} ${course.currency}`
                          : "Free"}
                        {course.billingType &&
                          course.billingType !== BillingType.ONE_TIME && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (
                              {course.billingType === BillingType.MONTHLY
                                ? "Monthly"
                                : course.billingType === BillingType.QUARTERLY
                                  ? "Quarterly"
                                  : "Yearly"}
                              )
                            </span>
                          )}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">
                        {course.students.length}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-1">
                          <Link to={`/courses/${course.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              View
                            </Button>
                          </Link>
                          <Link
                            to={`/courses/${course.id}/edit`}
                            className="hidden sm:block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 sm:p-8 text-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 mb-3 sm:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold">
              No courses found
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
              Get started by adding a new course to your curriculum.
            </p>
            <Link to="/courses/new" className="mt-4">
              <Button className="h-9 text-xs sm:text-sm">Add Course</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
