import { useState, useEffect } from 'react';
import { Mail, Phone, Globe, MapPin, CheckCircle, Search, Building, Users, Target, Star } from 'lucide-react';
import type { Lead } from '../types';

interface LeadsPipelineProps {
  leads: Lead[];
}

export function LeadsPipeline({ leads }: LeadsPipelineProps) {
  const [items, setItems] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    // Normalize incoming leads: ensure unique id and stage
    const ts = Date.now();
    const normalized = (leads || []).map((lead, idx) => ({
      ...lead,
      stage: lead.stage || 'New',
      id: `${lead.id || `${lead.name || 'lead'}-${lead.city || ''}-${lead.state || ''}-${ts}`}-${idx}`,
      createdAt: lead.createdAt || new Date().toISOString(),
      source: (lead as any).source || 'outscraper',
    } as Lead));
    setItems(normalized);
  }, [leads]);

  const handleStageChange = (leadId: string, newStage: Lead['stage']) => {
    setItems(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }
  };

  const getLeadsByStage = (stage: Lead['stage']): Lead[] => items.filter(lead => lead.stage === stage);

  const getStageColor = (stage: Lead['stage']) => {
    switch (stage) {
      case 'New': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'Contacted': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'Qualified': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'Disqualified': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'Won': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
    }
  };

  const columns = [
    { id: 'new', title: 'New Leads', stage: 'New' as const, icon: Users },
    { id: 'contacted', title: 'Contacted', stage: 'Contacted' as const, icon: Mail },
    { id: 'qualified', title: 'Qualified', stage: 'Qualified' as const, icon: CheckCircle },
    { id: 'disqualified', title: 'Disqualified', stage: 'Disqualified' as const, icon: Target },
    { id: 'won', title: 'Won', stage: 'Won' as const, icon: Building },
  ];

  const totalLeads = items.length;
  if (totalLeads === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
          <Building className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Generate Leads?
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Start your first lead search to discover real businesses from Google Maps for your funding offers.
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
            <div className="text-gray-600">AI finds real businesses from Google Maps</div>
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
              <p className="text-sm font-medium text-gray-600">Won</p>
              <p className="text-2xl font-bold text-gray-900">{getLeadsByStage('Won').length}</p>
            </div>
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {totalLeads > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Lead Pipeline</h3>
          <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 overflow-x-auto">
            {columns.map((column) => {
              const columnLeads = getLeadsByStage(column.stage);
              
              return (
                <div key={column.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <column.icon className={`w-6 h-6 ${
                      column.stage === 'New' ? 'text-blue-500' :
                      column.stage === 'Contacted' ? 'text-yellow-500' :
                      column.stage === 'Qualified' ? 'text-green-500' :
                      column.stage === 'Disqualified' ? 'text-red-500' :
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
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${getStageColor(lead.stage)}`}
                      >
                        <h5 className="font-semibold text-gray-900 mb-3 text-lg">
                          {lead.name}
                        </h5>
                        
                        {/* Rating */}
                        {lead.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{lead.rating}</span>
                            {lead.reviewsCount && (
                              <span className="text-xs text-gray-500">({lead.reviewsCount} reviews)</span>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {lead.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                          {lead.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{lead.website}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {lead.category}
                          </span>

                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead.id, e.target.value as Lead['stage'])}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Disqualified">Disqualified</option>
                            <option value="Won">Won</option>
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
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h3>
                {selectedLead.rating && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-700">{selectedLead.rating}</span>
                    {selectedLead.reviewsCount && (
                      <span className="text-sm text-gray-500">({selectedLead.reviewsCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
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
                  {selectedLead.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  {selectedLead.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a 
                        href={selectedLead.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedLead.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{selectedLead.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span>{selectedLead.city}, {selectedLead.state}</span>
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
                  
                  <div>
                    <span className="text-sm text-gray-600">Source:</span>
                    <div className="font-medium capitalize">{selectedLead.source}</div>
                  </div>
                  
                  {Array.isArray(selectedLead.equipmentRecommendations) && selectedLead.equipmentRecommendations.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Equipment Recommendations:</span>
                      <ul className="list-disc list-inside text-sm text-gray-800 mt-1">
                        {selectedLead.equipmentRecommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedLead.workingHours && (
                    <div>
                      <span className="text-sm text-gray-600">Hours:</span>
                      <div className="font-medium text-sm">{selectedLead.workingHours ?? ''}</div>
                    </div>
                  )}
                  
                  {selectedLead.googleId && (
                    <div>
                      <span className="text-sm text-gray-600">Google Business:</span>
                      <div className="font-medium text-xs text-green-600">Verified</div>
                    </div>
                  )}
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
                    onClick={() => handleStageChange(selectedLead.id, 'Contacted')}
                    disabled={selectedLead.stage === 'Contacted'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => handleStageChange(selectedLead.id, 'Qualified')}
                    disabled={selectedLead.stage === 'Qualified'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Qualified
                  </button>
                  <button
                    onClick={() => handleStageChange(selectedLead.id, 'Won')}
                    disabled={selectedLead.stage === 'Won'}
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
