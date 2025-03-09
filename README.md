# CS50 Project 5 - Final Project

Final project for CS50's Web Programming with Python and JavaScript course. This is a Next.js-based application optimized for deployment on Cloudflare services, including Cloudflare Pages, Cloudflare D1, and Cloudflare R2. The application allows users to listen to audiobooks shared by others, upload their own audiobook recordings in `.mp3` format, or generate audiobooks using AI.

## Demo

**Demo site:** [https://cs50-final-project.niezleziolko.app](https://cs50-final.niezleziolko.app)

**A short video where I go through the required specifications of the project:** [https://youtu.be/-lCgQ6-MzIw](https://youtu.be/-lCgQ6-MzIw)

---

## Project Features

### 1. **User Authentication**
- Users can create an account, log in, and manage their profile.
- Profile settings (available on `/auth/my-account`) include:
  - Updating profile picture.
  - Changing email address.
  - Resetting password.

### 2. **Audiobook Library**
- The `/auth/library` page displays all available audiobooks.
- Users can listen, browse and search audiobooks.
- Clicking on an audiobook redirects to `/auth/library/{book-id}`, where users can view details about the audiobook and listen to it.

### 3. **Favorites System**
- Users can add or remove books from their favorites using the `/api/auth/like` endpoint.

### 4. **Audiobook Creation**
- Users can create their own audiobooks by visiting `/auth/create-book`.
- Two options for audiobook creation:
  - **Upload Audiobook**: Users can upload `.mp3` files.
  - **Generate Audiobook using AI**: Uses Google Text-to-Speech API via the `google-tts-api` npm package.
- The `/api/data/book` endpoint handles manual uploads, while `/api/data/ai` generates AI-powered audiobooks.

### 5. **Performance Optimization**
- Optimized for Cloudflare Pages hosting.
- Uses Cloudflare D1 for database management.
- Stores audiobook files efficiently using Cloudflare R2.

---

## Development & Deployment

### Running the Application in Development Mode
To start the application in development mode, run the following commands:

```sh
pnpm install
pnpm dev
```

### Building and Previewing the Application

To build the application in production mode, use:

```sh
pnpm pages
```

To preview the production build locally, run:

```sh
pnpm preview
```

### Deploying to the Server

To deploy the application, use the command:
```sh
pnpm deploy
```

## Future Improvements
- Implement user comments and ratings for audiobooks.
- Enhance AI audiobook customization (e.g., voice selection, speaking speed).
- Improve UI and UX for seamless audiobook discovery and playback.

---

This project was built as part of the CS50 Web Programming with Python and JavaScript course to demonstrate advanced web application development using Next.js and Cloudflare services.