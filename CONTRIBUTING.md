# Contributing to FinSight AI

Thanks for taking the time to contribute!

## Before you start

- Check existing issues and pull requests to avoid duplicate work.
- For major feature changes, open an issue first to discuss the scope.
- Never commit API keys, database credentials, personal financial data, or real `.env` files.

## Local setup

1. Fork the repository and clone your fork.
2. Install server dependencies from `server/` with `npm install`.
3. Create `server/.env` using `server/.env.example` as a guide.
4. Install client dependencies from `client/` with `npm install`.
5. Run the server and client in separate terminals using their documented development scripts.

## Making a change

1. Create a focused branch, for example `fix/receipt-validation` or `docs/setup-guide`.
2. Keep changes scoped and preserve existing behavior unless the change intentionally modifies it.
3. Run the available checks before submitting. The client provides `npm run lint` and `npm run build`; run them from `client/`.
4. Do not claim tests passed unless you ran them.
5. Update documentation when setup steps, environment variables, or visible behavior changes.

## Pull requests

Include:
- A clear summary of what changed and why.
- Relevant screenshots for UI changes.
- Commands run and their results.
- Any migration, configuration, or security considerations.

Be respectful, constructive, and open to feedback.
