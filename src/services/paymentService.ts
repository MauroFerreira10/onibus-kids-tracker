import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export class PaymentService {
  static async createCheckoutSession(
    userId: string,
    planId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      // This would call your backend API to create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId,
          userEmail,
          successUrl,
          cancelUrl
        }),
      });

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  static async redirectToCheckout(sessionId: string) {
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe failed to initialize');
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  static async getCustomerPortalUrl(userId: string) {
    try {
      // This would call your backend API to create a customer portal session
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const session = await response.json();
      return session.url;
    } catch (error) {
      console.error('Error getting customer portal URL:', error);
      throw error;
    }
  }

  static async handleWebhook(payload: any, signature: string) {
    try {
      // This would be handled by your backend webhook endpoint
      // Verify webhook signature and process the event
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature,
        },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  static getPlanPriceId(planId: string, period: 'monthly' | 'annual'): string {
    const priceMap: Record<string, { monthly: string; annual: string }> = {
      'basic': {
        monthly: 'price_basic_monthly_aoa',
        annual: 'price_basic_annual_aoa'
      },
      'professional': {
        monthly: 'price_professional_monthly_aoa',
        annual: 'price_professional_annual_aoa'
      },
      'enterprise': {
        monthly: 'price_enterprise_monthly_aoa',
        annual: 'price_enterprise_annual_aoa'
      }
    };

    return priceMap[planId]?.[period] || '';
  }

  static calculateAnnualDiscount(monthlyPrice: number): number {
    const annualPrice = monthlyPrice * 12;
    const discountedPrice = monthlyPrice * 10; // 2 months free
    return Math.round(((annualPrice - discountedPrice) / annualPrice) * 100);
  }
}