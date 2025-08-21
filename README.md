# Student Management System

A comprehensive student management system built with Remix, React, Neon Postgres, Prisma, Tailwind CSS, and Shadcn UI.

## Features

- User authentication (login/register)
- Student management (add, edit, delete, view)
- Course management (add, edit, delete, view)
- Attendance tracking
- Grade management
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Remix, Node.js
- **Database**: Neon Postgres
- **ORM**: Prisma
- **Authentication**: Custom authentication with sessions

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Neon Postgres database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/studentmgmt.git
cd studentmgmt
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by creating a `.env` file in the root directory:

```
DATABASE_URL="postgresql://username:password@your-neon-db-host.neon.tech/studentmgmt?sslmode=require"
DIRECT_URL="postgresql://username:password@your-neon-db-host.neon.tech/studentmgmt?sslmode=require"
SESSION_SECRET="your-secure-session-secret"
```

4. Initialize the database:

```bash
npx prisma db push
```

5. Seed the database (optional):

```bash
npx prisma db seed
```

### Running the Application

To run the application in development mode:

```bash
npm run dev
```

To build and run in production mode:

```bash
npm run build
npm run start
```

## Project Structure

```
studentmgmt/
├── app/                  # Application code
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn UI components
│   │   └── layout.tsx    # Layout component
│   ├── lib/              # Utility functions
│   │   ├── auth.server.ts       # Authentication utilities
│   │   ├── db.server.ts         # Database client
│   │   ├── session.server.ts    # Session management
│   │   └── utils.ts             # General utilities
│   └── routes/           # Route components
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── sessions/             # Session storage
```

## Deployment

This application can be deployed to various platforms:

- Vercel
- Netlify
- Fly.io
- Render
- Railway

Make sure to set up the environment variables in your deployment platform.

## Database Setup with Neon Postgres

1. Create an account at [Neon](https://neon.tech/)
2. Create a new project
3. Create a new database named "studentmgmt"
4. Get the connection string from the dashboard
5. Update your `.env` file with the connection string

## License

MIT

## Acknowledgements

- [Remix](https://remix.run/)
- [React Router](https://reactrouter.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Neon Postgres](https://neon.tech/)
