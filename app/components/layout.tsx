import { Link, useNavigate } from "react-router";
import {
  Menu,
  X,
  Moon,
  Sun,
  User,
  BarChart3,
  Book,
  Users,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.ReactElement {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Login state stored in localStorage as username e.g. "admin"
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    setUser(storedUser);

    const handleStorage = () => {
      setUser(localStorage.getItem("username"));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isAdminLoggedIn = user === "admin";

  const navigationItems = [
    {
      href: "/students",
      label: "Students",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      href: "/courses",
      label: "Courses",
      icon: <Book className="h-4 w-4 mr-2" />,
    },
    {
      href: "/attendance",
      label: "Attendance",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      href: "/grades",
      label: "Grades",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    },
    isAdminLoggedIn
      ? {
          href: "/logout",
          label: "Logout",
          icon: <User className="h-4 w-4 mr-2" />,
        }
      : {
          href: "/login",
          label: "Login",
          icon: <User className="h-4 w-4 mr-2" />,
        },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              className="h-8 w-8"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Logo */}
          <div className="flex">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-base lg:text-lg hidden sm:inline-block">
                Student Management System
              </span>
              <span className="font-bold text-lg sm:hidden">SMS</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6 text-xs lg:text-sm font-medium">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <nav className="flex flex-col p-4 space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center py-2 text-sm text-foreground/80 hover:text-foreground"
                onClick={toggleMobileMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1">
        <div className="container py-4 sm:py-6 px-4 md:px-6">{children}</div>
      </main>

      <footer className="border-t py-4 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-center md:text-left px-4 md:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Student Management System. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">GitHub</span>
              <User className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">Twitter</span>
              <User className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
