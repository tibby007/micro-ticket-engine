import { useState, useEffect } from 'react';
import { Mail, Phone, Globe, MapPin, CheckCircle, Search, Building, Users, Target } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, LeadJob } from '../types';

interface LeadsPipelineProps {
  activeJobs: string[];
  onJobUpdate: (jobs: string[]) => void;
}

export function LeadsPipeline({ activeJobs, onJobUpdate }: LeadsPipelineProps) {
  const [jobs, setJobs] = useState<{ [jobId: string]: LeadJob }>({});
  const [leads, setLeads] = useState<{ [jobId: string]: Lead[] }>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      const updatedJobs: string[] = [];
      
      for (const jobId of activeJobs) {
        try {
          const [jobStatus, jobResults] = await Promise.all([
            api.getJobStatus(jobId),
            api.getJobResults(jobId).catch(() => ({ leads: [] }))
          ]);
          
          setJobs(prev => ({ ...prev, [jobId]: jobStatus }));
          setLeads(prev => ({ ...prev, [jobId]: jobResults.leads }));
          
          // Keep job active if still searching
          if (jobStatus.status === 'searching') {
            updatedJobs.push(jobId);
          }
        } catch (error) {
          console.error(`Failed to fetch data for job ${jobId}:`, error);
          // Remove failed jobs from active list
        }
      }
      
      // Update active jobs list if it changed
      if (updatedJobs.length !== activeJobs.length) {
        onJobUpdate(updatedJobs);
      }
    };

    if (activeJobs.length > 0) {
      fetchJobData();
      const interval = setInterval(fetchJobData, 5000);
      return () => clearInterval(interval);
    }
  }, [activeJobs, onJobUpdate]);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await api.updateLead(foundJobId, leadId, newStatus);
      
      setLeads(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(jobId => {
          updated[jobId] = updated[jobId].map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          );
        });
        return updated;
      alert('Failed to update lead status. Please try again.');
    }
  };

  const getLeadsByStatus = (status: Lead['status']): Lead[] => {
    return Object.values(leads).flat().filter(lead => lead.status === status);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'contacted': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'qualified': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'disqualified': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'won': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'disqualified': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'won': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    }
  };

  const columns = [
    { id: 'new', title: 'New Leads', status: 'new' as const, icon: Users },
    { id: 'contacted', title: 'Contacted', status: 'contacted' as const, icon: Mail },
    { id: 'qualified', title: 'Qualified', status: 'qualified' as const, icon: CheckCircle },
    { id: 'disqualified', title: 'Disqualified', status: 'disqualified' as const, icon: Target },
    { id: 'won', title: 'Won', status: 'won' as const, icon: Building },
    { id: 'disqualified', title: 'Disqualified', status: 'disqualified' as const, icon: Target },
    { id: 'won', title: 'Won', status: 'won' as const, icon: Building },
  ];

  const totalLeads = Object.values(leads).flat().length;
  const completedJobs = Object.values(jobs).filter(job => job.status === 'completed').length;

  if (activeJobs.length === 0 && totalLeads === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
          <Building className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Generate Leads?
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Start your first lead search to discover qualified prospects for your funding offers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-900">Target</div>
            <div className="text-gray-600">Choose industry & location</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <Search className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-900">Discover</div>
            <div className="text-gray-600">AI finds qualified businesses</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-900">Connect</div>
            <div className="text-gray-600">Automated outreach campaigns</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
            </div>
            <Search className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedJobs}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Won</p>
              <p className="text-2xl font-bold text-gray-900">{getLeadsByStatus('won').length}</p>
            </div>
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Active Jobs Status */}
      {Object.values(jobs).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Active Searches</h3>
          {Object.values(jobs).map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {job.searchParams.industry} in {job.searchParams.city}, {job.searchParams.state}
                  </h4>
                  <p className="text-gray-600">
                    {job.searchParams.leadCount || 50} leads • {job.searchParams.radius || 25} mile radius
                    {job.searchParams.keywords && job.searchParams.keywords.length > 0 && (
                      <span> • Keywords: {job.searchParams.keywords.join(', ')}</span>
                    )}
                    {job.searchParams.keywords && job.searchParams.keywords.length > 0 && (
                      <span> • Keywords: {job.searchParams.keywords.join(', ')}</span>
                    )}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {job.status === 'searching' ? 'Searching...' : job.status}
                </span>
              </div>
              
              {job.status === 'searching' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{job.message}</span>
                    <span>{job.processed} / {job.total || '?'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(job.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {job.status === 'failed' && job.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{job.error}</p>
                </div>
              )}
              
              {job.status === 'failed' && job.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{job.error}</p>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Started: {new Date(job.createdAt).toLocaleString()}
                {job.completedAt && (
                  <> • Completed: {new Date(job.completedAt).toLocaleString()}</>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board */}
      {totalLeads > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Lead Pipeline</h3>
          <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 overflow-x-auto">
            {columns.map((column) => {
              const columnLeads = getLeadsByStatus(column.status);
              
              return (
                <div key={column.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <column.icon className={`w-6 h-6 ${
                      column.status === 'new' ? 'text-blue-500' :
                      column.status === 'contacted' ? 'text-yellow-500' :
                      column.status === 'qualified' ? 'text-green-500' :
                      column.status === 'disqualified' ? 'text-red-500' :
                      'text-purple-500'
                      column.status === 'disqualified' ? 'text-red-500' :
                      'text-purple-500'
                    }`} />
                    <h4 className="font-semibold text-gray-900 text-lg">{column.title}</h4>
                    <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(lead.status)}`}
                      >
                        <h5 className="font-semibold text-gray-900 mb-3 text-lg">
                          {lead.businessName}
                        </h5>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {lead.contactInfo.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{lead.contactInfo.email}</span>
                            </div>
                          )}
                          {lead.contactInfo.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{lead.contactInfo.phone}</span>
                            </div>
                          )}
                          {lead.contactInfo.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{lead.contactInfo.website}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {lead.category}
                            </span>
                            {lead.tags.slice(0, 1).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {lead.tags.length > 1 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{lead.tags.length - 1}
                              </span>
                            )}
                          </div>

                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="disqualified">Disqualified</option>
                            <option value="won">Won</option>
                            <option value="disqualified">Disqualified</option>
                            <option value="won">Won</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    {columnLeads.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 opacity-50 bg-white rounded-xl flex items-center justify-center">
                          <column.icon className="w-8 h-8" />
                        </div>
                        <p className="text-sm">No leads in {column.title.toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedLead.businessName}</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  {selectedLead.contactInfo.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{selectedLead.contactInfo.email}</span>
                    </div>
                  )}
                  {selectedLead.contactInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{selectedLead.contactInfo.phone}</span>
                    </div>
                  )}
                  {selectedLead.contactInfo.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a 
                        href={selectedLead.contactInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedLead.contactInfo.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{selectedLead.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Category:</span>
                    <div className="font-medium">{selectedLead.category}</div>
                  </div>
                  
                  {selectedLead.enrichmentData && (
                    <>
                      {selectedLead.enrichmentData.revenue && (
                        <div>
                          <span className="text-sm text-gray-600">Est. Revenue:</span>
                          <div className="font-medium">{selectedLead.enrichmentData.revenue}</div>
                        </div>
                      )}
                      {selectedLead.enrichmentData.employees && (
                        <div>
                          <span className="text-sm text-gray-600">Employees:</span>
                          <div className="font-medium">{selectedLead.enrichmentData.employees}</div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div>
                    <span className="text-sm text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLead.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Added: {new Date(selectedLead.createdAt).toLocaleString()}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'contacted')}
                    disabled={selectedLead.status === 'contacted'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'qualified')}
                    disabled={selectedLead.status === 'qualified'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Qualified
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'won')}
                    disabled={selectedLead.status === 'won'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Qualified
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'won')}
                    disabled={selectedLead.status === 'won'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Won
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}