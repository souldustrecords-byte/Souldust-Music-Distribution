# README
# Soul Dust Records Portal

This project is a production-oriented React portal for the Soul Dust Records label admin experience, built for GitHub Pages deployment.

## Features
- Login with the secure portal key: `SDR-001`
- Overview dashboard with release metrics
- Release catalogue and submission flow
- Platform profile management
- Performance links and label ops shortcuts
- GitHub Pages deployment configuration

## Local development
1. Install deps:
   npm install
2. Start the app:
   npm run dev
3. Build:
   npm run build

## GitHub Pages deployment
This repo includes a GitHub Actions workflow to automatically deploy the app from the `main` branch.

1. Push the repo to GitHub.
2. In GitHub, open Settings → Pages.
3. Select the GitHub Actions deployment source.
4. Push to `main` to trigger deployment.

## Submission email
For this static GitHub Pages deployment, the release form opens a pre-filled `mailto:` draft to:
`SOULDUSTRECORDS@GMAIL.COM`

This is the most reliable email-first behavior for a frontend-only deployment. For a production system, replace this with a server-side backend or API endpoint.

## Login key
`SDR-001`
