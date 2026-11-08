This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project structure

- `src/app` contains only Next.js routes, layouts, providers, and global styles; route pages delegate to components.
- `src/api` contains the HTTP client and backend requests.
- `src/components` groups UI by purpose: reusable primitives in `ui`, and application sections in `auth`, `users`, `dashboard`, and `layout`.
- `src/hooks` contains reusable React hooks.
- `src/lib` contains utilities and browser helpers.
- `src/types` contains shared TypeScript types.
- `src/validations` contains request and form schemas.

Use the `@/` alias for imports from `src`; keep route files small and avoid duplicate routes outside `(auth)` and `(dashboard)`.

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
