import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Zap, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { SearchRequest, Subscription } from '../types';

interface SearchWizardProps {
  subscription: Subscription;
  onJobCreated: (jobId: string) => void;
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
  'Real Estate'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function SearchWizard({ subscription, onJobCreated }: SearchWizardProps) {
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
      
      // Reset form
      setCurrentStep(1);
      setFormData({
        industry: '',
        city: '',
        state: '',
        fundingType: 'equipment',
        fundingAmount: { min: 10000, max: 50000 }
      });
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
          <div className="text-center">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Target Industry
            </h3>
            <p className="text-gray-600 mb-6">
              Which industry are you targeting for leads?
            </p>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Target Location
            </h3>
            <p className="text-gray-600 mb-6">
              Where should we search for leads?
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="City name"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
        );

      case 3:
        return (
          <div className="text-center">
            <Zap className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Funding Type
            </h3>
            <p className="text-gray-600 mb-6">
              What type of funding are you offering?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, fundingType: 'equipment' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.fundingType === 'equipment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold mb-2">Equipment</div>
                <div className="text-sm text-gray-600">
                  Machinery, vehicles, technology
                </div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, fundingType: 'mca' })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.fundingType === 'mca'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-semibold mb-2">Working Capital</div>
                <div className="text-sm text-gray-600">
                  MCA, business loans, cash flow
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Funding Amount Range
            </h3>
            <p className="text-gray-600 mb-6">
              What's the target funding range?
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  value={formData.fundingAmount.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    fundingAmount: { ...formData.fundingAmount, min: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  value={formData.fundingAmount.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    fundingAmount: { ...formData.fundingAmount, max: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Your plan:</strong> Up to {subscription.limits.leadsPerRun} leads per search
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px] flex flex-col justify-between">
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed(currentStep)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed(currentStep) || isSubmitting}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Starting Search...</span>
                </>
              ) : (
                <>
                  <span>Start Lead Search</span>
                  <Zap className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}