// __tests__/components/Dashboard.test.tsx - React Component Tests
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import { apiService } from '@/services/apiService';

// Mock the API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    meals: {
      getDaily: jest.fn(),
    },
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

// Mock Recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male' as const,
    height: { value: 180, unit: 'cm' as const },
    weight: { value: 75, unit: 'kg' as const },
    activityLevel: 'moderate',
  },
  goals: {
    dailyCalories: 2000,
    macroTargets: {
      protein: 150,
      carbohydrates: 250,
      fat: 65,
    },
  },
  preferences: {
    units: 'metric' as const,
    timezone: 'UTC',
    notifications: {
      mealReminders: true,
      goalAchievements: true,
      weeklyReports: false,
    },
  },
  fullName: 'John Doe',
  age: 34,
  bmr: 1650,
  tdee: 2000,
};

const mockDailyData = {
  success: true,
  mealEntry: {
    dailyTotals: {
      calories: 1500,
      protein: 100,
      carbohydrates: 180,
      fat: 50,
      fiber: 25,
    },
    goalProgress: {
      calories: { target: 2000, actual: 1500, percentage: 75 },
      protein: { target: 150, actual: 100, percentage: 67 },
      carbohydrates: { target: 250, actual: 180, percentage: 72 },
      fat: { target: 65, actual: 50, percentage: 77 },
    },
    meals: [
      {
        mealType: 'breakfast',
        foods: ['Oatmeal', 'Banana'],
        mealTotals: {
          calories: 350,
          protein: 12,
          carbohydrates: 65,
          fat: 8,
        },
      },
      {
        mealType: 'lunch',
        foods: ['Chicken Breast', 'Rice', 'Broccoli'],
        mealTotals: {
          calories: 600,
          protein: 45,
          carbohydrates: 70,
          fat: 15,
        },
      },
    ],
  },
};

// Mock AuthProvider that provides a user
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="auth-provider">{children}</div>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.meals.getDaily as jest.Mock).mockResolvedValue(mockDailyData);
    
    // Mock useAuth hook
    jest.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      }),
    }));
  });

  it('renders dashboard header with user name', async () => {
    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  it('displays macro rings with correct data', async () => {
    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Today's Macros")).toBeInTheDocument();
      expect(screen.getAllByTestId('pie-chart')).toHaveLength(4); // 4 macro rings
    });
  });

  it('shows meals when data is available', async () => {
    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Today's Meals")).toBeInTheDocument();
      expect(screen.getByText('breakfast')).toBeInTheDocument();
      expect(screen.getByText('lunch')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (apiService.meals.getDaily as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (apiService.meals.getDaily as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows empty state when no meals logged', async () => {
    const emptyData = {
      ...mockDailyData,
      mealEntry: {
        ...mockDailyData.mealEntry,
        meals: [],
      },
    };

    (apiService.meals.getDaily as jest.Mock).mockResolvedValue(emptyData);

    render(
      <MockAuthProvider>
        <Dashboard />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No meals logged today')).toBeInTheDocument();
      expect(screen.getByText('Log Your First Meal')).toBeInTheDocument();
    });
  });
});

// __tests__/components/MacroRing.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MacroRing from '@/components/MacroRing';

describe('MacroRing Component', () => {
  const defaultProps = {
    current: 100,
    target: 150,
    label: 'Protein',
    color: '#10b981',
    unit: 'g',
  };

  it('renders with correct label and values', () => {
    render(<MacroRing {...defaultProps} />);

    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('g')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<MacroRing {...defaultProps} />);

    // 100/150 = 66.67% rounded to 67%
    expect(screen.getByText('67% of 150g')).toBeInTheDocument();
  });

  it('calculates remaining amount correctly', () => {
    render(<MacroRing {...defaultProps} />);

    // 150 - 100 = 50 remaining
    expect(screen.getByText('50g remaining')).toBeInTheDocument();
  });

  it('handles zero target gracefully', () => {
    render(<MacroRing {...defaultProps} target={0} />);

    expect(screen.getByText('0% of 0g')).toBeInTheDocument();
  });

  it('handles exceeding target', () => {
    render(<MacroRing {...defaultProps} current={200} />);

    // 200/150 = 133% but capped at 100% for display
    expect(screen.getByText('0g remaining')).toBeInTheDocument();
    expect(screen.getByText('133% of 150g')).toBeInTheDocument();
  });

  it('renders without unit when not provided', () => {
    render(<MacroRing {...defaultProps} unit="" />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.queryByText('g')).not.toBeInTheDocument();
  });
});

// __tests__/api/auth.test.ts - API Endpoint Tests
import handler from '@/pages/api/auth/register';
import { createMocks } from 'node-mocks-http';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Mock dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/models/User');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUser = User as jest.Mocked<typeof User>;

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  it('successfully registers a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        height: { value: 180, unit: 'cm' },
        weight: { value: 75, unit: 'kg' },
        activityLevel: 'moderate',
      },
      goals: {
        dailyCalories: 2000,
        macroTargets: {
          protein: 150,
          carbohydrates: 250,
          fat: 65,
        },
      },
    };

    const mockSavedUser = {
      _id: 'user-id-123',
      ...userData,
      fullName: 'John Doe',
      age: 34,
      createdAt: new Date(),
    };

    mockUser.findOne.mockResolvedValue(null); // User doesn't exist
    mockUser.prototype.save.mockResolvedValue(mockSavedUser);
    
    // Mock constructor
    (mockUser as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedUser),
      ...mockSavedUser,
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(userData.email);
    expect(data.token).toBeDefined();
  });

  it('returns error for existing user', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'Password123!',
      profile: { /* ... */ },
      goals: { /* ... */ },
    };

    mockUser.findOne.mockResolvedValue({ email: 'existing@example.com' });

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('User already exists with this email');
  });

  it('validates required fields', async () => {
    const invalidData = {
      email: 'invalid-email',
      password: '123', // Too short
      // Missing profile and goals
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: invalidData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('handles database errors', async () => {
    mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Internal server error');
  });

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });
});

// __tests__/models/User.test.ts - Database Model Tests
import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

describe('User Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('creates a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: {
            protein: 150,
            carbohydrates: 250,
            fat: 65,
          },
        },
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.profile.firstName).toBe(userData.profile.firstName);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('calculates macro percentages automatically', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: {
            protein: 150, // 150 * 4 = 600 cal = 30%
            carbohydrates: 250, // 250 * 4 = 1000 cal = 50%
            fat: 44, // 44 * 9 = 396 cal = ~20%
          },
        },
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.goals.macroPercentages.fat).toBe(20);
    });

    it('validates required fields', async () => {
      const userData = {
        email: 'test@example.com',
        // Missing password
        profile: {
          firstName: 'John',
          // Missing required fields
        },
      };

      const user = new User(userData as any);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('validates email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow(/Please enter a valid email address/);
    });

    it('prevents duplicate emails', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow(/duplicate key/);
    });
  });

  describe('Password Methods', () => {
    let user: IUser;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      user = new User(userData);
      await user.save();
    });

    it('hashes password before saving', async () => {
      expect(user.password).not.toBe('Password123!');
      expect(user.password.length).toBeGreaterThan(20); // Hashed passwords are longer
    });

    it('compares password correctly', async () => {
      const isValid = await user.comparePassword('Password123!');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('BMR and TDEE Calculations', () => {
    it('calculates BMR correctly for male', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'), // 34 years old
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      const user = new User(userData);
      const bmr = user.generateBMR();
      
      // BMR = 10 * 75 + 6.25 * 180 - 5 * 34 + 5 = 1650
      expect(bmr).toBe(1650);
    });

    it('calculates TDEE correctly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate', // 1.55 multiplier
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      const user = new User(userData);
      const tdee = user.generateTDEE();
      
      // TDEE = BMR * 1.55 = 1650 * 1.55 = 2558 (rounded)
      expect(tdee).toBe(2558);
    });
  });

  describe('Virtual Properties', () => {
    let user: IUser;

    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          height: { value: 180, unit: 'cm' },
          weight: { value: 75, unit: 'kg' },
          activityLevel: 'moderate',
        },
        goals: {
          dailyCalories: 2000,
          macroTargets: { protein: 150, carbohydrates: 250, fat: 65 },
        },
      };

      user = new User(userData);
      await user.save();
    });

    it('generates full name correctly', () => {
      expect(user.fullName).toBe('John Doe');
    });

    it('calculates age correctly', () => {
      const currentYear = new Date().getFullYear();
      const expectedAge = currentYear - 1990;
      expect(user.age).toBe(expectedAge);
    });
  });
});

// __tests__/lib/utils.test.ts - Utility Function Tests
import {
  calculateAge,
  calculateBMI,
  getBMICategory,
  validateEmail,
  validatePassword,
  calculateMacroCalories,
  calculateMacroPercentages,
  formatDate,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('1990-01-01');
      const age = calculateAge(birthDate);
      const expectedAge = new Date().getFullYear() - 1990;
      expect(age).toBe(expectedAge);
    });

    it('handles birthday not yet reached this year', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() - 25);
      futureDate.setMonth(futureDate.getMonth() + 1); // Next month
      
      const age = calculateAge(futureDate);
      expect(age).toBe(24); // Should be 24, not 25
    });
  });

  describe('calculateBMI', () => {
    it('calculates BMI for metric units', () => {
      const bmi = calculateBMI(75, 180, 'kg', 'cm');
      expect(bmi).toBeCloseTo(23.15, 2);
    });

    it('calculates BMI for imperial units', () => {
      const bmi = calculateBMI(165, 71, 'lbs', 'inches');
      expect(bmi).toBeCloseTo(23.01, 2);
    });

    it('handles mixed units', () => {
      const bmi = calculateBMI(165, 180, 'lbs', 'cm');
      expect(bmi).toBeCloseTo(20.66, 2);
    });
  });

  describe('getBMICategory', () => {
    it('categorizes BMI correctly', () => {
      expect(getBMICategory(17)).toBe('Underweight');
      expect(getBMICategory(22)).toBe('Normal weight');
      expect(getBMICategory(27)).toBe('Overweight');
      expect(getBMICategory(32)).toBe('Obese');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('name.surname@company.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('calculateMacroCalories', () => {
    it('calculates total calories from macros', () => {
      const calories = calculateMacroCalories(100, 200, 50);
      // 100*4 + 200*4 + 50*9 = 400 + 800 + 450 = 1650
      expect(calories).toBe(1650);
    });
  });

  describe('calculateMacroPercentages', () => {
    it('calculates macro percentages correctly', () => {
      const percentages = calculateMacroPercentages(100, 200, 50, 1650);
      expect(percentages.protein).toBe(24); // 400/1650 = 24%
      expect(percentages.carbs).toBe(48); // 800/1650 = 48%
      expect(percentages.fat).toBe(27); // 450/1650 = 27%
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('2024-03-15');
    });
  });
});

// __tests__/integration/auth-flow.test.ts - Integration Tests
import { createMocks } from 'node-mocks-http';
import registerHandler from '@/pages/api/auth/register';
import loginHandler from '@/pages/api/auth/login';
import meHandler from '@/pages/api/auth/me';
import { generateToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Mock database connection
jest.mock('@/lib/mongodb');
jest.mock('@/models/User');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUser = User as jest.Mocked<typeof User>;

describe('Authentication Flow Integration', () => {
  const testUserData = {
    email: 'integration@test.com',
    password: 'TestPassword123!',
    profile: {
      firstName: 'Integration',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      height: { value: 180, unit: 'cm' },
      weight: { value: 75, unit: 'kg' },
      activityLevel: 'moderate',
    },
    goals: {
      dailyCalories: 2000,
      macroTargets: {
        protein: 150,
        carbohydrates: 250,
        fat: 65,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  it('completes full registration and login flow', async () => {
    // Step 1: Register user
    const mockSavedUser = {
      _id: 'user-id-123',
      ...testUserData,
      fullName: 'Integration Test',
      age: 34,
      createdAt: new Date(),
      comparePassword: jest.fn(),
      generateBMR: jest.fn().mockReturnValue(1650),
      generateTDEE: jest.fn().mockReturnValue(2000),
    };

    mockUser.findOne.mockResolvedValue(null);
    (mockUser as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedUser),
      ...mockSavedUser,
    }));

    const { req: registerReq, res: registerRes } = createMocks({
      method: 'POST',
      body: testUserData,
    });

    await registerHandler(registerReq, registerRes);
    
    expect(registerRes._getStatusCode()).toBe(201);
    const registerData = JSON.parse(registerRes._getData());
    expect(registerData.success).toBe(true);
    expect(registerData.token).toBeDefined();

    // Step 2: Login with registered user
    mockUser.findOne.mockResolvedValue({
      ...mockSavedUser,
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(mockSavedUser),
    });

    const { req: loginReq, res: loginRes } = createMocks({
      method: 'POST',
      body: {
        email: testUserData.email,
        password: testUserData.password,
      },
    });

    await loginHandler(loginReq, loginRes);
    
    expect(loginRes._getStatusCode()).toBe(200);
    const loginData = JSON.parse(loginRes._getData());
    expect(loginData.success).toBe(true);
    expect(loginData.token).toBeDefined();

    // Step 3: Access protected route with token
    mockUser.findById.mockResolvedValue(mockSavedUser);

    const token = loginData.token;
    const { req: meReq, res: meRes } = createMocks({
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    await meHandler(meReq, meRes);
    
    expect(meRes._getStatusCode()).toBe(200);
    const meData = JSON.parse(meRes._getData());
    expect(meData.success).toBe(true);
    expect(meData.user.email).toBe(testUserData.email);
  });

  it('rejects invalid credentials during login', async () => {
    mockUser.findOne.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: testUserData.email,
        password: 'WrongPassword',
      },
    });

    await loginHandler(req, res);
    
    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Invalid email or password');
  });

  it('protects routes without valid token', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      // No authorization header
    });

    await meHandler(req, res);
    
    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Unauthorized');
  });
});

// __tests__/setup.ts - Test Setup Configuration
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/macrotrack-test';

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});protein).toBe(30);
      expect(savedUser.goals.macroPercentages.carbohydrates).toBe(50);
      expect(savedUser.goals.macroPercentages.