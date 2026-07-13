-- justfit Supabase Database Schema (PostgreSQL)

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Gamification Metrics
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    
    -- Profile Onboarding Data
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    birth_date DATE,
    gender VARCHAR(20),
    health_goal VARCHAR(100) -- 'weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance', etc.
);

-- 2. HEALTH RECORDS (Track periodic metrics)
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    
    heart_rate_bpm INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    blood_oxygen_percentage INTEGER, -- SpO2
    blood_sugar_mg_dl INTEGER,
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    mood VARCHAR(50), -- 'excellent', 'good', 'neutral', 'stressed', 'tired', etc.
    water_intake_ml INTEGER DEFAULT 0
);

-- 3. FITNESS ACTIVITIES (Individual workout sessions)
CREATE TABLE fitness_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'running', 'walking', 'cycling', 'swimming', 'yoga', 'strength_training', etc.
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2) DEFAULT 0.0,
    calories_burned INTEGER NOT NULL,
    avg_heart_rate INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 4. NUTRITION LOGS (Meals & water reminders)
CREATE TABLE nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_name VARCHAR(150) NOT NULL,
    calories INTEGER DEFAULT 0,
    protein_g DECIMAL(5,2) DEFAULT 0.0,
    carbs_g DECIMAL(5,2) DEFAULT 0.0,
    fat_g DECIMAL(5,2) DEFAULT 0.0,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SLEEP LOGS (Sleep quality & duration)
CREATE TABLE sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    sleep_date DATE NOT NULL,
    
    sleep_duration_hours DECIMAL(4,2) NOT NULL,
    deep_sleep_hours DECIMAL(4,2) DEFAULT 0.0,
    rem_sleep_hours DECIMAL(4,2) DEFAULT 0.0,
    light_sleep_hours DECIMAL(4,2) DEFAULT 0.0,
    
    sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
    sleep_quality VARCHAR(50), -- 'restful', 'interrupted', 'restless', etc.
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, sleep_date)
);

-- 6. GOALS (User wellness targets)
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'steps', 'calories_burned', 'water_intake', 'sleep_hours', 'weight_target'
    target_value DECIMAL(8,2) NOT NULL,
    current_value DECIMAL(8,2) DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ACHIEVEMENTS
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    xp_reward INTEGER DEFAULT 50
);

-- USER ACHIEVEMENTS (Join table for unlocked badges)
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- 8. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50), -- 'streak_milestone', 'level_up', 'goal_completion', 'wellness_tip'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI CONVERSATIONS
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PROGRESS REPORTS (AI Generated Health Risk Assessment)
CREATE TABLE progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    report_type VARCHAR(20) DEFAULT 'weekly', -- 'weekly', 'monthly'
    summary TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high'
    lifestyle_improvements TEXT[],
    predictions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX idx_health_records_user_date ON health_records(user_id, recorded_at DESC);
CREATE INDEX idx_fitness_activities_user_date ON fitness_activities(user_id, recorded_at DESC);
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, logged_at DESC);
CREATE INDEX idx_sleep_logs_user_date ON sleep_logs(user_id, sleep_date DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_ai_chat_session ON ai_conversations(user_id, session_id);
