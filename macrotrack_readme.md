# MacroTrack - Nutrition & Macro Tracking Application

[![Next.js](https://img.shields.io/badge/Next.js-13.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

## 🎯 Project Overview

MacroTrack is a comprehensive nutrition tracking application designed to help users monitor their daily macronutrient intake (proteins, carbohydrates, and fats) while working toward their fitness and health goals. The application provides an intuitive interface for food logging, progress visualization, and goal management.

### 🚀 Live Demo
- **Frontend**: [https://macrotrack-frontend.vercel.app](https://macrotrack-frontend.vercel.app)
- **API Documentation**: [https://macrotrack-api.herokuapp.com/docs](https://macrotrack-api.herokuapp.com/docs)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios with React Query for caching
- **Authentication**: NextAuth.js

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **External API**: Spoonacular Food API
- **Validation**: Zod for schema validation

### Development & Deployment
- **Version Control**: Git with GitHub
- **Deployment**: Vercel (Frontend & API)
- **Database Hosting**: MongoDB Atlas
- **Environment Management**: Vercel Environment Variables

## 🎯 Project Goals

1. **Accurate Macro Tracking**: Provide precise macronutrient calculations
2. **User-Friendly Interface**: Intuitive food search and meal logging
3. **Progress Visualization**: Clear charts and progress indicators
4. **Goal Management**: Customizable daily macro targets
5. **Data Persistence**: Reliable meal history and analytics

## 👥 Target Users

- **Fitness Enthusiasts** (ages 25-40): Need precise macro tracking for performance
- **Health-Conscious Individuals** (ages 22-50): Seeking balanced nutrition
- **Weight Management Users** (ages 18-45): Working toward specific body composition goals

## 📊 Data Sources

### Primary Data Source
- **Spoonacular Food API**: Comprehensive nutritional database
  - 380,000+ food items
  - Detailed macro and micronutrient information
  - Recipe analysis capabilities

### Secondary Data Sources
- **User-Generated Content**: Custom food entries
- **Meal History**: Personal tracking data
- **Goal Metrics**: User-defined targets and preferences

## 🏗️ Project Architecture

### Database Schema

#### User Model
```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // hashed with bcrypt
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    height: { value: number; unit: 'cm' | 'inches' };
    weight: { value: number; unit: 'kg' | 'lbs' };
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  };
  goals: {
    dailyCalories: number;
    macroTargets: {
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### MealEntry Model
```typescript
interface MealEntry {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  meals: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: Array<{
      spoonacularId: number;
      name: string;
      amount: number;
      unit: string;
      nutrition: {
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
      };
    }>;
    mealTotals: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  }>;
  dailyTotals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  goalProgress: {
    calories: { target: number; actual: number; percentage: number };
    protein: { target: number; actual: number; percentage: number };
    carbohydrates: { target: number; actual: number; percentage: number };
    fat: { target: number; actual: number; percentage: number };
  };
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Meals & Nutrition
- `GET /api/meals/daily/:date` - Get meals for specific date
- `POST /api/meals` - Create new meal entry
- `PUT /api/meals/:id` - Update meal entry
- `DELETE /api/meals/:id` - Delete meal entry

#### Food Search
- `GET /api/foods/search` - Search foods via Spoonacular
- `GET /api/foods/:id` - Get specific food details
- `POST /api/foods/custom` - Create custom food entry

#### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/goals` - Update macro goals

## 🔧 Core Functionality

### Must-Have Features ✅
1. **User Authentication**: Secure registration and login
2. **Food Search**: Integration with Spoonacular API
3. **Meal Logging**: Add foods to daily meal entries
4. **Macro Calculations**: Real-time daily macro totals
5. **Goal Tracking**: Set and monitor macro targets
6. **Progress Dashboard**: Visual progress indicators
7. **Historical Data**: View past meal entries and trends

### Advanced Features 🎯
1. **Custom Foods**: Create user-defined food entries
2. **Meal Templates**: Save and reuse favorite meals
3. **Progress Analytics**: Weekly/monthly trend analysis
4. **Goal Optimization**: Smart macro target suggestions
5. **Data Export**: Export meal history as CSV/PDF

### Stretch Goals 🌟
1. **Barcode Scanner**: Scan packaged foods for quick entry
2. **Recipe Analysis**: Break down recipes into macros
3. **Social Features**: Share progress with friends
4. **Mobile App**: React Native version
5. **AI Recommendations**: ML-powered food suggestions

## 🎨 User Experience Design

### Core User Flows

#### Primary Flow: Daily Meal Logging
```
Dashboard → Search Food → Select Portion → Add to Meal → View Progress
```

#### Secondary Flow: Goal Management
```
Profile → Set Goals → Calculate Macros → Save Preferences → Track Progress
```

### Key Interactions
1. **Food Search**: Type-ahead search with instant results
2. **Portion Selection**: Visual portion size selector
3. **Macro Visualization**: Real-time circular progress indicators
4. **Quick Actions**: One-click meal logging for frequent foods

## 🧪 Testing Strategy

### Unit Testing
- **Components**: React Testing Library for UI components
- **API Functions**: Jest for backend logic
- **Utilities**: Test calculation functions and helpers
- **Database**: Mock MongoDB operations

### Integration Testing
- **API Routes**: Test complete request/response cycles
- **Authentication**: Verify JWT token flows
- **Database Operations**: Test CRUD operations
- **External APIs**: Mock Spoonacular API responses

### End-to-End Testing
- **User Flows**: Complete user journeys from login to goal achievement
- **Cross-Browser**: Ensure compatibility across browsers
- **Mobile Responsive**: Test on various device sizes

## 🚀 Deployment Strategy

### Development Environment
```bash
# Local development setup
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run lint         # Code quality checks
```

### Production Deployment
- **Platform**: Vercel for seamless Next.js deployment
- **Database**: MongoDB Atlas for managed database hosting
- **Environment Variables**: Secure API key and database connection management
- **Monitoring**: Vercel Analytics and Error tracking

### CI/CD Pipeline
1. **Push to GitHub** → Automatic Vercel deployment
2. **Pull Request** → Preview deployment for testing
3. **Merge to Main** → Production deployment
4. **Monitoring** → Real-time error tracking and performance metrics

## 📱 Responsive Design

### Mobile-First Approach
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch Optimization**: Large tap targets and gesture support
- **Performance**: Optimized for mobile data usage
- **PWA Features**: Offline support and app-like experience

### Cross-Device Compatibility
- **Mobile**: Streamlined interface for quick meal logging
- **Tablet**: Enhanced data visualization and multi-column layouts
- **Desktop**: Full-featured interface with advanced analytics

## 🔐 Security Implementation

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh
- **Input Validation**: Server-side validation for all inputs

### Data Protection
- **Environment Variables**: Secure API key storage
- **HTTPS Enforcement**: SSL/TLS encryption
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS and injection prevention

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: React Query for API response caching
- **Bundle Analysis**: Regular bundle size monitoring

### Backend Optimization
- **Database Indexing**: Optimized queries for user data
- **API Caching**: Cache frequent Spoonacular API calls
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression for API responses

## 🚧 Potential Challenges & Solutions

### Technical Challenges
1. **API Rate Limits** (Spoonacular)
   - *Solution*: Implement local caching and request batching
   
2. **Complex Macro Calculations**
   - *Solution*: Client-side calculations with server validation
   
3. **Real-time Data Updates**
   - *Solution*: Optimistic UI updates with error rollback

### User Experience Challenges
1. **Food Search Accuracy**
   - *Solution*: Smart search algorithms and user feedback system
   
2. **Mobile Performance**
   - *Solution*: Progressive loading and optimized images
   
3. **Data Entry Speed**
   - *Solution*: Quick-add features and meal templates

## 📚 Learning Outcomes

This project demonstrates proficiency in:
- **Full-Stack Development**: Complete CRUD application with authentication
- **API Integration**: External service integration and error handling
- **Database Design**: Complex relational data modeling
- **Modern React**: Hooks, Context API, and performance optimization
- **TypeScript**: Type-safe development practices
- **Testing**: Unit, integration, and end-to-end testing strategies
- **Deployment**: Production deployment and monitoring

## 🤝 Contributing

This is a capstone project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spoonacular API** for comprehensive nutritional data
- **Capstone Program** for project guidance and mentorship
- **Open Source Community** for the tools and libraries that made this possible

---

**Built with ❤️ for health-conscious individuals and fitness enthusiasts**