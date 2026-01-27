# Frontend Setup Guide

Complete guide to set up and run the Invoice CRM frontend.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:3000`

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# ✅ Frontend running at http://localhost:3001
```

## 📦 Installation Steps

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- React 18 + React DOM
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Zustand
- React Hook Form + Zod
- Recharts
- Axios
- Sonner (toasts)
- Lucide React (icons)
- And more...

### Step 2: Verify Backend Connection

Make sure your backend is running:
```bash
# In the root directory
npm run dev
```

Backend should be accessible at `http://localhost:3000`

### Step 3: Start Frontend

```bash
# In frontend directory
npm run dev
```

Frontend will start at `http://localhost:3001`

## 🎯 First Time Setup

### 1. Register a Company

1. Open `http://localhost:3001`
2. Click "Sign up"
3. Fill in the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Company Name: Acme Inc.
   - Company Email: contact@acme.com
4. Click "Create account"
5. You'll be automatically logged in and redirected to the dashboard

### 2. Create Your First Customer

1. Navigate to "Customers" in the sidebar
2. Click "Add Customer"
3. Fill in customer details:
   - Name: ABC Corporation
   - Email: contact@abc.com
   - Phone: +1 (555) 123-4567
   - Address: 123 Main St
   - City: New York
   - State: NY
   - Zip Code: 10001
4. Click "Create Customer"

### 3. Create Your First Invoice

1. Navigate to "Invoices" in the sidebar
2. Click "Create Invoice"
3. Select customer: ABC Corporation
4. Set issue date and due date
5. Add line items:
   - Description: Web Development Services
   - Quantity: 40
   - Unit Price: 100
6. Add more items if needed
7. Set tax and discount (optional)
8. Add notes (optional)
9. Click "Create Invoice"

### 4. Record a Payment

1. Navigate to "Payments" in the sidebar
2. Click "Record Payment"
3. Select the invoice
4. Enter payment amount
5. Select payment method
6. Set payment date
7. Add reference number (optional)
8. Click "Record Payment"

## 🎨 Features Overview

### Dashboard
- **Revenue Statistics**: Total and pending revenue
- **Invoice Metrics**: Total, paid, and overdue invoices
- **Customer Count**: Total active customers
- **Charts**: Pie chart for invoice status, bar chart for revenue
- **Recent Invoices**: Quick view of latest invoices

### Customers
- **List View**: Grid of customer cards with contact info
- **Create**: Modal form to add new customers
- **Edit**: Update customer information
- **Delete**: Remove customers (with confirmation)
- **Detail View**: Customer profile with invoice history
- **Pagination**: Navigate through customer pages

### Invoices
- **List View**: Table with filters and search
- **Status Filter**: Filter by Draft, Sent, Paid, Overdue, Cancelled
- **Create**: Multi-step form with dynamic line items
- **Detail View**: Full invoice with all details
- **PDF Download**: Generate and download invoice PDF
- **Send**: Mark invoice as sent (triggers webhook)
- **Calculations**: Automatic subtotal, tax, discount, total

### Payments
- **List View**: Table of all payments
- **Record**: Modal form to record new payments
- **Methods**: Credit Card, Bank Transfer, Cash, Check, Other
- **Auto-update**: Automatically updates invoice status to PAID
- **Reference**: Track transaction IDs or check numbers

### Settings
- **User Profile**: View your personal information
- **Company Info**: View company details
- **API Details**: Tenant ID and User ID for integrations

## 🔧 Configuration

### API Endpoint

The frontend is configured to proxy API requests to the backend:

**vite.config.ts:**
```typescript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### Tailwind Theme

Custom colors are defined in `tailwind.config.js` and `src/index.css`:
- Primary: Blue
- Success: Green
- Warning: Yellow
- Destructive: Red
- Muted: Gray

## 📱 Responsive Design

The application is fully responsive:

- **Mobile (< 768px)**: Single column, collapsible sidebar
- **Tablet (768px - 1024px)**: 2-column grid
- **Desktop (> 1024px)**: 3-4 column grid, full sidebar

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

### Hot Module Replacement (HMR)

Vite provides instant HMR:
- Changes reflect immediately
- No full page reload
- State is preserved

### TypeScript

Full TypeScript support:
- Type checking during development
- IntelliSense in VS Code
- Compile-time error detection

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 is already in use:

1. Change port in `vite.config.ts`:
```typescript
server: {
  port: 3002, // Change to any available port
}
```

2. Restart dev server

### Backend Connection Error

If you see "Network Error" or "Failed to fetch":

1. Verify backend is running: `http://localhost:3000/health`
2. Check proxy configuration in `vite.config.ts`
3. Check CORS settings in backend

### Build Errors

If build fails:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear Vite cache: `rm -rf node_modules/.vite`

### TypeScript Errors

If you see TypeScript errors:

1. Run `npm run build` to see all errors
2. Check `tsconfig.json` configuration
3. Ensure all types are properly imported

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

#### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

#### 3. AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### 4. Nginx

```bash
# Build
npm run build

# Copy to nginx directory
sudo cp -r dist/* /var/www/html/

# Nginx config
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

### Environment Variables

For production, create `.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

## 📊 Performance

### Optimization Tips

1. **Code Splitting**: Automatic with Vite
2. **Lazy Loading**: Use React.lazy() for routes
3. **Image Optimization**: Use WebP format
4. **Caching**: React Query handles caching
5. **Bundle Size**: Analyze with `npm run build -- --analyze`

### Lighthouse Scores

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## 🔐 Security

### Best Practices

1. **JWT Storage**: Tokens stored in localStorage
2. **Auto Logout**: On 401 response
3. **HTTPS**: Always use HTTPS in production
4. **CSP Headers**: Configure Content Security Policy
5. **Input Validation**: Zod schemas on all forms

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)

## 🎉 You're Ready!

Your Invoice CRM frontend is now set up and running!

**Next Steps:**
1. Explore the dashboard
2. Create customers and invoices
3. Record payments
4. Customize the design
5. Deploy to production

**Need Help?**
- Check the README.md
- Review the code comments
- Check browser console for errors

Happy coding! 🚀

