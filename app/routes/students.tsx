import { Link, useLoaderData } from "react-router";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { prisma } from "~/lib/db.server";
import { Eye, MoreVertical, Pencil, Search, UserPlus } from "lucide-react";

export async function loader() {
  const students = await prisma.student.findMany({
    orderBy: { firstName: "asc" },
  });

  return { students };
}

export default function Students() {
  const { students } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Students
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your student records and information
          </p>
        </div>
        <Link to="/students/new">
          <Button className="flex items-center gap-2 h-9 text-xs sm:text-sm">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      <Card className="mt-4 sm:mt-6">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto flex items-center space-x-2">
              <div className="relative w-full sm:w-[250px] md:w-[300px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 h-9 text-xs sm:text-sm"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:flex h-9 text-xs"
              >
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="sort" className="hidden sm:inline-block text-xs">
                Sort by:
              </Label>
              <Select defaultValue="nameAsc">
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                  <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                  <SelectItem value="dateDesc">Date Added (Newest)</SelectItem>
                  <SelectItem value="dateAsc">Date Added (Oldest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] sm:w-[250px] text-xs sm:text-sm">
                        Name
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">
                        Email
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">
                        Grade
                      </TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">
                        Enrolled Date
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex flex-col">
                            <span>
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="md:hidden text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                              {student.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                          {student.email}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                          {student.grade ? (
                            <Badge variant="outline" className="text-xs">
                              {student.grade}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <div className="hidden sm:flex space-x-1">
                              <Link to={`/students/${student.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </Link>
                              <Link to={`/students/${student.id}/edit`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </Link>
                            </div>

                            <div className="sm:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="text-xs"
                                >
                                  <Link to={`/students/${student.id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-3.5 w-3.5" />
                                      View
                                    </DropdownMenuItem>
                                  </Link>
                                  <Link to={`/students/${student.id}/edit`}>
                                    <DropdownMenuItem>
                                      <Pencil className="mr-2 h-3.5 w-3.5" />
                                      Edit
                                    </DropdownMenuItem>
                                  </Link>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 sm:p-8 text-center">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 mb-3 sm:mb-4">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">
                No students found
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm">
                Get started by adding a new student to your management system.
              </p>
              <Link to="/students/new" className="mt-4">
                <Button className="h-9 text-xs sm:text-sm">Add Student</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
