-- Function to create subscription when user registers
CREATE OR REPLACE FUNCTION create_user_subscription_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create subscription if user doesn't have one
  IF NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE user_id = NEW.id
  ) THEN
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      trial_ends_at
    ) VALUES (
      NEW.id,
      'basic',
      'trialing',
      NOW(),
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '7 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists to avoid duplicates
DROP TRIGGER IF EXISTS on_user_signup_create_subscription ON auth.users;

-- Trigger to automatically create subscription on user signup
CREATE TRIGGER on_user_signup_create_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription_on_signup();

COMMENT ON FUNCTION create_user_subscription_on_signup() IS 'Automatically creates a 7-day trial subscription for new users';
