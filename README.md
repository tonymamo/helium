# Localization Management

## Walkthrough of changes

The app is deployed at https://helium-localization.fly.dev/

### Some notes in no particular order:

- I fought with trying to get it deployed on Vercel, as I've never hosted a Python/FastAPI server on Vercel before and ended up moving it into a separate `backend/` directory and then using Fly.io to deploy two separate apps, one for the frontend and one for the backend. I've never used Fly.io before, but it was pretty simple to do. I've deployed plenty of frontends to Vercel in the past, and even more with Netlify. I tried to have Cursor/Claude help me out with the Vercel stuff but it just kept hallucinating and trying to change dependencies.
- I built out the table with `@tanstack/react-table` before I thought to bring in shadcn/ui, which also has a Table component that wraps the same library.
- For the frontend tests, I wanted to test some of the different states to make sure the UI looks how I expect in different scenarios, which I like to do so I can move quickly and notice when something breaks.
- If I had more time, I would have set up Github Actions that run the tests and if successful, deploy the app as a quick and dirty CI/CD.
- NPM (and others!) had a huge outage on Thursday June 12th when I got started but luckily was able to come back to it later 🙂
- There was no database schema or Supabase setup provided as mentioned in the Notion doc, but I just took some educated guesses as to what it all should look like. I put the sequel schemas in a file in the root that I used to generate the tables in Supabase.
- My commit history wasn't as clean as I'd normally do, since I was popping in and out on this over the course of the day in between other meetings I had.
- I've never used FastAPI before, but it's pretty nice from what I can tell so far!
- I used the localStorage persistence option with Zustand to persist project/locale selection just for fun, to persist between refreshes
- If I had more time, I would probably handle the left nav a bit differently, and use actual pages/routes instead of just being all mounted on `/` route, which would then be easier to use `params` from Next
- I added a translation validation endpoint which just logs to the console for now, used with the Validate button at the top right.
- I ran out of time setting up the backend tests
- I didn't worry about any sort of SSG/SSR since this sounds like it would be in internal-facing tool, and also not a lot of responsive design in the interest of time

## Testing

### Frontend Testing (E2E)

I used Playwright for end-to-end testing of the frontend application. The tests are located in the `e2e/` directory and cover critical user flows:

- Basic page rendering and title verification
- Header and logo presence
- Loading states for projects and languages
- Project and language selection functionality
- Translation management area visibility
- Search functionality
- Placeholder states and user guidance
- UI component visibility and interaction

To run the frontend tests:

```bash
# Install Playwright browsers
npx playwright install

# Run the tests with the UI
npx playwright test -- --ui
# or via command line only
npm run test:e2e
```

The tests are designed to be:

- **Repeatable**: Each test can be run multiple times with the same results
- **Independent**: Tests don't depend on each other's state
- **Fast**: Tests run quickly to enable rapid development
- **Clear**: Test failures provide clear information about what went wrong

### Backend Testing

I was going to set up pytest for the backend but ran out of time. Some things I would test would include:

- API endpoint validation
- Data persistence and retrieval
- Error handling
- atomic database operations

## API Setup

This is a FastAPI application to manage localizations.

1.  Create a virtual environment (optional but recommended):

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the API server

```bash
# uvicorn src.localization_management_api.main:app --reload
cd backend && uvicorn index:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Example Usage

To get localizations for a project, you can access:
`http://127.0.0.1:8000/localizations/your_project_id/en_US`

---

## Frontend Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
