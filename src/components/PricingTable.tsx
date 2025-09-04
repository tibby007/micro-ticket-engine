import React from 'react';
import { Check, Star } from 'lucide-react';
import { api } from '../services/api';

const plans = [
  {
    name: 'Starter',
    price: 29.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    leadsPerRun: 50,
    activeJobs: 1,
    features: [
      'Basic email templates',
      'Standard enrichment',
      'Manual send',
      'Email support'
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: 99.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    leadsPerRun: 150,
    activeJobs: 3,
    features: [
      'Bulk send campaigns',
      'Priority enrichment',
      'CSV export',
      'Advanced templates',
      'Priority support'
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: 199.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
    leadsPerRun: 300,
    activeJobs: 10,
    features: [
      'Bulk send + sequencing',
      'Advanced enrichment',
      'Custom templates',
      'Priority support',
      'Dedicated success manager'
    ],
    popular: false,
  },
];

export function PricingTable() {
  const handleSelectPlan = async (priceId: string) => {
    try {
      const { url } = await api.createCheckout(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600">
          Start with a 2-day free trial. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 ${
              plan.popular
                ? 'border-blue-500 transform scale-105'
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${plan.price}
                <span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <p className="text-gray-600">2-day free trial</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {plan.leadsPerRun} leads
                </div>
                <div className="text-sm text-gray-500">per search</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700">
                  {plan.activeJobs} active job{plan.activeJobs > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">concurrent</div>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.priceId)}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Start Free Trial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}