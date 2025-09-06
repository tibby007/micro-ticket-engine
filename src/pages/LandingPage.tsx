import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, Sparkles, TrendingUp, Check, Star, ArrowRight, Mail } from 'lucide-react';
import { PricingTable } from '../components/PricingTable';

export function LandingPage() {
  const [showPricing, setShowPricing] = useState(false);

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Targeting',
      description: 'Advanced algorithms identify high-quality prospects based on industry, location, and business characteristics.'
    },
    {
      icon: Sparkles,
      title: 'Contact Enrichment',
      description: 'Automatically gather email addresses, phone numbers, and business details for every lead.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Pipeline',
      description: 'Track leads through your sales funnel with our intuitive Kanban-style pipeline management.'
    },
    {
      icon: Mail,
      title: 'Automated Outreach',
      description: 'Set up email campaigns and follow-up sequences to nurture leads automatically.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Capital Solutions LLC',
      quote: 'MicroTix helped us increase our qualified leads by 300% in just 2 months. The AI targeting is incredibly accurate.',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      company: 'Business Funding Pro',
      quote: 'The automated lead generation saves us 20+ hours per week. We can focus on closing deals instead of finding prospects.',
      rating: 5
    },
    {
      name: 'Jennifer Chen',
      company: 'Growth Capital Partners',
      quote: 'Best ROI we\'ve seen from any lead generation tool. The quality of leads is outstanding.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MicroTix</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowPricing(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI-Powered Lead Generation for
              <span className="text-blue-300"> Business Loan Brokers</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed">
              Discover qualified prospects, enrich contact data, and automate outreach campaigns. 
              Generate more leads in less time with our intelligent targeting system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
              </Link>
              <button
                onClick={() => setShowPricing(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                View Pricing
              </button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>2-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>No charge until trial ends</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines advanced targeting, data enrichment, and automation 
              to help you find and convert more qualified leads.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get qualified leads in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Target Your Market</h3>
              <p className="text-gray-600">
                Select your target industry and location. Our AI will identify businesses that match your ideal customer profile.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Finds Prospects</h3>
              <p className="text-gray-600">
                Our system scrapes Google Maps and enriches contact data, providing you with verified email addresses and phone numbers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Convert & Close</h3>
              <p className="text-gray-600">
                Manage leads through our pipeline, send automated emails, and track your progress from prospect to closed deal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Leads Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Active Brokers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-200">Email Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3x</div>
              <div className="text-blue-200">Lead Conversion</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Top Brokers
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about MicroTix
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to 3x Your Lead Generation?
            </h2>
            <p className="text-xl text-blue-200 mb-8">
              Join hundreds of successful brokers who are already using MicroTix to grow their business.
              Start your free trial today - no charge until trial ends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowPricing(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">MicroTix</span>
              </div>
              <p className="text-gray-400">
                AI-powered lead generation for business loan brokers and lenders.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setShowPricing(true)} className="hover:text-white transition-colors">Pricing</button></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MicroTix. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative max-w-7xl w-full bg-white rounded-2xl p-8">
            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <PricingTable />
          </div>
        </div>
      )}
    </div>
  );
}