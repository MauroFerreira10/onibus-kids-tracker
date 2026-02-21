import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionService } from '@/services/subscriptionService';
import { UserSubscription, SubscriptionPlan, UsageMetrics } from '@/types/subscription';

interface QuotaContextType {
  subscription: UserSubscription | null;
  currentPlan: SubscriptionPlan | null;
  usageMetrics: UsageMetrics | null;
  isLoading: boolean;
  hasExceededQuota: (metric: string) => boolean;
  canCreateResource: (resourceType: 'student' | 'driver' | 'route') => boolean;
  refreshUsage: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    throw new Error('useQuota must be used within a QuotaProvider');
  }
  return context;
};

interface QuotaProviderProps {
  children: ReactNode;
}

export const QuotaProvider: React.FC<QuotaProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentPlan = subscription 
    ? SubscriptionService.getPlanById(subscription.plan_id)
    : null;

  useEffect(() => {
    if (user) {
      initializeQuotaData();
    } else {
      setSubscription(null);
      setUsageMetrics(null);
      setIsLoading(false);
    }
  }, [user]);

  const initializeQuotaData = async () => {
    try {
      setIsLoading(true);
      
      // Get user subscription
      const userSubscription = await SubscriptionService.getUserSubscription(user!.id);
      setSubscription(userSubscription);

      // Get usage metrics
      if (userSubscription) {
        const metrics = await SubscriptionService.getUsageMetrics(user!.id);
        setUsageMetrics(metrics);
      }
    } catch (error) {
      console.error('Error initializing quota data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasExceededQuota = (metric: string): boolean => {
    if (!currentPlan || !usageMetrics) return false;

    switch (metric) {
      case 'students':
        return currentPlan.limits.students !== 'unlimited' && 
               usageMetrics.students_count >= currentPlan.limits.students;
      case 'drivers':
        return currentPlan.limits.drivers !== 'unlimited' && 
               usageMetrics.drivers_count >= currentPlan.limits.drivers;
      case 'routes':
        return currentPlan.limits.routes !== 'unlimited' && 
               usageMetrics.routes_count >= currentPlan.limits.routes;
      default:
        return false;
    }
  };

  const canCreateResource = (resourceType: 'student' | 'driver' | 'route'): boolean => {
    if (!currentPlan || !usageMetrics) return true; // Allow if no plan data

    switch (resourceType) {
      case 'student':
        return currentPlan.limits.students === 'unlimited' || 
               usageMetrics.students_count < currentPlan.limits.students;
      case 'driver':
        return currentPlan.limits.drivers === 'unlimited' || 
               usageMetrics.drivers_count < currentPlan.limits.drivers;
      case 'route':
        return currentPlan.limits.routes === 'unlimited' || 
               usageMetrics.routes_count < currentPlan.limits.routes;
      default:
        return true;
    }
  };

  const refreshUsage = async () => {
    if (!user) return;
    
    try {
      const metrics = await SubscriptionService.getUsageMetrics(user.id);
      setUsageMetrics(metrics);
    } catch (error) {
      console.error('Error refreshing usage:', error);
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const userSubscription = await SubscriptionService.getUserSubscription(user.id);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const value = {
    subscription,
    currentPlan,
    usageMetrics,
    isLoading,
    hasExceededQuota,
    canCreateResource,
    refreshUsage,
    refreshSubscription
  };

  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
};