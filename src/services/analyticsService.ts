import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetention: number;
  featureUsage: Record<string, number>;
  userEngagement: {
    avgSessionDuration: number;
    sessionsPerUser: number;
  };
  conversionRates: {
    trialToPaid: number;
    freeToTrial: number;
  };
}

export class AnalyticsService {
  static async trackEvent(
    userId: string,
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      const eventData = {
        user_id: userId,
        event_name: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString()
      };

      // Insert into analytics_events table
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  static async getDailyActiveUsers(days: number = 30): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { count } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString())
        .not('user_id', 'is', null);

      return count || 0;
    } catch (error) {
      console.error('Error getting daily active users:', error);
      return 0;
    }
  }

  static async getMonthlyActiveUsers(): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const { count } = await supabase
        .from('analytics_events')
        .select('distinct(user_id)', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString())
        .not('user_id', 'is', null);

      return count || 0;
    } catch (error) {
      console.error('Error getting monthly active users:', error);
      return 0;
    }
  }

  static async getUserRetention(cohortDate: Date, period: 'week' | 'month'): Promise<number> {
    try {
      // This would implement cohort analysis
      // Simplified version for now
      return 85; // Mock retention rate
    } catch (error) {
      console.error('Error calculating user retention:', error);
      return 0;
    }
  }

  static async getFeatureUsage(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_name')
        .neq('event_name', 'page_view');

      if (error) throw error;

      const usage: Record<string, number> = {};
      data?.forEach(event => {
        usage[event.event_name] = (usage[event.event_name] || 0) + 1;
      });

      return usage;
    } catch (error) {
      console.error('Error getting feature usage:', error);
      return {};
    }
  }

  static async getUserEngagement(userId: string): Promise<{
    avgSessionDuration: number;
    sessionsPerUser: number;
  }> {
    try {
      // Get session data for user
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration, session_start')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          avgSessionDuration: 0,
          sessionsPerUser: 0
        };
      }

      const totalDuration = data.reduce((sum, session) => sum + (session.duration || 0), 0);
      const avgDuration = totalDuration / data.length;
      const sessionsCount = data.length;

      return {
        avgSessionDuration: Math.round(avgDuration),
        sessionsPerUser: sessionsCount
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return {
        avgSessionDuration: 0,
        sessionsPerUser: 0
      };
    }
  }

  static async getConversionRates(): Promise<{
    trialToPaid: number;
    freeToTrial: number;
  }> {
    try {
      // Get trial signups
      const { count: trialSignups } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'trialing');

      // Get paid conversions
      const { count: paidConversions } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      const trialToPaid = trialSignups && trialSignups > 0 
        ? Math.round((paidConversions || 0) / trialSignups * 100)
        : 0;

      // Mock free to trial conversion (would need signup data)
      const freeToTrial = 25;

      return {
        trialToPaid,
        freeToTrial
      };
    } catch (error) {
      console.error('Error getting conversion rates:', error);
      return {
        trialToPaid: 0,
        freeToTrial: 0
      };
    }
  }

  static async getAnalyticsOverview(days: number = 30): Promise<AnalyticsData> {
    try {
      const [
        dailyActiveUsers,
        monthlyActiveUsers,
        userRetention,
        featureUsage,
        conversionRates
      ] = await Promise.all([
        this.getDailyActiveUsers(days),
        this.getMonthlyActiveUsers(),
        this.getUserRetention(new Date(), 'month'),
        this.getFeatureUsage(),
        this.getConversionRates()
      ]);

      const userEngagement = {
        avgSessionDuration: 847, // Mock data - 14 minutes average
        sessionsPerUser: 3.2
      };

      return {
        dailyActiveUsers,
        monthlyActiveUsers,
        userRetention,
        featureUsage,
        userEngagement,
        conversionRates
      };
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      return {
        dailyActiveUsers: 0,
        monthlyActiveUsers: 0,
        userRetention: 0,
        featureUsage: {},
        userEngagement: {
          avgSessionDuration: 0,
          sessionsPerUser: 0
        },
        conversionRates: {
          trialToPaid: 0,
          freeToTrial: 0
        }
      };
    }
  }

  static async trackPageView(userId: string, pageName: string): Promise<void> {
    await this.trackEvent(userId, 'page_view', { page: pageName });
  }

  static async trackButtonClick(userId: string, buttonName: string, context?: string): Promise<void> {
    await this.trackEvent(userId, 'button_click', { 
      button: buttonName, 
      context 
    });
  }

  static async trackFeatureUsage(userId: string, featureName: string): Promise<void> {
    await this.trackEvent(userId, `feature_${featureName}`);
  }
}