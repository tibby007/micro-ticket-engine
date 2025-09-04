import React, { useState, useEffect } from 'react';
import { Mail, Phone, Globe, MapPin, Tag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, LeadJob } from '../types';

interface LeadsPipelineProps {
  activeJobs: string[];
}

export function LeadsPipeline({ activeJobs }: LeadsPipelineProps) {
  const [jobs, setJobs] = useState<{ [jobId: string]: LeadJob }>({});
  const [leads, setLeads] = useState<{ [jobId: string]: Lead[] }>({});

  useEffect(() => {
    const fetchJobData = async () => {
      for (const jobId of activeJobs) {
        try {
          const [jobStatus, jobResults] = await Promise.all([
            api.getJobStatus(jobId),
            api.getJobResults(jobId).catch(() => ({ leads: [] }))
          ]);
          
          setJobs(prev => ({ ...prev, [jobId]: jobStatus }));
          setLeads(prev => ({ ...prev, [jobId]: jobResults.leads }));
        } catch (error) {
          console.error(`Failed to fetch data for job ${jobId}:`, error);
        }
      }
    };

    if (activeJobs.length > 0) {
      fetchJobData();
      const interval = setInterval(fetchJobData, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeJobs]);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await api.updateLead(leadId, newStatus);
      
      // Update local state
      setLeads(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(jobId => {
          updated[jobId] = updated[jobId].map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const getLeadsByStatus = (status: Lead['status']): Lead[] => {
    return Object.values(leads).flat().filter(lead => lead.status === status);
  };

  const getStatusIcon = (status: Lead['status']) => {
    switch (status) {
      case 'searching': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'returned': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'emailed': return <Mail className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'searching': return 'bg-yellow-50 border-yellow-200';
      case 'returned': return 'bg-blue-50 border-blue-200';
      case 'emailed': return 'bg-green-50 border-green-200';
    }
  };

  const columns = [
    { id: 'searching', title: 'Searching', status: 'searching' as const },
    { id: 'returned', title: 'Returned', status: 'returned' as const },
    { id: 'emailed', title: 'Emailed', status: 'emailed' as const },
  ];

  if (activeJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Active Jobs
        </h3>
        <p className="text-gray-500">
          Start a new lead search to see your pipeline here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Status Cards */}
      <div className="grid gap-4">
        {Object.values(jobs).map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                {job.searchParams.industry} in {job.searchParams.city}, {job.searchParams.state}
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'completed' ? 'bg-green-100 text-green-800' :
                job.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {job.status}
              </span>
            </div>
            {job.status === 'searching' && (
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{job.processed} / {job.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600">{job.message}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnLeads = getLeadsByStatus(column.status);
          
          return (
            <div key={column.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(column.status)}
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {columnLeads.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(lead.status)}`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {lead.businessName}
                    </h4>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      {lead.contactInfo.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{lead.contactInfo.email}</span>
                        </div>
                      )}
                      {lead.contactInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{lead.contactInfo.phone}</span>
                        </div>
                      )}
                      {lead.contactInfo.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{lead.contactInfo.website}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {lead.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{lead.tags.length - 2} more
                          </span>
                        )}
                      </div>

                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="searching">Searching</option>
                        <option value="returned">Returned</option>
                        <option value="emailed">Emailed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {columnLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                      {getStatusIcon(column.status)}
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
  );
}