// src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-blue-500',
        ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

// src/components/ui/Input.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

// src/components/ui/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-6', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };

// src/components/MacroRing.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroRingProps {
  current: number;
  target: number;
  label: string;
  color: string;
  unit?: string;
}

const MacroRing: React.FC<MacroRingProps> = ({
  current,
  target,
  label,
  color,
  unit = 'g'
}) => {
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
};

export default MacroRing;

// src/contexts/AuthContext.tsx - Global State Management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    height: { value: number; unit: 'cm' | 'inches' };
    weight: { value: number; unit: 'kg' | 'lbs' };
    activityLevel: string;
  };
  goals: {
    dailyCalories: number;
    macroTargets: {
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  };
  preferences: {
    units: 'metric' | 'imperial';
    timezone: string;
    notifications: {
      mealReminders: boolean;
      goalAchievements: boolean;
      weeklyReports: boolean;
    };
  };
  fullName: string;
  age: number;
  bmr: number;
  tdee: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiService.auth.login({ email, password });
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
      // Store token in localStorage for persistence
      localStorage.setItem('auth-token', response.token);
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiService.auth.register(userData);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token: response.token } 
      });
      localStorage.setItem('auth-token', response.token);
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    dispatch({ type: 'LOGOUT' });
  };

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const response = await apiService.auth.me();
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: response.user, token } 
      });
    } catch (error) {
      localStorage.removeItem('auth-token');
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        setUser,
        clearError,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/services/apiService.ts - Frontend API Client
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : '/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    height: { value: number; unit: 'cm' | 'inches' };
    weight: { value: number; unit: 'kg' | 'lbs' };
    activityLevel: string;
  };
  goals: {
    dailyCalories: number;
    macroTargets: {
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  };
}

interface MealData {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealName?: string;
  foods: any[];
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.error || error.message || 'An error occurred';
        throw new Error(message);
      }
    );
  }

  auth = {
    login: async (credentials: LoginCredentials) => {
      return this.client.post('/auth/login', credentials);
    },

    register: async (userData: RegisterData) => {
      return this.client.post('/auth/register', userData);
    },

    me: async () => {
      return this.client.get('/auth/me');
    },

    logout: async () => {
      return this.client.post('/auth/logout');
    },
  };

  foods = {
    search: async (query: string, limit = 20) => {
      return this.client.get('/foods/search', {
        params: { query, limit }
      });
    },

    getDetails: async (id: number, amount = 100, unit = 'grams') => {
      return this.client.get(`/foods/${id}`, {
        params: { amount, unit }
      });
    },
  };

  meals = {
    getDaily: async (date: string) => {
      return this.client.get(`/meals/daily/${date}`);
    },

    create: async (mealData: MealData) => {
      return this.client.post('/meals', mealData);
    },

    update: async (mealData: MealData) => {
      return this.client.put('/meals', mealData);
    },

    delete: async (mealId: string) => {
      return this.client.delete(`/meals/${mealId}`);
    },
  };

  customFoods = {
    create: async (foodData: any) => {
      return this.client.post('/foods/custom', foodData);
    },

    getAll: async () => {
      return this.client.get('/foods/custom');
    },

    update: async (foodId: string, foodData: any) => {
      return this.client.put(`/foods/custom/${foodId}`, foodData);
    },

    delete: async (foodId: string) => {
      return this.client.delete(`/foods/custom/${foodId}`);
    },
  };

  analytics = {
    getProgress: async (startDate: string, endDate: string) => {
      return this.client.get('/analytics/progress', {
        params: { startDate, endDate }
      });
    },

    getWeeklyStats: async (date: string) => {
      return this.client.get('/analytics/weekly', {
        params: { date }
      });
    },
  };
}

export const apiService = new ApiService();
export default apiService;

// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  const birth = new Date(dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function calculateBMI(weight: number, height: number, weightUnit: 'kg' | 'lbs', heightUnit: 'cm' | 'inches'): number {
  // Convert to metric
  const weightKg = weightUnit === 'kg' ? weight : weight * 0.453592;
  const heightM = heightUnit === 'cm' ? height / 100 : (height * 2.54) / 100;
  
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Macro calculation utilities
export function calculateMacroCalories(protein: number, carbs: number, fat: number): number {
  return (protein * 4) + (carbs * 4) + (fat * 9);
}

export function calculateMacroPercentages(protein: number, carbs: number, fat: number, totalCalories: number) {
  return {
    protein: Math.round((protein * 4 / totalCalories) * 100),
    carbs: Math.round((carbs * 4 / totalCalories) * 100),
    fat: Math.round((fat * 9 / totalCalories) * 100),
  };
}

export function calculateNutritionForAmount(nutrition: any, amount: number, baseAmount: number = 100) {
  const multiplier = amount / baseAmount;
  
  return {
    calories: Math.round(nutrition.calories * multiplier),
    protein: Math.round(nutrition.protein * multiplier * 10) / 10,
    carbohydrates: Math.round(nutrition.carbohydrates * multiplier * 10) / 10,
    fat: Math.round(nutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
    sugar: Math.round((nutrition.sugar || 0) * multiplier * 10) / 10,
    sodium: Math.round((nutrition.sodium || 0) * multiplier * 10) / 10,
  };
}

// Date utilities
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Storage utilities (with fallbacks)
export function safeLocalStorage() {
  try {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    };
  } catch {
    // Fallback for environments where localStorage is not available
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
    };
  }
}

// src/components/Dashboard.tsx - Main Dashboard Component
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import MacroRing from '@/components/MacroRing';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';
import { formatDate } from '@/lib/utils';
import { Plus, TrendingUp, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

interface DailyData {
  dailyTotals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  goalProgress: {
    calories: { target: number; actual: number; percentage: number };
    protein: { target: number; actual: number; percentage: number };
    carbohydrates: { target: number; actual: number; percentage: number };
    fat: { target: number; actual: number; percentage: number };
  };
  meals: Array<{
    mealType: string;
    foods: string[];
    mealTotals: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dateString = formatDate(selectedDate);
        const response = await apiService.meals.getDaily(dateString);
        
        if (response.success) {
          setDailyData(response.mealEntry);
        } else {
          throw new Error('Failed to fetch daily data');
        }
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDailyData();
    }
  }, [user, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const { dailyTotals, goalProgress, meals } = dailyData || {
    dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
    goalProgress: {
      calories: { target: user?.goals.dailyCalories || 2000, actual: 0, percentage: 0 },
      protein: { target: user?.goals.macroTargets.protein || 150, actual: 0, percentage: 0 },
      carbohydrates: { target: user?.goals.macroTargets.carbohydrates || 250, actual: 0, percentage: 0 },
      fat: { target: user?.goals.macroTargets.fat || 65, actual: 0, percentage: 0 },
    },
    meals: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.profile.firstName || 'User'}!</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={formatDate(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <Link href="/log-meal">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(dailyTotals.calories)}</div>
            <div className="text-sm text-gray-600">Calories Today</div>
            <div className="text-xs text-gray-500 mt-1">
              {goalProgress.calories.target - dailyTotals.calories} remaining
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{meals.length}</div>
            <div className="text-sm text-gray-600">Meals Logged</div>
            <div className="text-xs text-gray-500 mt-1">
              {4 - meals.length} meals remaining
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(goalProgress.calories.percentage)}%</div>
            <div className="text-sm text-gray-600">Goal Progress</div>
            <div className="text-xs text-gray-500 mt-1">
              Daily calorie target
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{user?.age || 0}</div>
            <div className="text-sm text-gray-600">Age</div>
            <div className="text-xs text-gray-500 mt-1">
              BMR: {user?.bmr || 0} cal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macro Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Today's Macros
          </CardTitle>
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
          <div className="flex justify-between items-center">
            <CardTitle>Today's Meals</CardTitle>
            <Link href="/progress">
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {meals && meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium capitalize text-gray-900">{meal.mealType}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {meal.foods?.length || 0} items • {Math.round(meal.mealTotals.calories)} calories
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        P: {Math.round(meal.mealTotals.protein)}g • 
                        C: {Math.round(meal.mealTotals.carbohydrates)}g • 
                        F: {Math.round(meal.mealTotals.fat)}g
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No meals logged today</p>
              <Link href="/log-meal">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Meal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/log-meal">
            <CardContent className="p-4 text-center">
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium">Log Meal</h3>
              <p className="text-sm text-gray-600">Add foods to track your intake</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/progress">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium">View Progress</h3>
              <p className="text-sm text-gray-600">See your nutrition trends</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/profile">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium">Update Goals</h3>
              <p className="text-sm text-gray-600">Adjust your macro targets</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;