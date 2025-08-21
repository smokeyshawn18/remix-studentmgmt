import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("home", "routes/home.tsx"),
  route("students", "routes/students.tsx"),
  route("students/new", "routes/students.new.tsx"),
  route("courses", "routes/courses.tsx"),
  route("courses/new", "routes/courses.new.tsx"),
  route("attendance", "routes/attendance.tsx"),
  route("grades", "routes/grades.tsx"),
  route("/login", "routes/login.tsx"),
  route("/logout", "routes/logout.tsx"),
] satisfies RouteConfig;
