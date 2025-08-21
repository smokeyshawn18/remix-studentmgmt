import { Form, Link, redirect, useNavigation } from "react-router";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/db.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const grade = formData.get("grade") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;

  if (!firstName || !lastName || !email) {
    return { error: "First name, last name, and email are required" };
  }

  await prisma.student.create({
    data: {
      firstName,
      lastName,
      email,
      grade,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    },
  });

  return redirect("/students");
}

export default function NewStudent() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <Link to="/students">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade/Class</Label>
              <Input id="grade" name="grade" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
            <Link to="/students">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
