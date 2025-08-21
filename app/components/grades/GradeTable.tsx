interface GradeTableProps {
  grades: Array<{
    id: string;
    score: number;
    date: Date | string;
    student: { firstName: string; lastName: string };
    course: { name: string };
  }>;
}

export function GradeTable({ grades }: GradeTableProps) {
  if (grades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No grades recorded</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add grades using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-4 border-b bg-muted p-4 font-medium">
        <div>Student</div>
        <div>Course</div>
        <div>Score</div>
        <div>Date</div>
      </div>
      <div className="divide-y">
        {grades.map((grade) => (
          <div key={grade.id} className="grid grid-cols-4 items-center p-4">
            <div>
              {grade.student.firstName} {grade.student.lastName}
            </div>
            <div>{grade.course.name}</div>
            <div>{grade.score.toFixed(1)}</div>
            <div>{new Date(grade.date).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
