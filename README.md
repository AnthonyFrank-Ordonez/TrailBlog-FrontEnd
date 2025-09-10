# TrailBlog

A modern, Reddit-inspired blogging platform built with Angular 20+ where users can share their thoughts, experiences, and engage with a community of like-minded individuals.

## Description

TrailBlog is a feature-rich blogging platform that combines the best aspects of Reddit's community-driven content with a modern, clean interface. Users can create, share, and discover blog posts while engaging with others through comments, likes, and discussions.

## Features

- Modern and responsive user interface
- Component-based architecture using Angular 20+
- Custom UI components including:
  - Dynamic header and footer
  - Side navigation
  - Dropdown menus
  - Tooltips
  - Recent view functionality
- Shared utilities for styling and number formatting
- Environment configuration for development and production

## Technologies

- **Frontend Framework:** Angular 20+
- **Styling:**
  - Tailwind CSS for utility-first styling
  - Custom CSS modules
- **Package Management:** pnpm
- **Testing:** Karma for unit testing
- **Other Tools:**
  - TypeScript for type-safe code
  - Angular CLI for project scaffolding and management

## Getting Started

1. **Prerequisites:**

   - Node.js (Latest LTS version)
   - pnpm package manager
   - Angular CLI

2. **Installation:**

   ```bash
   # Clone the repository
   git clone https://github.com/AnthonyFrank-Ordonez/TrailBlog-FrontEnd.git

   # Navigate to project directory
   cd TrailBlog-FrontEnd

   # Install dependencies
   pnpm install
   ```

3. **Development Server:**

   ```bash
   ng serve
   ```

   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

4. **Build for Production:**

   ```bash
   ng build
   ```

5. **Running Tests:**
   ```bash
   ng test
   ```

## Project Structure

```
src/
├── app/                    # Main application code
│   ├── core/              # Core functionality
│   │   ├── constants/     # Application constants
│   │   ├── models/        # Data models and interfaces
│   │   └── services/      # Core services
│   ├── pages/             # Page components
│   │   └── home/
│   └── shared/            # Shared features
│       ├── components/    # Reusable UI components
│       ├── directives/    # Custom directives
│       ├── pipes/         # Custom pipes
│       └── utils/         # Utility functions
├── environments/          # Environment configurations
├── assets/               # Static assets
└── styles/              # Global styles
```

## Additional Resources

For more information on using Angular, check out these resources:

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
