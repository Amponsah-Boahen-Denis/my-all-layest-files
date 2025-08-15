# Locator App

A modern web application for finding and saving locations with a clean, responsive interface.

## Features

### Public Pages
- **Home** (`/`) - Overview with search functionality and app features
- **Search** (`/search`) - Location search with results and save options
- **Login** (`/login`) - User authentication form
- **Register** (`/register`) - User registration form

### User Pages (Requires Authentication)
- **History** (`/history`) - View and manage search history
- **Profile** (`/profile`) - View and edit user profile information

### Admin Pages (Requires Admin Role)
- **Dashboard** (`/admin/dashboard`) - Overview of system statistics and recent activity
- **Manage Users** (`/admin/manage-users`) - User management with status controls
- **Activity Logs** (`/admin/logs`) - System activity monitoring and filtering

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS Modules
- **Authentication**: Mock authentication system (ready for real implementation)
- **API**: RESTful API routes with mock data

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd locator-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── admin/         # Admin endpoints
│   │   ├── search.js      # Search functionality
│   │   └── history.js     # User history
│   ├── admin/             # Admin pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── search/            # Search page
│   ├── history/           # User history page
│   ├── profile/           # User profile page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   └── Navigation.module.css
└── types/                  # TypeScript type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Search & History
- `GET /api/search?q=<query>` - Search locations
- `GET /api/history` - Get user search history
- `POST /api/history` - Save location to history
- `DELETE /api/history?id=<id>` - Remove from history

### Admin
- `GET /api/admin/users` - Get user list with filtering
- `GET /api/admin/logs` - Get system logs with filtering

## Mock Data

The application includes comprehensive mock data for:
- User accounts (admin@example.com/admin123, user@example.com/user123)
- Location data (Central Park, Times Square, Brooklyn Bridge, etc.)
- Search history
- System logs
- User management

## Customization

### Adding Real Authentication
Replace the mock authentication in `src/app/layout.tsx` with a real authentication system like:
- NextAuth.js
- Auth0
- Custom JWT implementation

### Database Integration
Replace mock data in API routes with real database queries:
- PostgreSQL with Prisma
- MongoDB with Mongoose
- Supabase
- Firebase

### Styling
The app uses CSS Modules for component-specific styling. Modify the CSS files in each component directory to customize the appearance.

## Features in Detail

### Search Functionality
- Real-time search with debouncing
- Filtered results based on location name, address, and type
- Save results to user history
- Responsive result cards with location details

### User Management
- User registration and login
- Profile editing
- Search history tracking
- Admin user management with status controls

### Admin Dashboard
- System statistics overview
- Recent activity monitoring
- User management interface
- Activity log filtering and export

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
