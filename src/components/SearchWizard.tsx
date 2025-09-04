import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { SearchRequest, Subscription } from '../types';

interface SearchWizardProps {
  subscription: Subscription;
  onJobCreated: (jobId: string) => void;
  onClose: () => void;
}

const INDUSTRIES = [
  'Restaurants & Food Service',
  'Construction & Contracting',
  'Retail & E-commerce',
  'Healthcare & Medical',
  'Beauty & Wellness',
  'Automotive Services',
  'Professional Services',
  'Manufacturing',
  'Transportation & Logistics',
  'Real Estate',
  'Fitness & Recreation',
  'Home Services',
  'Technology Services',
  'Financial Services',
  'Legal Services'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const FUNDING_AMOUNTS = [
  { label: '$10K - $25K', min: 10000, max: 25000 },
  { label: '$25K - $50K', min: 25000, max: 50000 },
  { label: '$50K - $100K', min: 50000, max: 100000 },
  { label: '$100K - $250K', min: 100000, max: 250000 },
  { label: '$250K - $500K', min: 250000, max: 500000 },
  { label: '$500K+', min: 500000, max: 1000000 },
];

export function SearchWizard({ subscription, onJobCreated, onClose }: SearchWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SearchRequest>({
    industry: '',
    city: '',
    state: '',
    fundingType: 'equipment',
    fundingAmount: { min: 10000, max: 50000 }
  });

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.industry;
      case 2: return !!formData.city && !!formData.state;
      case 3: return !!formData.fundingType;
      case 4: return formData.fundingAmount.min > 0 && formData.fundingAmount.max > formData.fundingAmount.min;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (subscription.usage.activeJobs >= subscription.limits.activeJobs) {
      alert(`You've reached your limit of ${subscription.limits.activeJobs} active jobs. Upgrade your plan or wait for current jobs to complete.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { jobId } = await api.startSearch(formData);
      onJobCreated(jobId);
      onClose();
    } catch (error) {
      console.error('Failed to start search:', error);
      alert('Failed to start search. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center slide-in">
            <Building2 className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Target Industry
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Which industry should we target for leads?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {INDUSTRIES.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setFormData({ ...formData, industry })}
                  className={`p-4 text-left rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.industry === industry
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center slide-in">
            <MapPin className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Target Location
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Where should we search for leads?
            </p>
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g., Miami, Los Angeles, Chicago"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center slide-in">
            <Zap className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Funding Type
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              What type of funding are you offering?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => setFormData({ ...formData, fundingType: 'equipment' })}
                className={`p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  formData.fundingType === 'equipment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl font-bold mb-3">Equipment Financing</div>
                <div className="text-gray-600">
                  Machinery, vehicles, technology, manufacturing equipment
                </div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, fundingType: 'mca' })}
                className={`p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  formData.fundingType === 'mca'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl font-bold mb-3">Working Capital</div>
                <div className="text-gray-600">
                  MCA, business loans, cash flow, inventory financing
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center slide-in">
            <DollarSign className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Funding Amount Range
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              What's your target funding range?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {FUNDING_AMOUNTS.map((amount) => (
                <button
                  key={amount.label}
                  onClick={() => setFormData({
                    ...formData,
                    fundingAmount: { min: amount.min, max: amount.max }
                  })}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                    formData.fundingAmount.min === amount.min && formData.fundingAmount.max === amount.max
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-lg font-semibold">{amount.label}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl max-w-md mx-auto">
              <p className="text-sm text-blue-700 font-medium">
                <strong>Your {subscription.tier} plan:</strong> Up to {subscription.limits.leadsPerSearch} leads per search
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                step <= currentStep
                  ? 'bg-blue-600 text-white shadow-lg'
                  : step === currentStep + 1
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-200'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-20 h-1 mx-3 transition-all ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[500px] flex flex-col justify-between">
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed(currentStep)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed(currentStep) || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Starting Search...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Start Lead Search</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}