# Contributing

Follow the development instructions in the README. Use your own Convex development deployment or a local backend. Production credentials are not needed for the test suite or a build.

Before opening a pull request:

- Run `npm run check` with Node.js 24.
- Explain the problem and resulting behavior. Include a reproduction or screenshot when it helps.
- Add a regression test when changing data processing, backend access, or failure handling.
- Cite the official source when changing series IDs, units, adjustment methods, or population definitions.
- Keep unrelated formatting and refactoring out of the change.

Use clear names and comments for non-obvious constraints. Keep credentials, personal environment files, generated build output, and raw downloaded datasets out of commits. Convex-generated API types should be committed when they change.

The codebase follows its existing TypeScript, React, and Convex conventions. Shared ingestion functions should be exercised by tests and called by the scheduled actions, so tests cover the same behavior that runs in production.

Useful follow-up work includes a representative labeled evaluation of the keyword matcher, additional verified BLS series, data exports, and accessibility testing. Start with a small issue describing the proposed behavior and how it would be verified.
