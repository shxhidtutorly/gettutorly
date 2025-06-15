
-- Create subscriptions table to track user subscription status
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paddle_subscription_id TEXT,
  paddle_customer_id TEXT,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'trialing', 'cancelled', 'expired', 'past_due')),
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '4 days'),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (true);

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = p_user_id 
    AND (
      status = 'active' 
      OR (status = 'trialing' AND trial_end_date > now())
    )
  );
END;
$$;

-- Create function to get user subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_name TEXT,
  status TEXT,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_trial BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_name,
    s.status,
    s.trial_end_date,
    s.subscription_end_date,
    (s.status = 'trialing' AND s.trial_end_date > now()) as is_trial
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_paddle_id ON public.subscriptions(paddle_subscription_id);
