# Invoice CRM Frontend

Modern, responsive React frontend for the Invoice CRM SaaS application.

## 🎨 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3001`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components (Button, Card, Input, etc.)
│   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   └── ProtectedRoute.tsx
│   ├── pages/              # Page components
│   │   ├── auth/           # Login, Register
│   │   ├── dashboard/      # Dashboard with analytics
│   │   ├── customers/      # Customer management
│   │   ├── invoices/       # Invoice management
│   │   ├── payments/       # Payment tracking
│   │   └── settings/       # Settings page
│   ├── lib/                # Utilities
│   │   ├── api.ts          # Axios instance
│   │   └── utils.ts        # Helper functions
│   ├── store/              # State management
│   │   └── auth.ts         # Auth store (Zustand)
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

## 🎯 Features

### ✅ Authentication
- User login with email/password
- Company registration
- JWT token management
- Protected routes
- Auto-redirect on auth state change

### ✅ Dashboard
- Revenue statistics
- Invoice status distribution (Pie chart)
- Revenue overview (Bar chart)
- Recent invoices list
- Quick stats cards

### ✅ Customer Management
- Customer list with pagination
- Create new customers
- Edit customer details
- Delete customers
- Customer detail view with invoice history
- Search and filter

### ✅ Invoice Management
- Invoice list with status filters
- Create invoices with line items
- Dynamic item addition/removal
- Automatic calculations (subtotal, tax, discount, total)
- Invoice detail view
- PDF download
- Send invoice (mark as sent)
- Status badges (Draft, Sent, Paid, Overdue)

### ✅ Payment Management
- Payment list with pagination
- Record new payments
- Link payments to invoices
- Multiple payment methods
- Payment history
- Automatic invoice status updates

### ✅ Settings
- User profile view
- Company information
- API details (Tenant ID, User ID)

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Destructive**: Red (#ef4444)
- **Muted**: Gray (#6b7280)

### Components
All UI components follow the shadcn/ui design pattern:
- Consistent styling
- Accessible
- Customizable with variants
- TypeScript support

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:3000/api`.

### API Client (`src/lib/api.ts`)
- Axios instance with interceptors
- Automatic JWT token injection
- Error handling
- Auto-redirect on 401 (unauthorized)

### React Query
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

## 🔐 Authentication Flow

1. User enters credentials on login page
2. API returns JWT token and user data
3. Token stored in localStorage
4. Token added to all API requests via interceptor
5. Protected routes check auth state
6. Redirect to login if not authenticated

## 📊 State Management

### Zustand (Auth Store)
```typescript
- user: User | null
- token: string | null
- isAuthenticated: boolean
- setAuth(user, token)
- logout()
- initAuth()
```

### React Query (Server State)
- Customers
- Invoices
- Payments
- Dashboard stats

## 🎨 Styling

### Tailwind CSS
- Utility-first approach
- Custom design tokens
- Responsive design
- Dark mode support (configured)

### CSS Variables
All colors use CSS variables for easy theming:
```css
--primary
--secondary
--accent
--muted
--destructive
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- Sidebar collapses on mobile

## 🚀 Production Build

```bash
# Build for production
npm run build

# Output in dist/ directory
# Serve with any static file server
```

### Deployment Options
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **AWS S3 + CloudFront**
- **Nginx**: Serve `dist/` directory

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

### Vite Proxy
Development proxy configured in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

## 📚 Key Libraries

- **react-router-dom**: Routing
- **@tanstack/react-query**: Data fetching
- **zustand**: State management
- **react-hook-form**: Forms
- **zod**: Validation
- **recharts**: Charts
- **axios**: HTTP client
- **sonner**: Toasts
- **lucide-react**: Icons
- **date-fns**: Date formatting
- **tailwind-merge**: Class merging
- **clsx**: Conditional classes
- **class-variance-authority**: Component variants

## 🎯 Next Steps

1. Add unit tests (Vitest + React Testing Library)
2. Add E2E tests (Playwright)
3. Implement dark mode toggle
4. Add more chart types
5. Implement real-time updates (WebSockets)
6. Add export functionality (CSV, Excel)
7. Implement advanced filtering
8. Add bulk actions
9. Implement email templates
10. Add notification center

## 📝 License

MIT

---

**Built with ❤️ using modern web technologies**

