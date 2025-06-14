
-- Add subscription fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);
