import { useState } from 'react';
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

const LEAD_COUNTS = [
  { label: '10 leads', value: 10 },
  { label: '25 leads', value: 25 },
  { label: '50 leads', value: 50 },
  { label: '75 leads', value: 75 },
  { label: '100 leads', value: 100 }

const RADIUS_OPTIONS = [
  { label: '10 miles', value: 10 },
  { label: '25 miles', value: 25 },
  { label: '50 miles', value: 50 },
  { label: '100 miles', value: 100 }
];

export function SearchWizard({ subscription, onJobCreated, onClose }: SearchWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SearchRequest>({
    industry: '',
    city: '',
    state: '',
    leadCount: 25,
    radius: 25,
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.industry;
      case 2: return !!formData.city && !!formData.state;
      case 3: return !!formData.leadCount && !!formData.radius;
      default: return false;
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter(k => k !== keyword) || []
    });
  };

  const handleSubmit = async () => {
    if (subscription.usage.activeJobs >= subscription.limits.activeJobs) {
      setError(`You've reached your limit of ${subscription.limits.activeJobs} active jobs. Upgrade your plan or wait for current jobs to complete.`);
      return;
    }

    if ((formData.leadCount || 0) > subscription.limits.leadsPerSearch) {
      setError(`Your ${subscription.tier} plan allows up to ${subscription.limits.leadsPerSearch} leads per search. Please reduce the lead count or upgrade your plan.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const { jobId } = await api.startSearch(formData);
      onJobCreated(jobId);
      onClose();
    } catch (error) {
      console.error('Failed to start search:', error);
      setError(error instanceof Error ? error.message : 'Failed to start search. Please try again.');
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
            <DollarSign className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Search Parameters
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Configure your lead generation settings
            </p>
            <div className="space-y-8 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-left">
                  Number of Leads (Max: {subscription.limits.leadsPerSearch})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LEAD_COUNTS.filter(count => count.value <= subscription.limits.leadsPerSearch).map((count) => (
                    <button
                      key={count.value}
                      onClick={() => setFormData({ ...formData, leadCount: count.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.leadCount === count.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {count.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-left">
                  Search Radius
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {RADIUS_OPTIONS.map((radius) => (
                    <button
                      key={radius.value}
                      onClick={() => setFormData({ ...formData, radius: radius.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.radius === radius.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {radius.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-left">
                  Keywords (Optional)
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.keywords && formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
        {[1, 2, 3].map((step) => (
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
            {step < 3 && (
              <div
                className={`w-20 h-1 mx-3 transition-all ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

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

          {currentStep < 3 ? (
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