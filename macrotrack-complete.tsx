import React, { useState, useEffect, createContext, useContext, useReducer } from 'react';
import { Home, Plus, TrendingUp, User, LogOut, Search, Calendar, Target, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

// Utility functions
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function calculateBMR(weight, height, age, gender) {
  return gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
}

function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

// Mock API service
const mockApiService = {
  searchFoods: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockFoods = [
      { id: 1, name: 'Chicken Breast', image: 'chicken-breast.jpg' },
      { id: 2, name: 'Brown Rice', image: 'brown-rice.jpg' },
      { id: 3, name: 'Broccoli', image: 'broccoli.jpg' },
      { id: 4, name: 'Salmon Fillet', image: 'salmon.jpg' },
      { id: 5, name: 'Greek Yogurt', image: 'greek-yogurt.jpg' },
      { id: 6, name: 'Oatmeal', image: 'oatmeal.jpg' },
    ].filter(food => food.name.toLowerCase().includes(query.toLowerCase()));
    return mockFoods;
  },

  getFoodDetails: async (id, amount = 100) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockNutrition = {
      1: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0 },
      2: { calories: 123, protein: 2.6, carbohydrates: 23, fat: 0.9, fiber: 1.8 },
      3: { calories: 34, protein: 2.8, carbohydrates: 7, fat: 0.4, fiber: 2.6 },
      4: { calories: 208, protein: 25, carbohydrates: 0, fat: 12, fiber: 0 },
      5: { calories: 59, protein: 10, carbohydrates: 3.6, fat: 0.4, fiber: 0 },
      6: { calories: 68, protein: 2.4, carbohydrates: 12, fat: 1.4, fiber: 1.7 },
    };
    
    const baseNutrition = mockNutrition[id] || mockNutrition[1];
    const multiplier = amount / 100;
    
    return {
      food: {
        id,
        name: `Food ${id}`,
        nutrition: {
          calories: Math.round(baseNutrition.calories * multiplier),
          protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
          carbohydrates: Math.round(baseNutrition.carbohydrates * multiplier * 10) / 10,
          fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
          fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
        }
      }
    };
  }
};

// Auth Context
const AuthContext = createContext();

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
  });

  const login = (user, token) => {
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// UI Components
function Button({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, type = 'button', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  return (
    <button
      type={type}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Card({ children, className = '', ...props }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }) {
  return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
}

function CardTitle({ children, className = '' }) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}

function CardContent({ children, className = '' }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

// MacroRing Component
function MacroRing({ current, target, label, color, unit = 'g' }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(target - current, 0);

  const data = [
    { name: 'consumed', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ];

  const COLORS = [color, '#e5e7eb'];

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={450}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-bold">{Math.round(current)}</div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-500">
          {remaining.toFixed(0)}{unit} remaining
        </div>
        <div className="text-xs text-gray-400">
          {percentage.toFixed(0)}% of {target}{unit}
        </div>
      </div>
    </div>
  );
}

// FoodSearch Component
function FoodSearch({ onFoodSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [amount, setAmount] = useState(100);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [foodDetails, setFoodDetails] = useState(null);

  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await mockApiService.searchFoods(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const getFoodDetails = async () => {
      if (!selectedFood) {
        setFoodDetails(null);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const details = await mockApiService.getFoodDetails(selectedFood.id, amount);
        setFoodDetails(details);
      } catch (error) {
        console.error('Food details error:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    getFoodDetails();
  }, [selectedFood, amount]);

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (foodDetails && selectedFood) {
      onFoodSelect({
        ...foodDetails.food,
        name: selectedFood.name,
        amount,
        unit: 'grams',
      });
      setSelectedFood(null);
      setSearchQuery('');
      setAmount(100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search for foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((food) => (
            <Card
              key={food.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleFoodSelect(food)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    🍎
                  </div>
                  <div>
                    <h3 className="font-medium">{food.name}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedFood && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedFood.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFood(null)}
                >
                  ×
                </Button>
              </div>

              {/* Amount Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount (grams)</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(Math.max(1, amount - 10))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amount + 10)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Nutrition Preview */}
              {isLoadingDetails && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {foodDetails && (
                <div className="space-y-2">
                  <h4 className="font-medium">Nutrition per {amount}g:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {Math.round(foodDetails.food.nutrition.calories)}</div>
                    <div>Protein: {Math.round(foodDetails.food.nutrition.protein)}g</div>
                    <div>Carbs: {Math.round(foodDetails.food.nutrition.carbohydrates)}g</div>
                    <div>Fat: {Math.round(foodDetails.food.nutrition.fat)}g</div>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <Button
                onClick={handleAddFood}
                disabled={!foodDetails}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState({
    dailyTotals: { calories: 1450, protein: 95, carbohydrates: 180, fat: 45 },
    goalProgress: {
      calories: { target: 2000, actual: 1450, percentage: 72.5 },
      protein: { target: 150, actual: 95, percentage: 63.3 },
      carbohydrates: { target: 250, actual: 180, percentage: 72 },
      fat: { target: 65, actual: 45, percentage: 69.2 },
    },
    meals: [
      {
        mealType: 'breakfast',
        foods: ['Oatmeal', 'Greek Yogurt'],
        mealTotals: { calories: 350, protein: 18, carbohydrates: 45, fat: 8 }
      },
      {
        mealType: 'lunch',
        foods: ['Chicken Breast', 'Brown Rice', 'Broccoli'],
        mealTotals: { calories: 520, protein: 42, carbohydrates: 65, fat: 12 }
      },
      {
        mealType: 'dinner',
        foods: ['Salmon Fillet', 'Sweet Potato'],
        mealTotals: { calories: 580, protein: 35, carbohydrates: 70, fat: 25 }
      }
    ]
  });

  const { dailyTotals, goalProgress, meals } = dailyData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Track your daily nutrition goals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(dailyTotals.calories)}</div>
            <div className="text-sm text-gray-600">Calories Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{meals.length}</div>
            <div className="text-sm text-gray-600">Meals Logged</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(goalProgress.calories.percentage)}%</div>
            <div className="text-sm text-gray-600">Goal Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">7</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Macro Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MacroRing
              current={dailyTotals.calories}
              target={goalProgress.calories.target}
              label="Calories"
              color="#3b82f6"
              unit=""
            />
            <MacroRing
              current={dailyTotals.protein}
              target={goalProgress.protein.target}
              label="Protein"
              color="#10b981"
              unit="g"
            />
            <MacroRing
              current={dailyTotals.carbohydrates}
              target={goalProgress.carbohydrates.target}
              label="Carbs"
              color="#f59e0b"
              unit="g"
            />
            <MacroRing
              current={dailyTotals.fat}
              target={goalProgress.fat.target}
              label="Fat"
              color="#ef4444"
              unit="g"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium capitalize">{meal.mealType}</h4>
                  <div className="text-sm text-gray-600">
                    {meal.foods.length} items • {Math.round(meal.mealTotals.calories)} calories
                  </div>
                  <div className="text-xs text-gray-500">
                    P: {Math.round(meal.mealTotals.protein)}g • 
                    C: {Math.round(meal.mealTotals.carbohydrates)}g • 
                    F: {Math.round(meal.mealTotals.fat)}g
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No meals logged today. Start by adding your first meal!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// MealLogger Component
function MealLogger() {
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'snack', label: 'Snack', icon: '🍎' },
  ];

  const handleFoodSelect = (food) => {
    setSelectedFoods(prev => [...prev, food]);
    setShowFoodSearch(false);
  };

  const handleRemoveFood = (index) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSelectedFoods([]);
      alert('Meal saved successfully!');
    } catch (error) {
      console.error('Failed to save meal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalNutrition = selectedFoods.reduce((totals, food) => {
    const multiplier = food.amount / 100;
    return {
      calories: totals.calories + (food.nutrition.calories * multiplier),
      protein: totals.protein + (food.nutrition.protein * multiplier),
      carbohydrates: totals.carbohydrates + (food.nutrition.carbohydrates * multiplier),
      fat: totals.fat + (food.nutrition.fat * multiplier),
    };
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log Meal</h1>
        <p className="text-gray-600">Add foods to track your daily nutrition</p>
      </div>

      {/* Meal Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Meal Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MEAL_TYPES.map((meal) => (
              <Button
                key={meal.id}
                variant={selectedMealType === meal.id ? 'primary' : 'outline'}
                onClick={() => setSelectedMealType(meal.id)}
                className="flex flex-col items-center space-y-1 h-auto py-3"
              >
                <span className="text-lg">{meal.icon}</span>
                <span className="text-sm">{meal.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Meal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{selectedMealType} Foods</CardTitle>
            <Button
              onClick={() => setShowFoodSearch(!showFoodSearch)}
              size="sm"
            >
              {showFoodSearch ? 'Cancel' : 'Add Food'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Food Search */}
          {showFoodSearch && (
            <div className="mb-6">
              <FoodSearch onFoodSelect={handleFoodSelect} />
            </div>
          )}

          {/* Selected Foods */}
          {selectedFoods.length > 0 ? (
            <div className="space-y-3">
              {selectedFoods.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-gray-600">
                      {food.amount}g • {Math.round(food.nutrition.calories * (food.amount / 100))} cal
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {/* Meal Totals */}
              <div className="border-t pt-3 mt-4">
                <h4 className="font-medium mb-2">Meal Totals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{Math.round(totalNutrition.calories)}</div>
                    <div className="text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{Math.round(totalNutrition.protein)}g</div>
                    <div className="text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{Math.round(totalNutrition.carbohydrates)}g</div>
                    <div className="text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{Math.round(totalNutrition.fat)}g</div>
                    <div className="text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveMeal}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Save Meal'}
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No foods added yet. Click "Add Food" to start building your meal.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Progress Component
function Progress() {
  const weeklyData = [
    { day: 'Mon', calories: 1850, protein: 140, carbs: 200, fat: 60 },
    { day: 'Tue', calories: 2100, protein: 160, carbs: 230, fat: 70 },
    { day: 'Wed', calories: 1950, protein: 150, carbs: 210, fat: 65 },
    { day: 'Thu', calories: 2050, protein: 155, carbs: 220, fat: 68 },
    { day: 'Fri', calories: 1900, protein: 145, carbs: 205, fat: 62 },
    { day: 'Sat', calories: 2200, protein: 170, carbs: 240, fat: 75 },
    { day: 'Sun', calories: 1800, protein: 135, carbs: 195, fat: 58 },
  ];

  const monthlyProgress = [
    { week: 'Week 1', avgCalories: 1950, goalHit: 85 },
    { week: 'Week 2', avgCalories: 2050, goalHit: 90 },
    { week: 'Week 3', avgCalories: 1900, goalHit: 80 },
    { week: 'Week 4', avgCalories: 2000, goalHit: 88 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
        <p className="text-gray-600">Track your nutrition trends and achievements</p>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">6/7</div>
            <div className="text-sm text-gray-600">Days Goal Met</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">1,979</div>
            <div className="text-sm text-gray-600">Avg Daily Calories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">147g</div>
            <div className="text-sm text-gray-600">Avg Daily Protein</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Macro Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Macro Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="protein" fill="#10b981" />
                <Bar dataKey="carbs" fill="#f59e0b" />
                <Bar dataKey="fat" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Goal Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="goalHit" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile Component
function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    age: 28,
    height: 175,
    weight: 70,
    activityLevel: 'moderate',
    goals: {
      dailyCalories: 2000,
      protein: 150,
      carbohydrates: 250,
      fat: 65
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, 'male');
  const tdee = calculateTDEE(bmr, profileData.activityLevel);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and nutrition goals</p>
        </div>
        <Button variant="destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profileData.firstName}
              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
              disabled={!isEditing}
            />
            <Input
              label="Last Name"
              value={profileData.lastName}
              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
            />
            <Input
              label="Age"
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              disabled={!isEditing}
            />
            <Input
              label="Height (cm)"
              type="number"
              value={profileData.height}
              onChange={(e) => setProfileData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              disabled={!isEditing}
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={profileData.weight}
              onChange={(e) => setProfileData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
              disabled={!isEditing}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            <select
              value={profileData.activityLevel}
              onChange={(e) => setProfileData(prev => ({ ...prev, activityLevel: e.target.value }))}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (light exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (very hard exercise, physical job)</option>
            </select>
          </div>

          {isEditing && (
            <div className="mt-6">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculated Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Metabolic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{bmr}</div>
              <div className="text-sm text-gray-600">BMR (calories/day)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{tdee}</div>
              <div className="text-sm text-gray-600">TDEE (calories/day)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{(profileData.weight / Math.pow(profileData.height / 100, 2)).toFixed(1)}</div>
              <div className="text-sm text-gray-600">BMI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Calories"
              type="number"
              value={profileData.goals.dailyCalories}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                goals: { ...prev.goals, dailyCalories: parseInt(e.target.value) }
              }))}
              disabled={!isEditing}
            />
            <Input
              label="Protein (g)"
              type="number"
              value={profileData.goals.protein}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                goals: { ...prev.goals, protein: parseInt(e.target.value) }
              }))}
              disabled={!isEditing}
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={profileData.goals.carbohydrates}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                goals: { ...prev.goals, carbohydrates: parseInt(e.target.value) }
              }))}
              disabled={!isEditing}
            />
            <Input
              label="Fat (g)"
              type="number"
              value={profileData.goals.fat}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                goals: { ...prev.goals, fat: parseInt(e.target.value) }
              }))}
              disabled={!isEditing}
            />
          </div>

          {/* Macro Distribution */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Macro Distribution</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="font-bold">{Math.round((profileData.goals.protein * 4 / profileData.goals.dailyCalories) * 100)}%</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="font-bold">{Math.round((profileData.goals.carbohydrates * 4 / profileData.goals.dailyCalories) * 100)}%</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="font-bold">{Math.round((profileData.goals.fat * 9 / profileData.goals.dailyCalories) * 100)}%</div>
                <div className="text-gray-600">Fat</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AuthForm Component
function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    activityLevel: '',
    dailyCalories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login/register
      const mockUser = {
        id: '1',
        email: formData.email,
        profile: {
          firstName: formData.firstName || 'John',
          lastName: formData.lastName || 'Doe',
        },
        goals: {
          dailyCalories: parseInt(formData.dailyCalories) || 2000,
          macroTargets: {
            protein: parseInt(formData.protein) || 150,
            carbohydrates: parseInt(formData.carbohydrates) || 250,
            fat: parseInt(formData.fat) || 65,
          }
        }
      };
      
      login(mockUser, 'mock-token');
    } catch (error) {
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-center text-gray-600">
            {isLogin ? 'Sign in to track your nutrition' : 'Join MacroTrack to start your journey'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              required
            />

            {/* Registration-only fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                  />
                </div>

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    error={errors.height}
                    min="100"
                    max="250"
                    required
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    error={errors.weight}
                    min="30"
                    max="300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (very hard exercise, physical job)</option>
                  </select>
                  {errors.activityLevel && (
                    <p className="text-sm text-red-600 mt-1">{errors.activityLevel}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Daily Goals</h3>
                  <div className="space-y-3">
                    <Input
                      label="Daily Calories"
                      type="number"
                      value={formData.dailyCalories}
                      onChange={(e) => handleInputChange('dailyCalories', e.target.value)}
                      error={errors.dailyCalories}
                      min="800"
                      max="5000"
                      placeholder="2000"
                      required
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Protein (g)"
                        type="number"
                        value={formData.protein}
                        onChange={(e) => handleInputChange('protein', e.target.value)}
                        error={errors.protein}
                        min="0"
                        placeholder="150"
                        required
                      />
                      <Input
                        label="Carbs (g)"
                        type="number"
                        value={formData.carbohydrates}
                        onChange={(e) => handleInputChange('carbohydrates', e.target.value)}
                        error={errors.carbohydrates}
                        min="0"
                        placeholder="250"
                        required
                      />
                      <Input
                        label="Fat (g)"
                        type="number"
                        value={formData.fat}
                        onChange={(e) => handleInputChange('fat', e.target.value)}
                        error={errors.fat}
                        min="0"
                        placeholder="65"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            {/* Error Messages */}
            {errors.general && (
              <div className="text-red-600 text-sm text-center">
                {errors.general}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App Layout
function AppLayout() {
  const [activeView, setActiveView] = useState('dashboard');
  const { user, logout } = useAuth();

  const NAVIGATION_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, component: Dashboard },
    { id: 'log-meal', label: 'Log Meal', icon: Plus, component: MealLogger },
    { id: 'progress', label: 'Progress', icon: TrendingUp, component: Progress },
    { id: 'profile', label: 'Profile', icon: User, component: Profile },
  ];

  const ActiveComponent = NAVIGATION_ITEMS.find(item => item.id === activeView)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">MacroTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.profile?.firstName || 'User'}!
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors',
                        activeView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

// Main App Component
function MacroTrackApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <AuthForm />;
}

// App Root with Providers
export default function App() {
  return (
    <AuthProvider>
      <MacroTrackApp />
    </AuthProvider>
  );
}