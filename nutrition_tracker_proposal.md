# Capstone Project Proposal: MacroTrack - Nutrition and Macro Tracking Application

## Project Overview Template

| Type | Description | Fill in |
|------|-------------|---------|
| **Stack** | React.js frontend, Node.js/Express backend, MongoDB database, Spoonacular API integration |
| **Focus** | Evenly focused full-stack application with emphasis on data visualization and user experience |
| **Type** | Web application with responsive design for mobile compatibility |
| **Goal** | Help users track daily nutrition intake with focus on macronutrients (proteins, carbohydrates, fats) and achieve their fitness/health goals |
| **Users** | Fitness enthusiasts, health-conscious individuals, people with specific dietary goals (weight loss, muscle gain, maintenance), ages 18-45 |
| **Data** | Spoonacular Food API for nutritional data, user-generated meal logs, custom food entries, daily/weekly tracking data |

---

## Tech Stack

### Frontend
- **React.js**: For building an interactive and responsive user interface
- **Chart.js or Recharts**: For data visualization of macro intake and progress
- **Tailwind CSS**: For modern, responsive styling
- **React Router**: For client-side routing

### Backend
- **Node.js with Express**: For API development and server-side logic
- **JWT**: For user authentication and session management
- **Bcrypt**: For password hashing and security

### Database
- **MongoDB with Mongoose**: For storing user profiles, meal logs, custom foods, and tracking data

### External APIs
- **Spoonacular Food API**: Primary source for comprehensive nutritional data
- **Backup nutrition data**: Local database of common foods as fallback

### Hosting & Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Heroku or Railway
- **Database**: MongoDB Atlas

---

## Project Focus

This will be an **evenly focused full-stack application** that emphasizes:
- **Frontend**: Intuitive user interface with rich data visualization
- **Backend**: Robust API design with efficient data processing
- **Database**: Well-structured schema for tracking and analytics
- **Integration**: Seamless connection with external nutrition API

---

## Project Type

**Web Application** with responsive design optimized for:
- Desktop use for detailed tracking and analysis
- Mobile-friendly interface for quick meal logging on-the-go
- Progressive Web App (PWA) features for mobile app-like experience

---

## Project Goal

Create a comprehensive nutrition tracking application that:
1. **Simplifies macro tracking** for users focused on fitness and health goals
2. **Provides accurate nutritional data** through Spoonacular API integration
3. **Offers visual insights** into eating patterns and macro distribution
4. **Supports goal-setting** for weight management and fitness objectives
5. **Enables long-term tracking** with historical data and progress analytics

---

## Target Users

### Primary Demographics
- **Fitness Enthusiasts** (25-40): Individuals actively working out who need to track macros for performance
- **Health-Conscious Adults** (22-50): People making dietary changes for health improvement
- **Weight Management Users** (18-45): Individuals with specific weight loss or gain goals

### User Personas
1. **"Gym Greg"**: 28-year-old who lifts weights and needs to hit specific protein targets
2. **"Healthy Hannah"**: 34-year-old busy professional trying to maintain balanced nutrition
3. **"Transformation Tom"**: 25-year-old focused on body recomposition with strict macro targets

---

## Data Strategy

### Spoonacular API Integration
- **Recipe Nutrition**: GET `/recipes/{id}/nutritionWidget.json`
- **Ingredient Analysis**: POST `/recipes/analyzeInstructions`
- **Food Search**: GET `/food/ingredients/search`
- **Nutrition by ID**: GET `/food/ingredients/{id}/information`

### Data Structure
```javascript
// User meal entry
{
  userId: ObjectId,
  date: Date,
  meals: [
    {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
      foods: [
        {
          spoonacularId: Number,
          name: String,
          amount: Number,
          unit: String,
          nutrition: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
            fiber: Number,
            sugar: Number
          }
        }
      ]
    }
  ],
  dailyTotals: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}
```

### Data Collection Strategy
1. **Primary**: Spoonacular API for comprehensive food database
2. **Secondary**: User-created custom foods for items not in API
3. **Caching**: Store frequently accessed foods locally to reduce API calls
4. **Backup**: Maintain basic nutrition database for offline functionality

---

## Breaking Down Your Project

### Phase 1: Foundation (Weeks 1-2)
**Task: Design Database Schema**
- User authentication schema
- Meal tracking data structure
- Custom foods storage
- Daily/weekly aggregation models
- **Label**: Backend, Medium

**Task: Set up Backend and Database**
- Express server configuration
- MongoDB connection setup
- Environment variables configuration
- Basic API endpoints structure
- **Label**: Backend, Medium

**Task: Spoonacular API Integration**
- API key setup and testing
- Create service layer for API calls
- Implement rate limiting and error handling
- Test nutrition data retrieval
- **Label**: Backend, Hard

### Phase 2: Core Functionality (Weeks 3-6)
**Task: User Authentication System**
- User registration and login
- JWT token implementation
- Password security with bcrypt
- Protected routes middleware
- **Label**: Fullstack, Medium

**Task: Food Search and Selection**
- Integrate Spoonacular search endpoint
- Create food selection interface
- Implement portion size calculations
- Build nutrition display components
- **Label**: Fullstack, Hard

**Task: Meal Logging System**
- Create meal entry forms
- Implement CRUD operations for meals
- Daily meal organization by type
- Real-time macro calculations
- **Label**: Fullstack, Hard

### Phase 3: User Experience (Weeks 7-9)
**Task: Set up Frontend**
- React application structure
- Component library setup
- Routing configuration
- State management setup
- **Label**: Frontend, Medium

**Task: Dashboard and Visualization**
- Daily macro breakdown charts
- Weekly/monthly progress tracking
- Goal vs. actual comparisons
- Interactive data visualizations
- **Label**: Frontend, Hard

**Task: User Profile and Goals**
- Personal information management
- Macro goal calculation
- Custom target setting
- Progress tracking setup
- **Label**: Fullstack, Medium

### Phase 4: Advanced Features (Weeks 10-11)
**Task: Custom Food Creation**
- User-defined food entries
- Nutrition information input forms
- Food verification system
- Integration with main food database
- **Label**: Fullstack, Medium, Stretch Goal

**Task: Meal Planning Features**
- Save favorite meals
- Meal templates and presets
- Quick-add functionality
- Meal copying between days
- **Label**: Fullstack, Medium, Stretch Goal

### Phase 5: Polish and Deploy (Weeks 12)
**Task: Testing and Bug Fixes**
- Unit testing for critical functions
- Integration testing for API calls
- User acceptance testing
- Performance optimization
- **Label**: Fullstack, Medium

**Task: Deployment and Documentation**
- Production environment setup
- Database migration
- API documentation
- User guide creation
- **Label**: Fullstack, Easy

---

## Potential Challenges and Solutions

### API-Related Issues
1. **Rate Limiting**: Spoonacular has API call limits
   - *Solution*: Implement caching strategy and batch requests
2. **Data Inconsistency**: Nutritional data might be incomplete
   - *Solution*: Data validation and fallback values
3. **API Downtime**: External dependency risk
   - *Solution*: Local backup database for common foods

### Technical Challenges
1. **Real-time Calculations**: Complex macro calculations
   - *Solution*: Efficient algorithms and client-side computation
2. **Data Visualization**: Complex charts and graphs
   - *Solution*: Use proven charting libraries (Chart.js/Recharts)
3. **Mobile Performance**: Large datasets on mobile
   - *Solution*: Pagination and lazy loading

---

## Security Considerations

### Data Protection
- User passwords hashed with bcrypt
- JWT tokens for secure authentication
- Input validation and sanitization
- API rate limiting protection

### Privacy
- No sharing of personal nutrition data
- Optional data deletion features
- Secure API key management
- HTTPS enforcement in production

---

## Core Functionality

### Must-Have Features
1. **User Authentication**: Secure login/registration system
2. **Food Search**: Search Spoonacular database for foods
3. **Meal Logging**: Add foods to daily meal entries
4. **Macro Tracking**: Real-time calculation of daily macros
5. **Goal Setting**: Set and track macro targets
6. **Daily Overview**: Dashboard showing progress vs. goals

### User Flow
1. **Registration/Login** → User creates account or signs in
2. **Goal Setting** → User sets daily macro targets
3. **Food Search** → User searches for foods to add
4. **Meal Logging** → User adds foods to specific meals
5. **Progress Tracking** → User views daily/weekly progress
6. **Analysis** → User reviews trends and adjusts goals

---

## What Makes This More Than CRUD

### Advanced Features
1. **Intelligent Suggestions**: Recommend foods based on remaining macros
2. **Progress Analytics**: Trend analysis and goal achievement tracking
3. **Meal Optimization**: Suggest meal adjustments to meet macro targets
4. **Data Visualization**: Interactive charts showing nutrition patterns
5. **Goal Adaptation**: Dynamic goal adjustment based on progress

### Stretch Goals
1. **Barcode Scanner**: Scan packaged foods for quick entry
2. **Recipe Analysis**: Break down homemade recipes into macros
3. **Social Features**: Share progress with friends or trainers
4. **Integration**: Connect with fitness trackers for calorie burn data
5. **AI Recommendations**: Machine learning for personalized suggestions
6. **Meal Planning**: Advanced meal prep and planning tools
7. **Export Features**: PDF reports and data export options

---

## Success Metrics

### Technical Metrics
- API response time < 2 seconds
- 99% uptime for core functionality
- Support for 100+ concurrent users
- Mobile-responsive design score > 90

### User Experience Metrics
- Intuitive food search and selection
- Accurate macro calculations
- Clear progress visualization
- Easy meal logging process

---

## GitHub Repository Structure

```
macro-track/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── docs/                   # Documentation
├── tests/                  # Test files
├── README.md              # Project overview
└── .env.example           # Environment variables template
```

### Repository Labels
- **Difficulty**: Easy, Medium, Hard
- **Type**: Frontend, Backend, Fullstack
- **Priority**: Must Have, Stretch Goal
- **Status**: To Do, In Progress, Done

---

## Timeline

**Total Duration**: 12 weeks

- **Weeks 1-2**: Foundation and setup
- **Weeks 3-6**: Core functionality development
- **Weeks 7-9**: User experience and interface
- **Weeks 10-11**: Advanced features and stretch goals
- **Week 12**: Testing, deployment, and documentation

---

## Conclusion

MacroTrack will serve as a comprehensive nutrition tracking solution that goes beyond simple CRUD operations by incorporating real-time calculations, data visualization, and intelligent features. The integration with Spoonacular API ensures accurate nutritional data while the custom backend provides personalized tracking and goal management.

This project demonstrates full-stack development skills, API integration expertise, and user-centered design principles, making it an ideal showcase piece for a development portfolio.

---

*This proposal outlines a robust, scalable nutrition tracking application that addresses real user needs while demonstrating advanced technical capabilities and thoughtful user experience design.*