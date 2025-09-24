// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global is used here to maintain a cached connection across hot reloads in development
declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// src/models/User.ts - MODEL LAYER
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  height: {
    value: number;
    unit: 'cm' | 'inches';
  };
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface IUserGoals {
  goalType: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'build_muscle';
  dailyCalories: number;
  macroTargets: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
  };
  macroPercentages: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  profile: IUserProfile;
  goals: IUserGoals;
  preferences: {
    units: 'metric' | 'imperial';
    timezone: string;
    notifications: {
      mealReminders: boolean;
      goalAchievements: boolean;
      weeklyReports: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateBMR(): number;
  generateTDEE(): number;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  profile: {
    firstName: { 
      type: String, 
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: { 
      type: String, 
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: { 
      type: Date, 
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(date: Date) {
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          return age >= 13 && age <= 120;
        },
        message: 'Age must be between 13 and 120 years'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required']
    },
    height: {
      value: { 
        type: Number, 
        required: [true, 'Height is required'],
        min: [100, 'Height must be at least 100cm or equivalent'],
        max: [300, 'Height cannot exceed 300cm or equivalent']
      },
      unit: { 
        type: String, 
        enum: ['cm', 'inches'], 
        required: [true, 'Height unit is required']
      },
    },
    weight: {
      value: { 
        type: Number, 
        required: [true, 'Weight is required'],
        min: [30, 'Weight must be at least 30kg or equivalent'],
        max: [500, 'Weight cannot exceed 500kg or equivalent']
      },
      unit: { 
        type: String, 
        enum: ['kg', 'lbs'], 
        required: [true, 'Weight unit is required']
      },
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: [true, 'Activity level is required'],
    },
  },
  goals: {
    goalType: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle'],
      default: 'maintain_weight'
    },
    dailyCalories: { 
      type: Number, 
      required: [true, 'Daily calorie goal is required'],
      min: [800, 'Daily calories must be at least 800'],
      max: [10000, 'Daily calories cannot exceed 10000']
    },
    macroTargets: {
      protein: { 
        type: Number, 
        required: [true, 'Protein target is required'],
        min: [0, 'Protein cannot be negative']
      },
      carbohydrates: { 
        type: Number, 
        required: [true, 'Carbohydrates target is required'],
        min: [0, 'Carbohydrates cannot be negative']
      },
      fat: { 
        type: Number, 
        required: [true, 'Fat target is required'],
        min: [0, 'Fat cannot be negative']
      },
      fiber: { 
        type: Number, 
        default: 25,
        min: [0, 'Fiber cannot be negative']
      },
    },
    macroPercentages: {
      protein: { 
        type: Number, 
        min: [5, 'Protein percentage must be at least 5%'],
        max: [50, 'Protein percentage cannot exceed 50%']
      },
      carbohydrates: { 
        type: Number, 
        min: [10, 'Carbohydrates percentage must be at least 10%'],
        max: [80, 'Carbohydrates percentage cannot exceed 80%']
      },
      fat: { 
        type: Number, 
        min: [10, 'Fat percentage must be at least 10%'],
        max: [60, 'Fat percentage cannot exceed 60%']
      },
    },
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      mealReminders: { type: Boolean, default: true },
      goalAchievements: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
    }
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Calculate macro percentages before saving
UserSchema.pre('save', function(next) {
  if (this.isModified('goals.macroTargets') || this.isModified('goals.dailyCalories')) {
    const { protein, carbohydrates, fat } = this.goals.macroTargets;
    const totalCalories = this.goals.dailyCalories;
    
    this.goals.macroPercentages = {
      protein: Math.round((protein * 4 / totalCalories) * 100),
      carbohydrates: Math.round((carbohydrates * 4 / totalCalories) * 100),
      fat: Math.round((fat * 9 / totalCalories) * 100),
    };
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
UserSchema.methods.generateBMR = function(): number {
  const { weight, height, dateOfBirth, gender } = this.profile;
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  
  // Convert to metric if needed
  let weightKg = weight.unit === 'kg' ? weight.value : weight.value * 0.453592;
  let heightCm = height.unit === 'cm' ? height.value : height.value * 2.54;
  
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  return Math.round(bmr);
};

// Calculate TDEE (Total Daily Energy Expenditure)
UserSchema.methods.generateTDEE = function(): number {
  const bmr = this.generateBMR();
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * multipliers[this.profile.activityLevel]);
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for age
UserSchema.virtual('age').get(function() {
  const now = new Date();
  const birth = new Date(this.profile.dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

// src/models/MealEntry.ts - MODEL LAYER
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
}

export interface IFood {
  spoonacularId?: number;
  customFoodId?: string;
  name: string;
  amount: number;
  unit: string;
  nutritionPer100g: INutrition;
  actualNutrition: INutrition;
  addedAt: Date;
  isCustomFood: boolean;
}

export interface IMeal {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealName?: string;
  foods: IFood[];
  mealTotals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export interface IGoalProgress {
  target: number;
  actual: number;
  percentage: number;
  remaining: number;
}

export interface IMealEntry extends Document {
  _id: string;
  userId: string;
  date: Date;
  meals: IMeal[];
  dailyTotals: INutrition;
  goalProgress: {
    calories: IGoalProgress;
    protein: IGoalProgress;
    carbohydrates: IGoalProgress;
    fat: IGoalProgress;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NutritionSchema = new Schema<INutrition>({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbohydrates: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, default: 0, min: 0 },
  sugar: { type: Number, default: 0, min: 0 },
  sodium: { type: Number, default: 0, min: 0 },
  potassium: { type: Number, default: 0, min: 0 },
  calcium: { type: Number, default: 0, min: 0 },
  iron: { type: Number, default: 0, min: 0 },
}, { _id: false });

const FoodSchema = new Schema<IFood>({
  spoonacularId: { type: Number },
  customFoodId: { type: Schema.Types.ObjectId, ref: 'CustomFood' },
  name: { 
    type: String, 
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [200, 'Food name cannot exceed 200 characters']
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'], 
    min: [0.1, 'Amount must be at least 0.1'],
    max: [10000, 'Amount cannot exceed 10000']
  },
  unit: { 
    type: String, 
    required: [true, 'Unit is required'],
    enum: ['grams', 'cups', 'pieces', 'tablespoons', 'teaspoons', 'ounces', 'pounds']
  },
  nutritionPer100g: { type: NutritionSchema, required: true },
  actualNutrition: { type: NutritionSchema, required: true },
  addedAt: { type: Date, default: Date.now },
  isCustomFood: { type: Boolean, default: false },
}, { _id: false });

const MealTotalsSchema = new Schema({
  calories: { type: Number, default: 0, min: 0 },
  protein: { type: Number, default: 0, min: 0 },
  carbohydrates: { type: Number, default: 0, min: 0 },
  fat: { type: Number, default: 0, min: 0 },
  fiber: { type: Number, default: 0, min: 0 },
}, { _id: false });

const MealSchema = new Schema<IMeal>({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Meal type is required'],
  },
  mealName: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Meal name cannot exceed 100 characters']
  },
  foods: [FoodSchema],
  mealTotals: { type: MealTotalsSchema, required: true },
}, { _id: false });

const GoalProgressSchema = new Schema({
  target: { type: Number, required: true, min: 0 },
  actual: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0 },
  remaining: { type: Number, required: true },
}, { _id: false });

const MealEntrySchema = new Schema<IMealEntry>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
    validate: {
      validator: function(date: Date) {
        return date <= new Date();
      },
      message: 'Cannot log meals for future dates'
    }
  },
  meals: [MealSchema],
  dailyTotals: { type: NutritionSchema, required: true },
  goalProgress: {
    calories: { type: GoalProgressSchema, required: true },
    protein: { type: GoalProgressSchema, required: true },
    carbohydrates: { type: GoalProgressSchema, required: true },
    fat: { type: GoalProgressSchema, required: true },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
MealEntrySchema.index({ userId: 1, date: -1 });
MealEntrySchema.index({ userId: 1, createdAt: -1 });
MealEntrySchema.index({ userId: 1, date: 1 }, { unique: true }); // One entry per user per day

// Validate that meal totals match sum of foods
MealEntrySchema.pre('save', function(next) {
  this.meals.forEach(meal => {
    const calculatedTotals = meal.foods.reduce((totals, food) => {
      return {
        calories: totals.calories + food.actualNutrition.calories,
        protein: totals.protein + food.actualNutrition.protein,
        carbohydrates: totals.carbohydrates + food.actualNutrition.carbohydrates,
        fat: totals.fat + food.actualNutrition.fat,
        fiber: totals.fiber + food.actualNutrition.fiber,
      };
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 });
    
    meal.mealTotals = calculatedTotals;
  });
  
  // Calculate daily totals
  const dailyTotals = this.meals.reduce((totals, meal) => {
    return {
      calories: totals.calories + meal.mealTotals.calories,
      protein: totals.protein + meal.mealTotals.protein,
      carbohydrates: totals.carbohydrates + meal.mealTotals.carbohydrates,
      fat: totals.fat + meal.mealTotals.fat,
      fiber: totals.fiber + meal.mealTotals.fiber,
      sugar: totals.sugar || 0,
      sodium: totals.sodium || 0,
      potassium: totals.potassium || 0,
      calcium: totals.calcium || 0,
      iron: totals.iron || 0,
    };
  }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0 });
  
  this.dailyTotals = dailyTotals;
  next();
});

const MealEntry: Model<IMealEntry> = mongoose.models.MealEntry || mongoose.model<IMealEntry>('MealEntry', MealEntrySchema);

export default MealEntry;

// src/models/CustomFood.ts - MODEL LAYER
import mongoose, { Document, Schema, Model } from 'mongoose';
import { INutrition } from './MealEntry';

export interface ICustomFood extends Document {
  _id: string;
  userId: string;
  name: string;
  brand?: string;
  category: string;
  baseServing: {
    amount: number;
    unit: string;
    description: string;
  };
  nutritionPerServing: INutrition;
  nutritionPer100g: INutrition;
  alternativeServings: Array<{
    amount: number;
    unit: string;
    description: string;
    gramsEquivalent: number;
  }>;
  isPublic: boolean;
  isVerified: boolean;
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlternativeServingSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  description: { type: String, required: true },
  gramsEquivalent: { type: Number, required: true, min: 0 },
}, { _id: false });

const CustomFoodSchema = new Schema<ICustomFood>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [200, 'Food name cannot exceed 200 characters'],
    index: true,
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'fats', 'beverages', 'snacks', 'other'],
  },
  baseServing: {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    description: { type: String, required: true },
  },
  nutritionPerServing: {
    type: Schema.Types.Mixed,
    required: [true, 'Nutrition per serving is required']
  },
  nutritionPer100g: {
    type: Schema.Types.Mixed,
    required: [true, 'Nutrition per 100g is required']
  },
  alternativeServings: [AlternativeServingSchema],
  isPublic: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  timesUsed: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CustomFoodSchema.index({ userId: 1, name: 1 });
CustomFoodSchema.index({ isPublic: 1, name: 'text' });
CustomFoodSchema.index({ timesUsed: -1 });
CustomFoodSchema.index({ category: 1 });

const CustomFood: Model<ICustomFood> = mongoose.models.CustomFood || mongoose.model<ICustomFood>('CustomFood', CustomFoodSchema);

export default CustomFood;