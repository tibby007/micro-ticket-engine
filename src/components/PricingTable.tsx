import { Check, Star, Zap, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const plans = [
  {
    name: 'Starter',
    price: 29.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || 'price_1S3j3rB1YJBVEg8wbib0u6i4',
    leadsPerSearch: 20,
    activeJobs: 1,
    features: [
      'Up to 20 leads per search',
      '1 active job at a time',
      'Basic lead generation',
      'Standard enrichment',
      'Email support'
    ],
    popular: false,
    description: 'Perfect for getting started'
  },
  {
    name: 'Pro',
    price: 99.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_1S3j47B1YJBVEg8wTzNV0FPz',
    leadsPerSearch: 50,
    activeJobs: 3,
    features: [
      'Up to 50 leads per search',
      '3 active jobs simultaneously',
      'Priority scraping',
      'Advanced lead generation',
      'Enhanced enrichment',
      'CSV export',
      'Priority support'
    ],
    popular: true,
    description: 'Most popular for growing brokers'
  },
  {
    name: 'Premium',
    price: 199.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || 'price_1S3j4PB1YJBVEg8wqPjEHsJV',
    leadsPerSearch: 100,
    activeJobs: 10,
    features: [
      'Up to 100 leads per search',
      '10 active jobs simultaneously',
      'Priority scraping',
      'Custom lead generation',
      'Advanced enrichment',
      'Bulk operations',
      'API access',
      'Dedicated success manager'
    ],
    popular: false,
    description: 'For high-volume operations'
  },
];

export function PricingTable() {
  const handleSelectPlan = async (priceId: string) => {
    try {
      const { url } = await api.createCheckout(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Start with a 2-day free trial. No credit card required.
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">All plans include 2-day free trial</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 transition-all hover:shadow-2xl ${
              plan.popular
                ? 'border-blue-500 transform scale-105 ring-4 ring-blue-100'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="text-5xl font-bold text-gray-900 mb-1">
                ${plan.price}
                <span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <p className="text-green-600 font-medium">2-day free trial included</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {plan.leadsPerSearch}
                </div>
                <div className="text-sm text-gray-600">leads per search</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700 mb-1">
                  {plan.activeJobs} concurrent job{plan.activeJobs > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">active at once</div>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.priceId)}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Start Free Trial</span>
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          All plans include our core AI lead generation features
        </p>
        <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
          <span>✓ Google Maps scraping</span>
          <span>✓ Contact enrichment</span>
          <span>✓ Email automation</span>
          <span>✓ Real-time pipeline</span>
        </div>
      </div>
    </div>
  );
}