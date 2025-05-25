# CS50 Project 5 - Final Project

My Project stands out from other apps in the CS50 course due to its unique combination of audiobook features, interactivity and the use of artificial intelligence. The app not only allows users to listen to audiobooks, but also gives them the ability to create their own recordings and generate audiobooks using Google Text-to-Speech technology. This combination of a traditional approach to audiobooks with modern AI solutions makes the project innovative and tailored to the needs of modern users.

While building the application, I encountered many challenges that required creative thinking and advanced technical knowledge. For example, integrating with Google's Text-to-Speech API required understanding how to effectively manage audio data and how to ensure a smooth user experience when generating audiobooks. Additionally, optimizing the application for performance on the Cloudflare platform was crucial to ensure fast loading and responsiveness, which is important for multimedia applications.

Using Next.js as a framework to build the web application allowed me to use advanced features such as server-side rendering and automatic code splitting, which significantly improved performance. Using Cloudflare D1 for database management and Cloudflare R2 for audio file storage gave me flexibility and scalability, which is essential for the growing number of users and audiobooks.

All of these elements make my project not only meet the course requirements, but also provide a comprehensive audiobook solution that combines modern technology with a user-friendly interface. I'm proud to have created an application that not only works, but also provides value to users, enabling them to discover and create audio content in a way that is both innovative and accessible.

## 🗂️ Project Structure

The project structure is based on Next.js application with Cloudflare integration:

```
cs50-final-project/
├── public                        # Public files
│   ├── logo-full.svg
│   ├── logo.svg
│   └── lottie
│       ├── 66d472c0-880d-4b93-bc8a-ada91cbf997a.json
│       ├── de34672e-4cf1-4ac2-bb1b-d9caae7d140a.json
│       ├── 204c081a-5684-4858-a89b-876b4187f66b.json
│       └── bc85dd48-c477-44f3-a7cb-57ee63b86e07.json
├── src                           # Source files
│   ├── lib                       # Folder with files that add additional features to the application
│   │   └── env.js                # Script to load all environment variables in the application frontend
├── app                           # Main application folder
│   ├── not-found.js              # Not found page
│   ├── favicon.ico               # Favicon icon
│   ├── page.js                   # Main page
│   ├── layout.js                 # Layout file
│   ├── components                # Components folder
│   │   ├── player.jsx            # Player component
│   │   ├── loader.jsx            
│   │   ├── playing.jsx           
│   │   ├── footer.jsx            # Footer component
│   │   ├── header.jsx            # Header component
│   │   ├── banner.jsx            # Displays the entire content of the home page along with lottie animations
│   │   ├── placeholder.jsx       # A component that displays animations in the player while the user has no audiobook enabled.
│   │   ├── utils.js              # A collection of tools to add new application features.
│   │   ├── buttons               # Folder containing all the buttons
│   │   │   ├── info-button.jsx   # A button showing a popup with information on how to properly create an audiobook using AI.
│   │   │   ├── like-button.jsx   # A button to add an audiobook to favorites.
│   │   │   └── switch.jsx        # A button to change the color of the template from light to dark.
│   │   ├── forms                 # Folder containing all the forms
│   │   │   ├── edit-account.jsx  # A form for changing user account information.
│   │   │   ├── search.jsx        # A form that allows you to search for the audiobook you need.
│   │   │   ├── create-book.jsx   # A form that allows you to create an audiobook using either an .mp3 or AI file.
│   │   │   ├── sign-in.jsx       # A form to enable login.
│   │   │   └── sign-up.jsx       # A form to enable registration.
│   |   └── panel                 # Folder containing the panel component.
│   │       ├── book-panel.jsx    # A component that allows you to display information on a single book page.
│   |       └── panel.jsx         # A component that allows you to display book's on Library page, Create page and Liked book's.
│   ├── context                   # Folder containing all the context's
│   │   ├── audio-context.jsx     
│   │   ├── auth-context.jsx      # Context that allows the use of variables available in the user account.
│   │   └── theme-context.jsx     # Context to create a light and dark application template.
│   ├── auth
│   │   ├── create-book
│   │   |   └── page.jsx          # Book creation page.
│   |   ├── library
│   |   |   ├── [id]
│   |   |   |   └── page.jsx      # Single book page.
│   |   |   └── page.jsx          # A site with an accessible library of all audiobooks.
│   |   ├── login
│   |   |   └── page.jsx          # Login page.
│   |   ├── register
│   |   |   └── page.jsx          # Register page.
│   |   └── my-account
│   |       └── page.jsx          # My account page.
│   ├── api                       # A folder to create a backend for the application.
│   │   ├── auth                  # Folder to inform the API user that it is about the user.
│   |   |   ├── challenge
│   |   |   |   └── route.js      # Endpoint to check if user is human using Cloudflare Turnstile.
│   |   |   ├── like
│   |   |   |   └── route.js      # Endpoint for downloading information, adding or deleting favorite books.
│   |   |   ├── user
│   |   |   |   └── route.js      # Endpoint to conduct user interaction.
│   │   └── data                  # Folder to inform the API user that it is about the data app.
│   |       ├── ai
│   |       |   └── route.js      # Endpoint to create a book using AI.
│   |       └── book
│   |           └── route.js      # Endpoint to create, update and delete a book.
│   ├── utils
│   │   ├── headers.js            # Folder for adding specific headings to a query.
│   │   └── utils.js              # Tools that enable additional functionality to the application backend.
│   └── styles                    # Styles folder
│       ├── css                   # Css folder
│       │   ├── components
│       │   │   ├── panel.css
│       │   │   ├── banner.css
│       │   │   ├── forms.css
│       │   │   ├── placeholder.css
│       │   │   ├── playing.css
│       │   │   ├── player.css
│       │   │   ├── loader.css
│       │   │   ├── popups.css
│       │   │   └── buttons
│       │   │       └── switch.css
│       │   ├── theme
│       │   │   ├── theme.css
│       │   │   └── not-found.css
│       │   ├── header
│       │   │   └── theme.css
│       │   └── footer
│       │       └── theme.css
│       ├── icons                 # Icons folder
│       │   ├── ai.js
│       │   ├── logo.js
│       │   └── github.js
│       └── fonts                 # Fonts folder
│           ├── proxima-nova.woff
│           └── montserrat.woff
├── .eslintrc.json
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
└── wrangler.jsonc                 # A file containing settings for the Cloudflare Pages service such as environment variables.
```

## ✅ Features Overview

### 🔐 User Authentication

  - Account creation, login, and logout.
  - Profile management at /auth/my-account, including:
  - Uploading a profile picture.
  - Changing email and password.

### 🎧 Audiobook Library

  - Main library view at /auth/library:
    - Displays all available audiobooks.
    - Includes search and filter options.
  - Detailed view per book at /auth/library/{book-id}:
    - Playback interface.
    - Metadata and descriptions.

### ⭐ Favorites System

  - Users can like/unlike books via /api/auth/like.
  - Favorite books are stored in the user profile.

### 🛠️ Audiobook Creation

  - Accessible at /auth/create-book, with two options:
  - Manual Upload:
    - Upload .mp3 files.
    - Processed via /api/data/book.
  - AI-Generated:
    - Enter text to generate audio using google-tts-api.
    - Generated via /api/data/ai.

### 🚀 Performance & Deployment

  - Hosted on Cloudflare Pages.
  - Uses:
    - Cloudflare D1 for database operations.
    - Cloudflare R2 for efficient audio file storage.
    - Next.js with Edge runtime for optimal performance.

## 🧩 Tech Stack & Dependencies

To run the application, make sure you have the following dependencies installed:

```json
{
  "next": "15.1.6",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-lottie": "^1.2.10",
  "google-tts-api": "^2.0.2",
  "@cloudflare/next-on-pages": "^1.13.12"
}
```

To install all dependencies, run:

```bash
pnpm install
```

## 🚀 Running the Application

### Running the Application in Development Mode

To start the application in development mode, run the following commands:
```bash
pnpm install
pnpm dev
```

### Building and Previewing the Application

To build the application in production mode, use:
```bash
pnpm pages
```

To preview the production build locally, run:
```bash
pnpm preview
```

### Deploying to the Server

To deploy the application, use the command:
```bash
pnpm deploy
```

## 🎥 Demo

You can view a working version of the project here:
👉 https://cs50-final-project-ecz.pages.dev/

Video walkthrough of the specification:
🎥 https://youtu.be/-lCgQ6-MzIw

## 📜 Certification

This project was submitted as part of the CS50’s Web Programming with Python and JavaScript course offered by Harvard University.
Upon successful completion, I was awarded a certificate, which is available here:

🎓 [View Certificate](https://certificates.cs50.io/6f5116d0-882d-4fc1-9dc6-0c96c5d4c7b1.pdf)