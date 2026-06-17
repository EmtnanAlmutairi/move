import { subscriptionPlans } from '../data/mockData';

export async function getSubscriptionPlans() {
  // TODO: Replace with API billing plans.
  return subscriptionPlans;
}

export async function activateSubscription(planId: string) {
  // TODO: Replace with payment + backend enrollment.
  return { success: true, planId };
}
