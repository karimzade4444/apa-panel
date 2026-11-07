This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project structure

- `src/app` contains routes and layouts. `(auth)` and `(dashboard)` are route groups and do not change public URLs.
- `src/features` contains business functionality, split into `api`, `model`, `ui`, and `lib`.
- `src/entities` contains core domain types and entity-level UI.
- `src/widgets` contains composed page sections and the dashboard shell.
- `src/shared` contains reusable API clients, UI primitives, and utilities.

Keep route files in `src/app` focused on composing feature and widget modules. Import shared code from `src/shared` and entity types from `src/entities`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The dashboard route is defined in `src/app/(dashboard)/page.tsx`; the login route is in `src/app/(auth)/login/page.tsx`.

The root layout and global styles are in `src/app/layout.tsx` and `src/app/globals.css`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
