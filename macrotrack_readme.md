# MacroTrack - Nutrition & Macro Tracking Application

A comprehensive full-stack nutrition tracking application built with Next.js, TypeScript, MongoDB, and modern web development best practices.

## Project Overview

MacroTrack is a sophisticated nutrition tracking platform that helps users monitor their daily macronutrient intake (proteins, carbohydrates, and fats) while working toward their fitness and health goals. This application demonstrates advanced full-stack development skills including MVC architecture, comprehensive testing, and production deployment.

### Key Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Food Database**: Integration with Spoonacular API (380,000+ foods)
- **Meal Logging**: Add foods to daily meal entries with real-time calculations
- **Goal Tracking**: Set and monitor daily macro targets with visual progress indicators
- **Progress Analytics**: Dashboard with charts and trend analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Live Demo

- **Application**: [Deploy to see live demo]
- **Test Account**: Available after deployment

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **State Management**: React Context API
- **Forms**: React Hook Form with validation

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod for schema validation
- **External API**: Spoonacular Food API integration

### Development Tools
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Deployment**: Render (recommended)
- **Database Hosting**: MongoDB Atlas

## Architecture

### MVC Pattern Implementation

**Model Layer** (`/src/models/`):
- User authentication, profiles, and goals
- Daily meal tracking with nutrition calculations
- Custom food entries with validation

**View Layer** (`/src/components/`):
- React components with TypeScript
- Responsive UI with Tailwind CSS
- Interactive charts and data visualization

**Controller Layer** (`/src/pages/api/`):
- RESTful API endpoints
- Authentication middleware
- Input validation and error handling

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB Atlas account
- Spoonacular API key (optional - app works with mock data)

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/adangerfield1026/Capstone.git
cd Capstone
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

4. **Configure environment variables in `.env.local`:**
```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/macrotrack
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Optional
SPOONACULAR_API_KEY=your-spoonacular-api-key-here
NEXTAUTH_SECRET=your-nextauth-secret-different-from-jwt
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string, // Unique, validated
  password: string, // Hashed with bcrypt
  profile: {
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    gender: 'male' | 'female' | 'other',
    height: { value: number, unit: 'cm' | 'inches' },
    weight: { value: number, unit: 'kg' | 'lbs' },
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  },
  goals: {
    dailyCalories: number,
    macroTargets: {
      protein: number,
      carbohydrates: number,
      fat: number
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### MealEntry Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  date: Date,
  meals: [{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    foods: [{
      name: string,
      amount: number,
      unit: string,
      nutrition: {
        calories: number,
        protein: number,
        carbohydrates: number,
        fat: number,
        fiber: number
      }
    }]
  }],
  dailyTotals: {
    calories: number,
    protein: number,
    carbohydrates: number,
    fat: number
  },
  goalProgress: {
    calories: { target: number, actual: number, percentage: number },
    protein: { target: number, actual: number, percentage: number },
    carbohydrates: { target: number, actual: number, percentage: number },
    fat: { target: number, actual: number, percentage: number }
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Foods
- `GET /api/foods/search` - Search foods in database
- `GET /api/foods/:id` - Get specific food nutrition data
- `POST /api/foods/custom` - Create custom food entry

### Meals
- `GET /api/meals/daily/:date` - Get meals for specific date
- `POST /api/meals` - Create new meal entry
- `PUT /api/meals/:id` - Update existing meal
- `DELETE /api/meals/:id` - Delete meal entry

## Testing

### Test Structure
```
__tests__/
├── components/     # React component tests
├── pages/api/      # API endpoint tests
├── models/         # Database model tests
├── lib/            # Utility function tests
└── integration/    # End-to-end tests
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- Dashboard.test.tsx
```

### Coverage Goals
- Components: 85%+
- API Endpoints: 100%
- Database Models: 90%+
- Utilities: 95%+

## Deployment

### Render Deployment (Recommended)

1. **Create account at [render.com](https://render.com)**

2. **Connect GitHub repository**

3. **Create new Web Service with settings:**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

4. **Add environment variables:**
   - `NODE_ENV=production`
   - `MONGODB_URI=your-production-database-url`
   - `JWT_SECRET=your-production-jwt-secret`
   - `NEXTAUTH_URL=your-render-app-url`

5. **Deploy**: Push to main branch triggers deployment

### Alternative: Vercel
```bash
npm install -g vercel
vercel --prod
```

## Project Structure

```
macrotrack/
├── src/
│   ├── components/          # React components (View layer)
│   │   ├── ui/             # Reusable UI components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   └── ...
│   ├── models/             # Database models (Model layer)
│   │   ├── User.ts
│   │   ├── MealEntry.ts
│   │   └── CustomFood.ts
│   ├── pages/
│   │   └── api/           # API routes (Controller layer)
│   │       ├── auth/
│   │       ├── foods/
│   │       └── meals/
│   ├── lib/               # Utilities and configuration
│   │   ├── mongodb.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── services/          # External API integration
│       └── spoonacularService.ts
├── __tests__/             # Comprehensive test suite
├── docs/                  # Additional documentation
└── README.md             # This file
```

## Key Development Decisions

### Why Next.js?
- Full-stack framework with API routes
- Built-in TypeScript support
- Excellent performance and SEO
- Easy deployment options

### Why MongoDB?
- Flexible schema for nutrition data
- Natural fit for nested meal structures
- JSON-like documents work well with JavaScript
- Excellent cloud hosting with Atlas

### Why JWT Authentication?
- Stateless authentication
- Works well with modern SPAs
- Secure when implemented properly
- Easy to scale across services

## Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: 7-day expiration with secure secrets
- **Input Validation**: Server-side validation with Zod
- **Environment Variables**: Sensitive data properly protected
- **HTTPS**: Enforced in production
- **CORS**: Configured for security

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js automatic optimization
- **API Caching**: Reduced external API calls
- **Database Indexes**: Optimized queries
- **Bundle Analysis**: Regular size monitoring

## Troubleshooting

### Common Issues

**Database Connection:**
```bash
# Verify MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database

# Check IP whitelist in MongoDB Atlas
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Rate Limits:**
- Spoonacular free tier: 150 requests/day
- App automatically falls back to mock data
- Consider upgrading API plan for production

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Make changes with tests
4. Run test suite (`npm test`)
5. Commit changes (`git commit -m 'Add new feature'`)
6. Push to branch (`git push origin feature/new-feature`)
7. Open Pull Request

### Code Standards
- TypeScript required for all new code
- Maintain 85%+ test coverage
- Follow ESLint configuration
- Update documentation for new features

## Capstone Project Requirements

This project fulfills all capstone requirements:

- **Complete MVC Architecture**: Clear separation of concerns
- **Database Integration**: MongoDB with proper relationships
- **External API**: Spoonacular integration with fallbacks
- **Authentication**: Secure JWT-based system
- **Testing**: Comprehensive test suite
- **Deployment**: Production-ready on Render
- **Documentation**: Complete project documentation
- **TypeScript**: Full type safety implementation

## Future Enhancements

- Barcode scanning for packaged foods
- Meal planning and templates
- Social sharing features
- Mobile app version
- Advanced analytics dashboard
- Recipe nutrition analysis

## License

This project is licensed under the MIT License.

## Acknowledgments

- Spoonacular API for comprehensive food data
- MongoDB Atlas for reliable database hosting
- Render for seamless deployment
- Capstone program for guidance and mentorship

---

**Contact**: For questions about this project, please create an issue in the GitHub repository.

**Built for**: Software Engineering Capstone Program
**Purpose**: Demonstration of full-stack development skills