export interface Prospect {
    name: string;
    type: string;
    equipment: string;
    priority: 'High' | 'Medium' | 'Low';
    address: string;
    rating: string;
}

export interface EquipmentTypeMap {
    [key: string]: string[];
}

export interface IndustryToPlaceTypeMap {
    [key: string]: string;
}


export const INDUSTRIES: string[] = [
    'Restaurants & Food Service',
    'Construction & Contracting',
    'Retail & E-commerce',
    'Healthcare & Medical',
    'Beauty & Wellness',
    'Automotive Services'
];

export const EQUIPMENT_TYPES: EquipmentTypeMap = {
    'Restaurants & Food Service': ['POS Systems', 'Kitchen Equipment', 'Seating & Furniture', 'Delivery Vehicles'],
    'Construction & Contracting': ['Small Tools', 'Safety Equipment', 'Vehicles & Trailers', 'Office Equipment'],
    'Retail & E-commerce': ['POS Systems', 'Display Equipment', 'Security Systems', 'Packaging Equipment'],
    'Healthcare & Medical': ['Diagnostic Equipment', 'Office Furniture', 'IT Equipment', 'Patient Care Items'],
    'Beauty & Wellness': ['Salon Equipment', 'Fitness Equipment', 'Treatment Tables', 'POS Systems'],
    'Automotive Services': ['Diagnostic Tools', 'Lifts & Equipment', 'Office Systems', 'Safety Equipment']
};

export const INDUSTRY_TO_PLACE_TYPE_MAP: IndustryToPlaceTypeMap = {
    'Restaurants & Food Service': 'restaurant',
    'Construction & Contracting': 'general_contractor',
    'Retail & E-commerce': 'store',
    'Healthcare & Medical': 'doctor',
    'Beauty & Wellness': 'beauty_salon',
    'Automotive Services': 'car_repair'
};

// For suggested equipment needs based on search type
export const SUGGESTED_EQUIPMENT_NEEDS: { [key: string]: string[] } = {
    'restaurant': ['POS System upgrade', 'Kitchen equipment lease', 'Delivery vehicle financing'],
    'general_contractor': ['Tool financing', 'Vehicle lease', 'Equipment upgrade'],
    'store': ['POS system', 'Display equipment', 'Security systems'],
    'doctor': ['Medical equipment', 'Office furniture', 'IT systems'],
    'beauty_salon': ['Salon equipment', 'POS systems', 'Furniture upgrade'],
    'car_repair': ['Diagnostic tools', 'Lift equipment', 'Tool financing']
};

// Fallback sample prospects if API fails or returns no results
export const FALLBACK_SAMPLE_PROSPECTS = (city: string, industry: string): Prospect[] => [
    { name: `${city} ${industry.split(' ')[0]} Business`, type: industry, equipment: 'POS System upgrade needed', priority: 'High', address: `${city} area`, rating: '4.1' },
    { name: `Metro ${industry.split(' ')[0]} Co.`, type: industry, equipment: 'Equipment financing inquiry', priority: 'Medium', address: `${city} area`, rating: '3.8' },
    { name: `${city} Business Solutions`, type: industry, equipment: 'Expansion equipment needed', priority: 'High', address: `${city} area`, rating: '3.2' },
    { name: `Local ${industry.split(' ')[0]} LLC`, type: industry, equipment: 'Technology upgrade required', priority: 'Medium', address: `${city} area`, rating: '4.3' },
    { name: `${city} Professional Services`, type: industry, equipment: 'Office equipment lease', priority: 'Low', address: `${city} area`, rating: '4.7' }
];