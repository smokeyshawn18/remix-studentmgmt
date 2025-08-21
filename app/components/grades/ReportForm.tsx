import { useState } from "react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface ReportFormProps {
  students: Array<{ id: string; firstName: string; lastName: string }>;
  courses: Array<{ id: string; name: string }>;
}

export function ReportForm({ students, courses }: ReportFormProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Grade Report</h3>

      <Form method="post" className="mt-4 space-y-4">
        <input type="hidden" name="action" value="generate-report" />

        <div className="grid gap-2">
          <Label htmlFor="reportStudentId">Student</Label>
          <select
            id="reportStudentId"
            name="reportStudentId"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">All students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reportCourseId">Course</Label>
          <select
            id="reportCourseId"
            name="reportCourseId"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Generate Report</Button>
      </Form>
    </div>
  );
}
