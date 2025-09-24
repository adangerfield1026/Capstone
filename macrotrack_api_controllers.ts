// src/lib/auth.ts - Authentication utilities
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies as fallback
  const tokenFromCookie = request.cookies.get('auth-token');
  if (tokenFromCookie) {
    return tokenFromCookie.value;
  }
  
  return null;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// src/lib/validation.ts - Input validation schemas
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    dateOfBirth: z.string().transform(str => new Date(str)),
    gender: z.enum(['male', 'female', 'other']),
    height: z.object({
      value: z.number().min(100).max(300),
      unit: z.enum(['cm', 'inches']),
    }),
    weight: z.object({
      value: z.number().min(30).max(500),
      unit: z.enum(['kg', 'lbs']),
    }),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  }),
  goals: z.object({
    goalType: z.enum(['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle']).optional(),
    dailyCalories: z.number().min(800).max(10000),
    macroTargets: z.object({
      protein: z.number().min(0),
      carbohydrates: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0).optional(),
    }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const mealSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  mealName: z.string().optional(),
  foods: z.array(z.object({
    spoonacularId: z.number().optional(),
    customFoodId: z.string().optional(),
    name: z.string(),
    amount: z.number().min(0.1),
    unit: z.string(),
    nutritionPer100g: z.object({
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbohydrates: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
    }),
    actualNutrition: z.object({
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbohydrates: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
    }),
    isCustomFood: z.boolean().optional(),
  })),
});

export const customFoodSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  category: z.enum(['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'other']),
  baseServing: z.object({
    amount: z.number().min(0),
    unit: z.string(),
    description: z.string(),
  }),
  nutritionPerServing: z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbohydrates: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0),
  }),
  isPublic: z.boolean().optional(),
});

// src/pages/api/auth/register.ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = new User(validatedData);
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      profile: user.profile,
      goals: user.goals,
      preferences: user.preferences,
      createdAt: user.createdAt,
      fullName: user.fullName,
      age: user.age,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Database validation failed',
        details: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
    });
  }
}

// src/pages/api/auth/login.ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      profile: user.profile,
      goals: user.goals,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt,
      fullName: user.fullName,
      age: user.age,
      bmr: user.generateBMR(),
      tdee: user.generateTDEE(),
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Login failed'
    });
  }
}

// src/pages/api/auth/me.ts - Get current user
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const authUser = await getUserFromRequest(req as any);
    if (!authUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
      profile: user.profile,
      goals: user.goals,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt,
      fullName: user.fullName,
      age: user.age,
      bmr: user.generateBMR(),
      tdee: user.generateTDEE(),
    };

    return res.status(200).json({
      success: true,
      user: userResponse,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to get user'
    });
  }
}

// src/pages/api/foods/search.ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth';
import { spoonacularService } from '@/services/spoonacularService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user authentication
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { query, limit = '20' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Search query is required',
        code: 'MISSING_QUERY'
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters',
        code: 'QUERY_TOO_SHORT'
      });
    }

    const searchResults = await spoonacularService.searchFood(
      query,
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      query,
      results: searchResults,
      count: searchResults.length,
    });

  } catch (error) {
    console.error('Food search error:', error);
    
    if (error.message.includes('API rate limit')) {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    return res.status(500).json({
      error: 'Failed to search foods',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Search failed'
    });
  }
}

// src/pages/api/foods/[id].ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth';
import { spoonacularService } from '@/services/spoonacularService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user authentication
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { id, amount = '100', unit = 'grams' } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Food ID is required',
        code: 'MISSING_ID'
      });
    }

    const foodId = parseInt(id);
    if (isNaN(foodId)) {
      return res.status(400).json({
        error: 'Invalid food ID',
        code: 'INVALID_ID'
      });
    }

    const amountNum = parseFloat(amount as string);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        code: 'INVALID_AMOUNT'
      });
    }

    const foodData = await spoonacularService.getFoodNutrition(
      foodId,
      amountNum,
      unit as string
    );

    return res.status(200).json({
      success: true,
      food: foodData,
      requestedAmount: amountNum,
      requestedUnit: unit,
    });

  } catch (error) {
    console.error('Food details error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Food not found',
        code: 'FOOD_NOT_FOUND'
      });
    }

    if (error.message.includes('API rate limit')) {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    return res.status(500).json({
      error: 'Failed to get food details',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Request failed'
    });
  }
}

// src/pages/api/meals/daily/[date].ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import MealEntry from '@/models/MealEntry';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        error: 'Date is required',
        code: 'MISSING_DATE'
      });
    }

    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        code: 'INVALID_DATE'
      });
    }

    // Get start and end of day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const mealEntry = await MealEntry.findOne({
      userId: user.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!mealEntry) {
      // Get user's goals for empty meal structure
      const userData = await User.findById(user.userId);
      const emptyGoals = userData ? {
        calories: { target: userData.goals.dailyCalories, actual: 0, percentage: 0, remaining: userData.goals.dailyCalories },
        protein: { target: userData.goals.macroTargets.protein, actual: 0, percentage: 0, remaining: userData.goals.macroTargets.protein },
        carbohydrates: { target: userData.goals.macroTargets.carbohydrates, actual: 0, percentage: 0, remaining: userData.goals.macroTargets.carbohydrates },
        fat: { target: userData.goals.macroTargets.fat, actual: 0, percentage: 0, remaining: userData.goals.macroTargets.fat },
      } : null;

      return res.status(200).json({
        success: true,
        mealEntry: {
          date: date,
          meals: [],
          dailyTotals: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
          },
          goalProgress: emptyGoals,
        },
        isEmpty: true,
      });
    }

    return res.status(200).json({
      success: true,
      mealEntry,
      isEmpty: false,
    });

  } catch (error) {
    console.error('Get daily meals error:', error);
    return res.status(500).json({
      error: 'Failed to get daily meals',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Request failed'
    });
  }
}

// src/pages/api/meals/index.ts - CONTROLLER LAYER
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import MealEntry from '@/models/MealEntry';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { mealSchema } from '@/lib/validation';
import { z } from 'zod';

// Helper function to calculate goal progress
function calculateGoalProgress(actual: number, target: number) {
  return {
    target,
    actual: Math.round(actual * 100) / 100,
    percentage: target > 0 ? Math.round((actual / target) * 100) : 0,
    remaining: Math.max(0, target - actual),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'PUT'].includes(req.method!)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const user = await getUserFromRequest(req as any);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const validatedData = mealSchema.parse(req.body);

    // Get user's goals
    const userData = await User.findById(user.userId);
    if (!userData) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Find or create meal entry for the date
    const startOfDay = new Date(validatedData.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(validatedData.date);
    endOfDay.setHours(23, 59, 59, 999);

    let mealEntry = await MealEntry.findOne({
      userId: user.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const newMeal = {
      mealType: validatedData.mealType,
      mealName: validatedData.mealName,
      foods: validatedData.foods.map(food => ({
        ...food,
        addedAt: new Date(),
        isCustomFood: food.isCustomFood || false,
      })),
      mealTotals: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
      },
    };

    if (!mealEntry) {
      // Create new meal entry
      mealEntry = new MealEntry({
        userId: user.userId,
        date: validatedData.date,
        meals: [newMeal],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          potassium: 0,
          calcium: 0,
          iron: 0,
        },
        goalProgress: {
          calories: calculateGoalProgress(0, userData.goals.dailyCalories),
          protein: calculateGoalProgress(0, userData.goals.macroTargets.protein),
          carbohydrates: calculateGoalProgress(0, userData.goals.macroTargets.carbohydrates),
          fat: calculateGoalProgress(0, userData.goals.macroTargets.fat),
        },
      });
    } else {
      // Update existing meal entry
      const existingMealIndex = mealEntry.meals.findIndex(
        meal => meal.mealType === validatedData.mealType
      );

      if (existingMealIndex >= 0) {
        // Replace existing meal
        mealEntry.meals[existingMealIndex] = newMeal;
      } else {
        // Add new meal
        mealEntry.meals.push(newMeal);
      }
    }

    await mealEntry.save();

    // Update goal progress after saving (calculations happen in pre-save hook)
    const savedMealEntry = await MealEntry.findById(mealEntry._id);
    
    if (savedMealEntry) {
      savedMealEntry.goalProgress = {
        calories: calculateGoalProgress(savedMealEntry.dailyTotals.calories, userData.goals.dailyCalories),
        protein: calculateGoalProgress(savedMealEntry.dailyTotals.protein, userData.goals.macroTargets.protein),
        carbohydrates: calculateGoalProgress(savedMealEntry.dailyTotals.carbohydrates, userData.goals.macroTargets.carbohydrates),
        fat: calculateGoalProgress(savedMealEntry.dailyTotals.fat, userData.goals.macroTargets.fat),
      };
      
      await savedMealEntry.save();
    }

    return res.status(req.method === 'POST' ? 201 : 200).json({
      success: true,
      message: req.method === 'POST' ? 'Meal created successfully' : 'Meal updated successfully',
      mealEntry: savedMealEntry,
    });

  } catch (error) {
    console.error('Create/Update meal error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Database validation failed',
        details: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      error: 'Failed to save meal entry',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Operation failed'
    });
  }
}

// src/services/spoonacularService.ts - External API Service
import axios, { AxiosInstance } from 'axios';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

if (!SPOONACULAR_API_KEY) {
  console.warn('SPOONACULAR_API_KEY not found. Food search will use mock data.');
}

export interface SpoonacularSearchResult {
  id: number;
  name: string;
  image: string;
}

export interface SpoonacularNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
}

export interface SpoonacularFood {
  id: number;
  name: string;
  image: string;
  nutrition: SpoonacularNutrition;
}

class SpoonacularService {
  private apiClient: AxiosInstance;
  private mockMode: boolean;

  constructor() {
    this.mockMode = !SPOONACULAR_API_KEY;
    
    if (!this.mockMode) {
      this.apiClient = axios.create({
        baseURL: BASE_URL,
        timeout: 10000,
        params: {
          apiKey: SPOONACULAR_API_KEY,
        },
      });

      // Add request interceptor for rate limiting
      this.apiClient.interceptors.request.use((config) => {
        console.log(`Spoonacular API call: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });

      // Add response interceptor for error handling
      this.apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 402) {
            throw new Error('API rate limit exceeded or quota reached');
          }
          if (error.response?.status === 404) {
            throw new Error('Food not found in database');
          }
          throw error;
        }
      );
    }
  }

  async searchFood(query: string, limit = 20): Promise<SpoonacularSearchResult[]> {
    if (this.mockMode) {
      return this.getMockSearchResults(query, limit);
    }

    try {
      const response = await this.apiClient.get('/food/ingredients/search', {
        params: {
          query,
          number: limit,
          sort: 'calories',
          sortDirection: 'desc',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Spoonacular search error:', error);
      // Fallback to mock data if API fails
      return this.getMockSearchResults(query, limit);
    }
  }

  async getFoodNutrition(id: number, amount = 100, unit = 'grams'): Promise<SpoonacularFood> {
    if (this.mockMode) {
      return this.getMockNutritionData(id, amount, unit);
    }

    try {
      const response = await this.apiClient.get(`/food/ingredients/${id}/information`, {
        params: {
          amount,
          unit,
        },
      });

      const data = response.data;
      const nutrition = data.nutrition?.nutrients || [];

      // Extract specific nutrients
      const getNutrient = (name: string) => {
        const nutrient = nutrition.find((n: any) => 
          n.name.toLowerCase().includes(name.toLowerCase())
        );
        return nutrient ? Math.round(nutrient.amount * 100) / 100 : 0;
      };

      return {
        id: data.id,
        name: data.name,
        image: data.image || '',
        nutrition: {
          calories: getNutrient('calories'),
          protein: getNutrient('protein'),
          carbohydrates: getNutrient('carbohydrates'),
          fat: getNutrient('fat'),
          fiber: getNutrient('fiber'),
          sugar: getNutrient('sugar'),
          sodium: getNutrient('sodium'),
        },
      };
    } catch (error) {
      console.error('Spoonacular nutrition error:', error);
      // Fallback to mock data if API fails
      return this.getMockNutritionData(id, amount, unit);
    }
  }

  private getMockSearchResults(query: string, limit: number): SpoonacularSearchResult[] {
    const mockFoods = [
      { id: 1, name: 'Chicken Breast', image: 'chicken-breast.jpg' },
      { id: 2, name: 'Brown Rice', image: 'brown-rice.jpg' },
      { id: 3, name: 'Broccoli', image: 'broccoli.jpg' },
      { id: 4, name: 'Salmon Fillet', image: 'salmon.jpg' },
      { id: 5, name: 'Greek Yogurt', image: 'greek-yogurt.jpg' },
      { id: 6, name: 'Oatmeal', image: 'oatmeal.jpg' },
      { id: 7, name: 'Sweet Potato', image: 'sweet-potato.jpg' },
      { id: 8, name: 'Spinach', image: 'spinach.jpg' },
      { id: 9, name: 'Almonds', image: 'almonds.jpg' },
      { id: 10, name: 'Banana', image: 'banana.jpg' },
    ];
    
    return mockFoods
      .filter(food => food.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  private getMockNutritionData(id: number, amount: number, unit: string): SpoonacularFood {
    const mockNutrition: Record<number, SpoonacularNutrition> = {
      1: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      2: { calories: 123, protein: 2.6, carbohydrates: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
      3: { calories: 34, protein: 2.8, carbohydrates: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
      4: { calories: 208, protein: 25, carbohydrates: 0, fat: 12, fiber: 0, sugar: 0, sodium: 67 },
      5: { calories: 59, protein: 10, carbohydrates: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 36 },
      6: { calories: 68, protein: 2.4, carbohydrates: 12, fat: 1.4, fiber: 1.7, sugar: 0.8, sodium: 49 },
      7: { calories: 86, protein: 1.6, carbohydrates: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 54 },
      8: { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
      9: { calories: 579, protein: 21, carbohydrates: 22, fat: 50, fiber: 12, sugar: 4.3, sodium: 1 },
      10: { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
    };
    
    const baseNutrition = mockNutrition[id] || mockNutrition[1];
    const multiplier = amount / 100;
    
    const scaledNutrition: SpoonacularNutrition = {
      calories: Math.round(baseNutrition.calories * multiplier),
      protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
      carbohydrates: Math.round(baseNutrition.carbohydrates * multiplier * 10) / 10,
      fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
      fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
      sugar: Math.round((baseNutrition.sugar || 0) * multiplier * 10) / 10,
      sodium: Math.round((baseNutrition.sodium || 0) * multiplier * 10) / 10,
    };

    return {
      id,
      name: `Mock Food ${id}`,
      image: `mock-food-${id}.jpg`,
      nutrition: scaledNutrition,
    };
  }
}

export const spoonacularService = new SpoonacularService();