import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, XCircleIcon, InfoIcon, SearchIcon, FilterIcon, ChevronDownIcon, ArchiveIcon, CalendarIcon, UserIcon, StarIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, DownloadIcon, PlusIcon, BuildingIcon, GlobeIcon, MapPinIcon, BriefcaseIcon, UsersIcon, HomeIcon, TagIcon, TruckIcon, FactoryIcon, PencilIcon, AlertCircleIcon } from 'lucide-react';
import { ZoneDetailsDrawer } from './ZoneDetailsDrawer';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Zone } from '../types';
import { Toast } from './ui/Toast';

// Mock data removed - using Supabase with RLS instead
/*
const mockZones = [{
  id: '1',
  name: 'Abu Dhabi Industrial City (ICAD)',
  type: 'Industrial Zone',
  status: 'Active',
  industries: ['Manufacturing', 'Logistics', 'Heavy Industry', 'Oil & Gas'],
  location: {
    city: 'Abu Dhabi',
    address: 'Mussafah, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.3587,
      lng: 54.5302
    },
    directions: 'Located 30km southwest of Abu Dhabi city center, accessible via E30 highway.'
  },
  establishedDate: '2006-05-15',
  totalArea: '40 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Abu_Dhabi_Industrial_City_logo.svg/1200px-Abu_Dhabi_Industrial_City_logo.svg.png',
  description: 'Abu Dhabi Industrial City (ICAD) is a major industrial zone developed by Abu Dhabi Ports Industrial Cities and Free Zone Cluster. It provides world-class infrastructure for manufacturing, logistics, and industrial activities.',
  phone: '+971-2-695-2000',
  email: 'info@icad.ae',
  website: 'https://www.zonescorp.com',
  keyFeatures: ['Strategically located near Khalifa Port', 'Comprehensive infrastructure including power, water, and telecommunications', 'Warehousing and logistics facilities', 'Worker accommodation within the zone'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Department of Economic Development',
    website: 'https://added.gov.ae'
  },
  associatedBusinesses: ['1', '10', '11'],
  incentives: [{
    title: 'Duty Free Import/Export',
    category: 'Tax',
    description: 'Exemption from import and export duties for raw materials and equipment.',
    eligibility: 'All manufacturing businesses operating within the zone.'
  }, {
    title: 'Competitive Lease Rates',
    category: 'Infrastructure',
    description: 'Long-term land leases at competitive rates compared to other industrial areas.',
    eligibility: 'All businesses establishing operations in the zone.'
  }, {
    title: 'Utilities Subsidies',
    category: 'Infrastructure',
    description: 'Subsidized rates for electricity, water, and gas for industrial operations.',
    eligibility: 'Manufacturing businesses with high energy consumption.'
  }],
  comparisonWithOtherZones: {
    description: 'ICAD offers more competitive rates for heavy industry compared to other zones in the region, with superior logistics connectivity to Khalifa Port.',
    advantages: ['Lower operational costs for manufacturing', 'Better connectivity to shipping routes', 'More spacious land plots for heavy industry']
  },
  customerServiceCenter: {
    phone: '+971-2-695-2222',
    email: 'support@icad.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 4:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 4:00 PM',
    Monday: '8:00 AM - 4:00 PM',
    Tuesday: '8:00 AM - 4:00 PM',
    Wednesday: '8:00 AM - 4:00 PM',
    Thursday: '8:00 AM - 4:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '2',
  name: 'Masdar City Free Zone',
  type: 'Free Zone',
  status: 'Active',
  industries: ['Renewable Energy', 'Clean Technology', 'Sustainability', 'Research & Development'],
  location: {
    city: 'Abu Dhabi',
    address: 'Masdar City, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4267,
      lng: 54.6133
    },
    directions: 'Located 17km east of Abu Dhabi city center, near Abu Dhabi International Airport.'
  },
  establishedDate: '2008-02-10',
  totalArea: '6 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Masdar_logo.svg/1200px-Masdar_logo.svg.png',
  description: 'Masdar City Free Zone is a pioneering sustainable urban development that provides a business-friendly environment for companies focused on clean energy, sustainability, and innovation. It offers a unique ecosystem that enables businesses to thrive and develop breakthrough technologies.',
  phone: '+971-2-653-3333',
  email: 'businessdevelopment@masdarcity.ae',
  website: 'https://www.masdarcityfreezone.com',
  keyFeatures: ['Sustainable urban development powered by renewable energy', 'Home to the Masdar Institute of Science and Technology', '100% foreign ownership', 'Zero carbon, zero waste community', 'Integrated with residential and commercial areas'],
  regulatoryAuthority: {
    name: 'Masdar City Free Zone Authority',
    website: 'https://www.masdarcityfreezone.com'
  },
  associatedBusinesses: ['7', '12'],
  incentives: [{
    title: '100% Foreign Ownership',
    category: 'Ownership',
    description: 'Ability to establish a business with 100% foreign ownership without a local partner.',
    eligibility: 'All businesses registering in the free zone.'
  }, {
    title: 'Tax Exemptions',
    category: 'Tax',
    description: 'Full exemption from corporate and personal income taxes.',
    eligibility: 'All businesses operating within the free zone.'
  }, {
    title: 'Simplified Visa Processing',
    category: 'Visa',
    description: 'Fast-track visa processing for employees and dependents.',
    eligibility: 'All registered businesses and their employees.'
  }, {
    title: 'Sustainability Grants',
    category: 'Funding',
    description: 'Special grants for businesses developing innovative sustainability solutions.',
    eligibility: 'Businesses focused on clean technology and sustainability innovation.'
  }],
  comparisonWithOtherZones: {
    description: 'Masdar City Free Zone offers a unique focus on sustainability and clean technology that distinguishes it from other free zones in the UAE.',
    advantages: ['Specialized ecosystem for clean technology and sustainability', 'Access to research institutions and innovation hubs', 'Lower carbon footprint for operations', 'Enhanced brand value through association with sustainability']
  },
  customerServiceCenter: {
    phone: '+971-2-653-3555',
    email: 'customerservice@masdarcity.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 5:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 5:00 PM',
    Monday: '8:00 AM - 5:00 PM',
    Tuesday: '8:00 AM - 5:00 PM',
    Wednesday: '8:00 AM - 5:00 PM',
    Thursday: '8:00 AM - 5:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '3',
  name: 'Khalifa Industrial Zone Abu Dhabi (KIZAD)',
  type: 'Industrial Zone',
  status: 'Active',
  industries: ['Manufacturing', 'Logistics', 'Trade', 'Food Processing', 'Pharmaceuticals', 'Metals'],
  location: {
    city: 'Abu Dhabi',
    address: 'Between Abu Dhabi and Dubai, UAE',
    coordinates: {
      lat: 24.4741,
      lng: 54.6342
    },
    directions: 'Located midway between Abu Dhabi and Dubai, adjacent to Khalifa Port.'
  },
  establishedDate: '2010-11-02',
  totalArea: '410 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/KIZAD_logo.svg/1200px-KIZAD_logo.svg.png',
  description: 'Khalifa Industrial Zone Abu Dhabi (KIZAD) is one of the largest industrial zones in the Middle East, integrated with Khalifa Port, offering excellent multimodal connectivity. It caters to a wide range of industries with customized solutions and world-class infrastructure.',
  phone: '+971-2-695-2777',
  email: 'info@kizad.ae',
  website: 'https://www.kizad.ae',
  keyFeatures: ["Integrated with Khalifa Port, one of the world's most advanced deep-water ports", 'Excellent multimodal connectivity (sea, road, air, and future rail)', 'Modular, flexible land plots and warehousing solutions', 'Vertically integrated clusters for specific industries', 'Hot and cold warehousing facilities'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Ports',
    website: 'https://www.adports.ae'
  },
  associatedBusinesses: ['1', '5', '10', '12'],
  incentives: [{
    title: 'Duty-Free Movement',
    category: 'Tax',
    description: 'Duty-free movement of goods between KIZAD and over 80 countries with which the UAE has free trade agreements.',
    eligibility: 'All businesses operating within KIZAD.'
  }, {
    title: 'Low Utility Costs',
    category: 'Infrastructure',
    description: 'Access to competitively priced utilities including electricity, water, and gas.',
    eligibility: 'All businesses operating within KIZAD.'
  }, {
    title: 'Khalifa Port Integration',
    category: 'Infrastructure',
    description: 'Direct access to Khalifa Port, reducing logistics costs and time to market.',
    eligibility: 'All businesses, with special advantages for manufacturing and trading companies.'
  }, {
    title: 'Customized Financing Solutions',
    category: 'Funding',
    description: 'Access to tailored financing options through partnerships with local banks.',
    eligibility: 'Businesses meeting minimum investment criteria.'
  }],
  comparisonWithOtherZones: {
    description: 'KIZAD offers superior port integration and larger scale operations compared to other industrial zones in the region.',
    advantages: ['Direct port access reducing logistics costs', 'Larger land plots for major industrial operations', 'Strategic location between Abu Dhabi and Dubai', 'Integrated industry clusters creating synergies']
  },
  customerServiceCenter: {
    phone: '+971-2-695-2700',
    email: 'customerservice@kizad.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 5:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 5:00 PM',
    Monday: '8:00 AM - 5:00 PM',
    Tuesday: '8:00 AM - 5:00 PM',
    Wednesday: '8:00 AM - 5:00 PM',
    Thursday: '8:00 AM - 5:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '4',
  name: 'Twofour54 Abu Dhabi',
  type: 'Business Park',
  status: 'Active',
  industries: ['Media', 'Entertainment', 'Digital Content', 'Gaming', 'Publishing'],
  location: {
    city: 'Abu Dhabi',
    address: 'Yas Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4884,
      lng: 54.3773
    },
    directions: 'Located on Yas Island, 30 minutes from Abu Dhabi city center.'
  },
  establishedDate: '2008-10-12',
  totalArea: '0.3 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Twofour54_logo.svg/1200px-Twofour54_logo.svg.png',
  description: "Twofour54 is Abu Dhabi's media and entertainment hub, named after the geographical coordinates of Abu Dhabi (24° North, 54° East). It provides a tax-free, supportive environment for content creators, media companies, and entertainment businesses.",
  phone: '+971-2-401-2454',
  email: 'info@twofour54.com',
  website: 'https://www.twofour54.com',
  keyFeatures: ['State-of-the-art production facilities and studios', 'Creative lab and innovation center', 'Media training academy', 'Content creation community', 'Post-production facilities'],
  regulatoryAuthority: {
    name: 'Media Zone Authority - Abu Dhabi',
    website: 'https://www.mzaabudhabi.ae'
  },
  associatedBusinesses: [],
  incentives: [{
    title: '100% Foreign Ownership',
    category: 'Ownership',
    description: 'Ability to establish a media business with 100% foreign ownership.',
    eligibility: 'All media and creative businesses registering in the zone.'
  }, {
    title: 'Tax Benefits',
    category: 'Tax',
    description: 'No corporate or personal income taxes.',
    eligibility: 'All businesses operating within twofour54.'
  }, {
    title: 'Rebate Program',
    category: 'Funding',
    description: 'Up to 30% rebate on qualifying production spend in Abu Dhabi.',
    eligibility: 'Film, TV, and commercial productions shooting in Abu Dhabi.'
  }, {
    title: 'Talent Development',
    category: 'Training',
    description: 'Access to training programs and talent development initiatives.',
    eligibility: 'Companies and individuals working in the creative industries.'
  }],
  comparisonWithOtherZones: {
    description: 'Twofour54 is specifically designed for media and entertainment businesses, offering specialized facilities unlike general business zones.',
    advantages: ['Specialized production facilities and equipment', 'Creative community and networking opportunities', 'Media-specific training and development', 'Production rebate program']
  },
  customerServiceCenter: {
    phone: '+971-2-401-2000',
    email: 'customerservice@twofour54.com',
    hours: 'Sunday - Thursday: 9:00 AM - 6:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '9:00 AM - 6:00 PM',
    Monday: '9:00 AM - 6:00 PM',
    Tuesday: '9:00 AM - 6:00 PM',
    Wednesday: '9:00 AM - 6:00 PM',
    Thursday: '9:00 AM - 6:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '5',
  name: 'Abu Dhabi Global Market (ADGM)',
  type: 'Free Zone',
  status: 'Active',
  industries: ['Financial Services', 'Banking', 'Wealth Management', 'Asset Management', 'FinTech'],
  location: {
    city: 'Abu Dhabi',
    address: 'Al Maryah Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4997,
      lng: 54.3894
    },
    directions: 'Located on Al Maryah Island, connected to Abu Dhabi city center by bridges.'
  },
  establishedDate: '2013-05-05',
  totalArea: '0.114 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Abu_Dhabi_Global_Market_logo.svg/1200px-Abu_Dhabi_Global_Market_logo.svg.png',
  description: 'Abu Dhabi Global Market (ADGM) is an international financial center and free zone established to create a broad-based financial services hub for local, regional, and international institutions. It operates under its own legal and regulatory framework based on English Common Law.',
  phone: '+971-2-333-8888',
  email: 'info@adgm.com',
  website: 'https://www.adgm.com',
  keyFeatures: ['Independent legal and regulatory framework based on English Common Law', 'Independent courts and arbitration center', 'World-class office facilities in the financial district', 'Strategic location in the heart of Abu Dhabi', 'Digital infrastructure and smart city integration'],
  regulatoryAuthority: {
    name: 'ADGM Financial Services Regulatory Authority',
    website: 'https://www.adgm.com/financial-services-regulatory-authority'
  },
  associatedBusinesses: ['4', '6'],
  incentives: [{
    title: 'Legal Framework',
    category: 'Regulatory',
    description: 'Direct application of English Common Law, providing legal certainty and familiarity for international businesses.',
    eligibility: 'All businesses operating within ADGM.'
  }, {
    title: '0% Tax Rate',
    category: 'Tax',
    description: 'Zero percent tax rate on profits for 50 years (guaranteed).',
    eligibility: 'All businesses operating within ADGM.'
  }, {
    title: '100% Foreign Ownership',
    category: 'Ownership',
    description: 'Full foreign ownership permitted for all types of entities.',
    eligibility: 'All businesses registering in ADGM.'
  }, {
    title: 'Digital Banking Framework',
    category: 'FinTech',
    description: 'Special regulatory framework for digital banking and FinTech companies.',
    eligibility: 'Financial technology companies and digital banks.'
  }],
  comparisonWithOtherZones: {
    description: 'ADGM offers a unique English Common Law framework that distinguishes it from other financial centers in the region.',
    advantages: ['Direct application of English Common Law', 'Independent court system', 'Specialized financial services ecosystem', "Strategic location in Abu Dhabi's new financial district"]
  },
  customerServiceCenter: {
    phone: '+971-2-333-8777',
    email: 'support@adgm.com',
    hours: 'Sunday - Thursday: 8:00 AM - 4:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 4:00 PM',
    Monday: '8:00 AM - 4:00 PM',
    Tuesday: '8:00 AM - 4:00 PM',
    Wednesday: '8:00 AM - 4:00 PM',
    Thursday: '8:00 AM - 4:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '6',
  name: 'Hub71 Abu Dhabi',
  type: 'Technology Hub',
  status: 'Active',
  industries: ['Technology', 'Startups', 'Venture Capital', 'AI', 'FinTech', 'HealthTech'],
  location: {
    city: 'Abu Dhabi',
    address: 'Al Maryah Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4997,
      lng: 54.3894
    },
    directions: 'Located within ADGM on Al Maryah Island.'
  },
  establishedDate: '2019-03-24',
  totalArea: '0.05 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Hub71_logo.svg/1200px-Hub71_logo.svg.png',
  description: "Hub71 is Abu Dhabi's global tech ecosystem that enables startups to scale globally. It brings together key enablers including capital providers, business enablers, and strategic partners to help startups succeed.",
  phone: '+971-2-699-0000',
  email: 'info@hub71.com',
  website: 'https://www.hub71.com',
  keyFeatures: ['Startup incentive program with subsidized housing, office space, and health insurance', 'Access to venture capital and investment networks', 'Mentorship and guidance from industry experts', 'Corporate innovation programs', 'Community events and networking opportunities'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Global Market',
    website: 'https://www.adgm.com'
  },
  associatedBusinesses: [],
  incentives: [{
    title: 'Incentive Program',
    category: 'Funding',
    description: 'Subsidies covering housing, office space, and health insurance for qualifying startups.',
    eligibility: 'Tech startups selected for the Hub71 Incentive Program.'
  }, {
    title: 'Accelerator Programs',
    category: 'Training',
    description: 'Access to specialized accelerator programs in various technology sectors.',
    eligibility: 'Startups at different growth stages depending on the program.'
  }, {
    title: 'Corporate Partnerships',
    category: 'Business Development',
    description: 'Opportunities to collaborate with major corporate partners and government entities.',
    eligibility: 'All startups in the Hub71 community.'
  }, {
    title: 'Regulatory Sandbox',
    category: 'Regulatory',
    description: 'Access to regulatory sandboxes for testing innovative solutions in controlled environments.',
    eligibility: 'FinTech, HealthTech, and other regulated industry startups.'
  }],
  comparisonWithOtherZones: {
    description: 'Hub71 is specifically focused on technology startups and scale-ups, offering a more comprehensive support ecosystem than general business zones.',
    advantages: ['Specialized startup support services', 'Access to venture capital and investment networks', 'Community of like-minded entrepreneurs and innovators', 'Corporate innovation partnerships']
  },
  customerServiceCenter: {
    phone: '+971-2-699-1000',
    email: 'support@hub71.com',
    hours: 'Sunday - Thursday: 9:00 AM - 6:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '9:00 AM - 6:00 PM',
    Monday: '9:00 AM - 6:00 PM',
    Tuesday: '9:00 AM - 6:00 PM',
    Wednesday: '9:00 AM - 6:00 PM',
    Thursday: '9:00 AM - 6:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '7',
  name: 'Zayed City Business District',
  type: 'Business Park',
  status: 'Developing',
  industries: ['Commercial', 'Retail', 'Hospitality', 'Corporate Offices', 'Mixed-Use'],
  location: {
    city: 'Abu Dhabi',
    address: 'Zayed City, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4125,
      lng: 54.5452
    },
    directions: 'Located in the new Zayed City development, south of Abu Dhabi city.'
  },
  establishedDate: '2020-01-15',
  totalArea: '4.5 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Zayed_City_logo.svg/1200px-Zayed_City_logo.svg.png',
  description: 'Zayed City Business District is a planned commercial center within the new Zayed City development. It will offer modern office spaces, retail areas, and mixed-use developments designed to attract corporate headquarters and international businesses.',
  phone: '+971-2-444-5000',
  email: 'info@zayedcity.ae',
  website: 'https://www.zayedcity.ae',
  keyFeatures: ['Modern, sustainable building designs', 'Smart city infrastructure and digital connectivity', 'Integrated transportation network', 'Mixed-use developments combining office, retail, and residential', 'Green spaces and pedestrian-friendly layout'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Department of Municipalities and Transport',
    website: 'https://www.dmt.gov.ae'
  },
  associatedBusinesses: [],
  incentives: [{
    title: 'Early Tenant Incentives',
    category: 'Infrastructure',
    description: 'Reduced rental rates and flexible terms for early tenants during the development phase.',
    eligibility: 'Businesses committing to space during the pre-completion phase.'
  }, {
    title: 'Smart Building Integration',
    category: 'Infrastructure',
    description: 'Access to smart building technologies and IoT infrastructure.',
    eligibility: 'All businesses operating within the district.'
  }],
  comparisonWithOtherZones: {
    description: 'Zayed City Business District offers newer infrastructure and smart city integration compared to older business districts in Abu Dhabi.',
    advantages: ['Modern infrastructure and building designs', 'Smart city technologies and digital integration', 'Part of a master-planned community', 'Sustainable design principles']
  },
  customerServiceCenter: {
    phone: '+971-2-444-5555',
    email: 'support@zayedcity.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 4:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 4:00 PM',
    Monday: '8:00 AM - 4:00 PM',
    Tuesday: '8:00 AM - 4:00 PM',
    Wednesday: '8:00 AM - 4:00 PM',
    Thursday: '8:00 AM - 4:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '8',
  name: 'Al Ain Industrial City',
  type: 'Industrial Zone',
  status: 'Active',
  industries: ['Manufacturing', 'Food Processing', 'Construction Materials', 'Logistics'],
  location: {
    city: 'Al Ain',
    address: 'Al Ain, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.1302,
      lng: 55.8013
    },
    directions: 'Located in the eastern region of Abu Dhabi Emirate, in Al Ain city.'
  },
  establishedDate: '2005-09-10',
  totalArea: '10 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Al_Ain_Industrial_City_logo.svg/1200px-Al_Ain_Industrial_City_logo.svg.png',
  description: 'Al Ain Industrial City provides industrial and logistics facilities in the eastern region of Abu Dhabi. It focuses on light and medium manufacturing, food processing, and regional distribution operations.',
  phone: '+971-3-702-2000',
  email: 'info@alainicity.ae',
  website: 'https://www.zonescorp.com/en/our-zones/al-ain-industrial-city',
  keyFeatures: ['Strategic location near Oman border and Saudi Arabia', 'Well-developed infrastructure for light and medium industries', 'Logistics and warehousing facilities', 'Access to abundant fresh water resources', 'Proximity to agricultural areas for food processing'],
  regulatoryAuthority: {
    name: 'ZonesCorp',
    website: 'https://www.zonescorp.com'
  },
  associatedBusinesses: ['11', '12'],
  incentives: [{
    title: 'Competitive Lease Rates',
    category: 'Infrastructure',
    description: 'Affordable long-term land leases compared to Abu Dhabi city industrial areas.',
    eligibility: 'All businesses establishing operations in the zone.'
  }, {
    title: 'Logistics Advantages',
    category: 'Infrastructure',
    description: 'Strategic location for serving UAE eastern region, Oman, and Saudi Arabia markets.',
    eligibility: 'Distribution and logistics companies.'
  }, {
    title: 'Water Resources',
    category: 'Infrastructure',
    description: "Access to Al Ain's natural water resources for water-intensive industries.",
    eligibility: 'Food processing and manufacturing businesses with high water requirements.'
  }],
  comparisonWithOtherZones: {
    description: 'Al Ain Industrial City offers lower operating costs compared to Abu Dhabi city industrial zones, with strategic access to eastern markets.',
    advantages: ['Lower land and operational costs', "Access to Al Ain's labor market", 'Strategic location for eastern UAE and Oman markets', 'Proximity to agricultural resources']
  },
  customerServiceCenter: {
    phone: '+971-3-702-2222',
    email: 'support@alainicity.ae',
    hours: 'Sunday - Thursday: 7:30 AM - 3:30 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '7:30 AM - 3:30 PM',
    Monday: '7:30 AM - 3:30 PM',
    Tuesday: '7:30 AM - 3:30 PM',
    Wednesday: '7:30 AM - 3:30 PM',
    Thursday: '7:30 AM - 3:30 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '9',
  name: 'Reem Island Business District',
  type: 'Business Park',
  status: 'Active',
  industries: ['Finance', 'Professional Services', 'Consulting', 'Real Estate', 'Retail'],
  location: {
    city: 'Abu Dhabi',
    address: 'Al Reem Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4945,
      lng: 54.3975
    },
    directions: 'Located on Al Reem Island, connected to Abu Dhabi city center by bridges.'
  },
  establishedDate: '2006-07-20',
  totalArea: '6.5 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Reem_Island_logo.svg/1200px-Reem_Island_logo.svg.png',
  description: 'Reem Island Business District is an upscale commercial area on Al Reem Island featuring modern office towers, mixed-use developments, and waterfront properties. It has become a popular location for corporate offices, professional services firms, and financial institutions.',
  phone: '+971-2-512-3000',
  email: 'info@reemisland.ae',
  website: 'https://www.reemisland.ae',
  keyFeatures: ['Premium Grade A office spaces', 'Waterfront location with scenic views', 'Mixed-use developments with residential and retail', 'Modern infrastructure and digital connectivity', 'Proximity to Abu Dhabi city center'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Department of Economic Development',
    website: 'https://added.gov.ae'
  },
  associatedBusinesses: ['4', '12'],
  incentives: [{
    title: 'Flexible Office Solutions',
    category: 'Infrastructure',
    description: 'Range of office solutions from small serviced offices to full floors in premium towers.',
    eligibility: 'All businesses seeking office space.'
  }, {
    title: 'Business Setup Support',
    category: 'Business Development',
    description: 'Streamlined business setup services through dedicated service providers.',
    eligibility: 'New businesses establishing operations in the district.'
  }],
  comparisonWithOtherZones: {
    description: 'Reem Island offers premium office spaces in a mixed-use environment, unlike purely commercial or industrial zones.',
    advantages: ['Premium office environment with waterfront views', 'Integrated living and working environment', 'Proximity to residential and lifestyle amenities', 'Modern, prestigious business address']
  },
  customerServiceCenter: {
    phone: '+971-2-512-3333',
    email: 'support@reemisland.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 6:00 PM\nFriday: 9:00 AM - 12:00 PM\nSaturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 6:00 PM',
    Monday: '8:00 AM - 6:00 PM',
    Tuesday: '8:00 AM - 6:00 PM',
    Wednesday: '8:00 AM - 6:00 PM',
    Thursday: '8:00 AM - 6:00 PM',
    Friday: '9:00 AM - 12:00 PM',
    Saturday: 'Closed'
  }
}, {
  id: '10',
  name: 'Abu Dhabi Airport Free Zone',
  type: 'Free Zone',
  status: 'Active',
  industries: ['Aviation', 'Logistics', 'E-commerce', 'Light Manufacturing', 'Trading'],
  location: {
    city: 'Abu Dhabi',
    address: 'Abu Dhabi International Airport, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.433,
      lng: 54.6511
    },
    directions: 'Located at Abu Dhabi International Airport, 30km east of Abu Dhabi city center.'
  },
  establishedDate: '2011-03-15',
  totalArea: '12 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Abu_Dhabi_Airports_Free_Zone_logo.svg/1200px-Abu_Dhabi_Airports_Free_Zone_logo.svg.png',
  description: 'Abu Dhabi Airport Free Zone offers a strategic location for aviation-related businesses, logistics operators, and trading companies. With direct access to Abu Dhabi International Airport, it provides excellent connectivity for businesses requiring air freight capabilities.',
  phone: '+971-2-505-3000',
  email: 'info@adafz.ae',
  website: 'https://www.adafz.ae',
  keyFeatures: ['Direct access to Abu Dhabi International Airport', 'Airside and landside facilities', 'Warehousing and logistics solutions', 'Office spaces and business centers', 'Cold chain facilities for perishable goods'],
  regulatoryAuthority: {
    name: 'Abu Dhabi Airports Company',
    website: 'https://www.adac.ae'
  },
  associatedBusinesses: ['2', '10'],
  incentives: [{
    title: '100% Foreign Ownership',
    category: 'Ownership',
    description: 'Ability to establish a business with 100% foreign ownership.',
    eligibility: 'All businesses registering in the free zone.'
  }, {
    title: 'Tax Exemptions',
    category: 'Tax',
    description: 'Exemption from corporate and personal income taxes.',
    eligibility: 'All businesses operating within the free zone.'
  }, {
    title: 'Customs Bonded Status',
    category: 'Tax',
    description: 'Goods can be imported, stored, and re-exported without customs duties.',
    eligibility: 'Trading and logistics companies.'
  }, {
    title: 'Air Freight Advantages',
    category: 'Infrastructure',
    description: 'Direct access to air freight facilities and cargo terminals.',
    eligibility: 'Logistics, e-commerce, and trading companies.'
  }],
  comparisonWithOtherZones: {
    description: 'Abu Dhabi Airport Free Zone offers unique air connectivity advantages compared to other free zones in the emirate.',
    advantages: ['Direct airport access', 'Faster air freight processing', 'Integrated customs facilities', 'Strategic location between Abu Dhabi and Dubai']
  },
  customerServiceCenter: {
    phone: '+971-2-505-3333',
    email: 'customerservice@adafz.ae',
    hours: 'Sunday - Thursday: 8:00 AM - 5:00 PM\nFriday - Saturday: Closed'
  },
  officeHours: {
    Sunday: '8:00 AM - 5:00 PM',
    Monday: '8:00 AM - 5:00 PM',
    Tuesday: '8:00 AM - 5:00 PM',
    Wednesday: '8:00 AM - 5:00 PM',
    Thursday: '8:00 AM - 5:00 PM',
    Friday: 'Closed',
    Saturday: 'Closed'
  }
}, {
  id: '11',
  name: 'Saadiyat Cultural District',
  type: 'Economic Zone',
  status: 'Active',
  industries: ['Culture', 'Arts', 'Tourism', 'Education', 'Luxury Retail', 'Hospitality'],
  location: {
    city: 'Abu Dhabi',
    address: 'Saadiyat Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.5431,
      lng: 54.4218
    },
    directions: 'Located on Saadiyat Island, 10 minutes from downtown Abu Dhabi.'
  },
  establishedDate: '2009-01-10',
  totalArea: '2.4 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d9/Saadiyat_Cultural_District_logo.svg/1200px-Saadiyat_Cultural_District_logo.svg.png',
  description: "Saadiyat Cultural District is Abu Dhabi's premier arts and cultural hub, home to world-class museums including the Louvre Abu Dhabi and the upcoming Guggenheim Abu Dhabi. It offers a unique environment for cultural institutions, creative businesses, and luxury retail.",
  phone: '+971-2-444-0444',
  email: 'info@saadiyatculturaldistrict.ae',
  website: 'https://www.saadiyatculturaldistrict.ae',
  keyFeatures: ['Home to world-renowned museums and cultural institutions', 'Architectural landmarks designed by Pritzker Prize-winning architects', 'Luxury retail and dining experiences', 'Educational and research facilities', 'High-end hospitality and tourism infrastructure'],
  regulatoryAuthority: {
    name: 'Department of Culture and Tourism - Abu Dhabi',
    website: 'https://dct.gov.ae'
  },
  associatedBusinesses: [],
  incentives: [{
    title: 'Cultural Institution Partnerships',
    category: 'Business Development',
    description: 'Opportunities to partner with world-class museums and cultural institutions.',
    eligibility: 'Creative businesses, educational institutions, and cultural organizations.'
  }, {
    title: 'Tourism Integration',
    category: 'Business Development',
    description: "Integration with Abu Dhabi's tourism promotion initiatives and visitor streams.",
    eligibility: 'Retail, hospitality, and visitor experience businesses.'
  }, {
    title: 'Creative Industry Support',
    category: 'Funding',
    description: 'Access to grants and support programs for creative and cultural businesses.',
    eligibility: 'Qualified creative industry businesses and cultural initiatives.'
  }],
  comparisonWithOtherZones: {
    description: 'Saadiyat Cultural District offers a unique focus on arts, culture, and premium experiences unlike any other zone in the UAE.',
    advantages: ['Association with world-class cultural brands', 'High-end visitor demographics', 'Architecturally significant environment', 'Integration with global cultural networks']
  },
  customerServiceCenter: {
    phone: '+971-2-444-0555',
    email: 'support@saadiyatculturaldistrict.ae',
    hours: 'Sunday - Thursday: 9:00 AM - 6:00 PM\nFriday - Saturday: 10:00 AM - 4:00 PM'
  },
  officeHours: {
    Sunday: '9:00 AM - 6:00 PM',
    Monday: '9:00 AM - 6:00 PM',
    Tuesday: '9:00 AM - 6:00 PM',
    Wednesday: '9:00 AM - 6:00 PM',
    Thursday: '9:00 AM - 6:00 PM',
    Friday: '10:00 AM - 4:00 PM',
    Saturday: '10:00 AM - 4:00 PM'
  }
}, {
  id: '12',
  name: 'Yas Island Economic Zone',
  type: 'Economic Zone',
  status: 'Active',
  industries: ['Entertainment', 'Tourism', 'Hospitality', 'Retail', 'Sports', 'Media'],
  location: {
    city: 'Abu Dhabi',
    address: 'Yas Island, Abu Dhabi, UAE',
    coordinates: {
      lat: 24.4821,
      lng: 54.6082
    },
    directions: 'Located on Yas Island, 30 minutes from Abu Dhabi city center, near Abu Dhabi International Airport.'
  },
  establishedDate: '2007-05-05',
  totalArea: '25 sq. km',
  logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Yas_Island_logo.svg/1200px-Yas_Island_logo.svg.png',
  description: "Yas Island Economic Zone is Abu Dhabi's premier entertainment and leisure destination, featuring world-class attractions including Ferrari World, Yas Waterworld, Warner Bros. World, and the Yas Marina Circuit. It offers opportunities for entertainment, hospitality, and tourism-related businesses.",
  phone: '+971-2-496-8000',
  email: 'info@yasisland.ae',
  website: 'https://www.yasisland.ae',
  keyFeatures: ['Home to world-class theme parks and attractions', 'Yas Marina Circuit (Formula 1 venue)', 'Retail and dining destinations', 'Hospitality and resort facilities', 'Entertainment and events infrastructure'],
  regulatoryAuthority: {
    name: 'Department of Culture and Tourism - Abu Dhabi',
    website: 'https://dct.gov.ae'
  },
  associatedBusinesses: ['4'],
  incentives: [{
    title: 'Tourism Ecosystem Integration',
    category: 'Business Development',
    description: "Integration with Yas Island's 25+ million annual visitors and tourism ecosystem.",
    eligibility: 'Tourism, hospitality, retail, and entertainment businesses.'
  }, {
    title: 'Event Partnership Opportunities',
    category: 'Business Development',
    description: 'Opportunities to participate in and leverage major events including Formula 1 and concerts.',
    eligibility: 'Event-related businesses, hospitality, and service providers.'
  }, {
    title: 'Entertainment Industry Support',
    category: 'Business Development',
    description: 'Specialized support for entertainment industry businesses and attractions.',
    eligibility: 'Entertainment companies, attraction operators, and related services.'
  }],
  comparisonWithOtherZones: {
    description: 'Yas Island offers unique advantages for tourism and entertainment businesses due to its established attractions and visitor base.',
    advantages: ['Access to established tourism flows', 'Entertainment and leisure ecosystem', 'Major event hosting capabilities', 'Strategic location between Abu Dhabi city and the airport']
  },
  customerServiceCenter: {
    phone: '+971-2-496-8888',
    email: 'support@yasisland.ae',
    hours: 'Sunday - Thursday: 9:00 AM - 6:00 PM\nFriday - Saturday: 10:00 AM - 8:00 PM'
  },
  officeHours: {
    Sunday: '9:00 AM - 6:00 PM',
    Monday: '9:00 AM - 6:00 PM',
    Tuesday: '9:00 AM - 6:00 PM',
    Wednesday: '9:00 AM - 6:00 PM',
    Thursday: '9:00 AM - 6:00 PM',
    Friday: '10:00 AM - 8:00 PM',
    Saturday: '10:00 AM - 8:00 PM'
  }
}];
*/
export const ZonesClustersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data: zonesData, loading, error, list } = useCRUD<Zone>('eco_zones');

  // Permission checks
  const canCreate = role === 'admin' || role === 'editor';

  // Use Supabase data directly - RLS will handle filtering
  const displayZones = zonesData;
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Use state to manage the zones data
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [zoneType, setZoneType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Load zones from database on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        await list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' });
      } catch (err) {
        console.error('Failed to load zones from database:', err);
        showToast('error', 'Failed to load zones. Please try again.');
      }
    };

    loadZones();
  }, [list]);

  // Check URL for deep linking on initial render
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const zoneId = urlParams.get('zoneId');
    const view = urlParams.get('view');
    if (zoneId) {
      const zone = displayZones.find(z => z.id === zoneId);
      if (zone) {
        setSelectedZone(zone);
        setIsDrawerOpen(true);
      }
    }
  }, [displayZones]);
  // Summary data calculation based on current zones
  const summaryData = [{
    id: 'industrial',
    title: 'Industrial Zones',
    count: displayZones.filter(zone => zone.type === 'Industrial Zone').length,
    icon: FactoryIcon,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200'
  }, {
    id: 'free',
    title: 'Free Zones',
    count: displayZones.filter(zone => zone.type === 'Free Zone').length,
    icon: GlobeIcon,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  }, {
    id: 'business',
    title: 'Business Parks',
    count: displayZones.filter(zone => zone.type === 'Business Park').length,
    icon: BuildingIcon,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-200'
  }, {
    id: 'economic',
    title: 'Economic Zones',
    count: displayZones.filter(zone => zone.type === 'Economic Zone' || zone.type === 'Technology Hub').length,
    icon: BriefcaseIcon,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200'
  }];
  // Get all unique industries across all zones
  const getAllIndustries = () => {
    const industriesSet = new Set<string>();
    displayZones.forEach(zone => {
      zone.industries.forEach(industry => {
        industriesSet.add(industry);
      });
    });
    return Array.from(industriesSet).sort();
  };
  // Get all unique locations (cities)
  const getAllLocations = () => {
    const locationsSet = new Set<string>();
    displayZones.forEach(zone => {
      if (zone.location && zone.location.city) {
        locationsSet.add(zone.location.city);
      }
    });
    return Array.from(locationsSet).sort();
  };
  const uniqueIndustries = getAllIndustries();
  const uniqueLocations = getAllLocations();
  // Filter and sort zones
  const filteredZones = displayZones.filter(zone => {
    // Filter by type
    if (zoneType !== 'All' && zone.type !== zoneType) return false;
    // Filter by status
    if (statusFilter !== 'All' && zone.status !== statusFilter) return false;
    // Filter by industry
    if (industryFilter !== 'All') {
      if (!zone.industries.includes(industryFilter)) return false;
    }
    // Filter by location
    if (locationFilter !== 'All') {
      if (zone.location?.city !== locationFilter) return false;
    }
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const establishedDate = new Date(zone.establishedDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      if (establishedDate < startDate || establishedDate > endDate) return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return zone.name.toLowerCase().includes(query) || zone.type.toLowerCase().includes(query) || zone.industries.some(industry => industry.toLowerCase().includes(query)) || zone.description && zone.description.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    // Sort by name
    if (sortOrder === 'A-Z') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'Z-A') {
      return b.name.localeCompare(a.name);
    }
    // Sort by established date
    else if (sortOrder === 'Oldest First') {
      return new Date(a.establishedDate).getTime() - new Date(b.establishedDate).getTime();
    } else if (sortOrder === 'Newest First') {
      return new Date(b.establishedDate).getTime() - new Date(a.establishedDate).getTime();
    }
    return 0;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredZones.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredZones.length);
  const paginatedZones = filteredZones.slice(startIndex, endIndex);
  // Render zone type with appropriate styling
  const renderType = (type: string) => {
    const typeStyles: Record<string, string> = {
      'Free Zone': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Industrial Zone': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Business Park': 'bg-green-100 text-green-800 border border-green-200',
      'Economic Zone': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Technology Hub': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>;
  };
  // Render zone status with appropriate styling
  const renderStatus = (status: string) => {
    const statusStyles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border border-green-200',
      Developing: 'bg-amber-100 text-amber-800 border border-amber-200',
      Planned: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>;
  };
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Handle row click to open drawer
  const handleRowClick = (zoneId: string) => {
    const zone = displayZones.find(item => item.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setIsDrawerOpen(true);
      // Update URL with zoneId parameter for deep linking
      const url = new URL(window.location.href);
      url.searchParams.set('zoneId', zoneId);
      url.searchParams.set('view', 'drawer');
      window.history.replaceState({}, '', url.toString());
    }
  };
  // Handle row keyboard interaction
  const handleRowKeyDown = (e: React.KeyboardEvent, zoneId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(zoneId);
    }
  };
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Clear URL parameters when drawer closes
    const url = new URL(window.location.href);
    url.searchParams.delete('zoneId');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url.toString());
  };
  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };
  // Handle date filter toggle
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };
  // Handle clear all filters
  const handleClearFilters = () => {
    setZoneType('All');
    setStatusFilter('All');
    setIndustryFilter('All');
    setLocationFilter('All');
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, zoneId: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/zone-form/${zoneId}`);
  };
  // Handle create new zone
  const handleCreateZone = () => {
    navigate('/zone-form');
  };

  // Show loading state
  if (loading && displayZones.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading zones...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
          <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load zones</h2>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || 'An error occurred while loading zones.'}
          </p>
          <button
            onClick={() => list({}, { page: 1, pageSize: 1000, sortBy: 'name', sortOrder: 'asc' })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <div className="px-3 py-3 bg-gray-50 min-h-screen">
    {/* Page Header */}
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
            Zones & Clusters
          </h1>
          <div className="relative group hidden sm:block">
            <InfoIcon className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-72 bg-white p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-sm text-gray-700">
                Explore business zones and clusters in Abu Dhabi to understand
                the business ecosystem and identify suitable locations.
              </p>
            </div>
          </div>
        </div>
        {/* Add button in the header */}
        {canCreate && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md shadow-sm flex items-center justify-center text-sm font-medium hidden sm:flex" onClick={handleCreateZone}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Zone
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 text-center sm:text-left">
        Browse and discover business zones across various industries in Abu
        Dhabi.
      </p>
    </div>
    {/* Summary Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
      {summaryData.map(item => <div key={item.id} className="rounded-xl shadow-sm border border-gray-100 bg-white px-3 py-3 hover:shadow-md transition-all duration-200 ease-in-out">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${item.color} mr-2`}>
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-[13px] text-gray-600 font-medium">
              {item.title}
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              {item.count}
            </p>
          </div>
        </div>
      </div>)}
    </div>
    {/* Toolbar */}
    <div className="sticky top-[3.5rem] bg-gray-50 z-20 pb-2">
      <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs" placeholder="Search zones..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          {/* Filter Chips */}
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={zoneType} onChange={e => setZoneType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Free Zone">Free Zone</option>
                <option value="Industrial Zone">Industrial Zone</option>
                <option value="Business Park">Business Park</option>
                <option value="Economic Zone">Economic Zone</option>
                <option value="Technology Hub">Technology Hub</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Developing">Developing</option>
                <option value="Planned">Planned</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}>
                <option value="All">All Industries</option>
                {uniqueIndustries.map(industry => <option key={industry} value={industry}>
                  {industry}
                </option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                <option value="All">All Locations</option>
                {uniqueLocations.map(location => <option key={location} value={location}>
                  {location}
                </option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-[140px] relative">
              <select className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="A-Z">Name (A-Z)</option>
                <option value="Z-A">Name (Z-A)</option>
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={toggleDateFilter}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Established Date</span>
              </button>
            </div>
            <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                <DownloadIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
            {(zoneType !== 'All' || statusFilter !== 'All' || industryFilter !== 'All' || locationFilter !== 'All' || dateRange.startDate || dateRange.endDate || searchQuery) && <div className="flex-shrink-0">
              <button className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>}
          </div>
        </div>
        {/* Date Range Filter */}
        {showDateFilter && <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input type="date" id="start-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.startDate} onChange={e => setDateRange({
                  ...dateRange,
                  startDate: e.target.value
                })} />
              </div>
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input type="date" id="end-date" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={dateRange.endDate} onChange={e => setDateRange({
                  ...dateRange,
                  endDate: e.target.value
                })} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-3">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={() => {
              setDateRange({
                startDate: '',
                endDate: ''
              });
            }}>
              Clear Dates
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors duration-150" onClick={toggleDateFilter}>
              Apply
            </button>
          </div>
        </div>}
      </div>
    </div>
    {/* Zones Table - Desktop and Tablet View */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 hidden md:block mt-2">
      <div className="p-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Zones & Clusters
          </h2>
          {filteredZones.length > 0 && <p className="text-sm text-gray-500 mt-1 sm:mt-0">
            Showing {startIndex + 1}-{endIndex} of {filteredZones.length}{' '}
            zones
          </p>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Industries
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider hidden lg:table-cell">
                Established
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                Location
              </th>
              <th scope="col" className="relative px-4 py-3 w-20">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedZones.length === 0 ? <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                No zones found
              </td>
            </tr> : paginatedZones.map(zone => <tr key={zone.id} onClick={() => handleRowClick(zone.id)} onKeyDown={e => handleRowKeyDown(e, zone.id)} tabIndex={0} role="button" className="cursor-pointer hover:bg-gray-50 transition-colors duration-150" aria-label={`View details for ${zone.name}`}>
              <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                {zone.name}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {renderType(zone.type)}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                <div className="flex flex-wrap gap-1">
                  {zone.industries.slice(0, 2).map((industry, idx) => <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
                    {industry}
                  </span>)}
                  {zone.industries.length > 2 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                    +{zone.industries.length - 2}
                  </span>}
                </div>
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {renderStatus(zone.status)}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700 text-right hidden lg:table-cell">
                {formatDate(zone.establishedDate)}
              </td>
              <td className="px-4 py-3 text-[13px] text-gray-700">
                {zone.location ? zone.location.city : '-'}
              </td>
              <td className="px-4 py-3 text-[13px] text-right text-gray-500">
                <div className="flex justify-end space-x-2">
                  <button onClick={e => handleEditClick(e, zone.id)} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${zone.name}`}>
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleRowClick(zone.id)} className="text-gray-500 hover:text-gray-700" aria-label={`View ${zone.name}`}>
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {/* Zones Mobile Card View */}
    <div className="md:hidden space-y-3 mt-2">
      {paginatedZones.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">No zones found</p>
      </div> : paginatedZones.map(zone => <div key={zone.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
            {zone.name}
          </h3>
          {renderStatus(zone.status)}
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">{zone.type}</span>
          </div>
          <div>
            <span className="text-gray-500">Established:</span>{' '}
            <span className="font-medium">
              {formatDate(zone.establishedDate)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>{' '}
            <span className="font-medium">
              {zone.location ? zone.location.city : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Area:</span>{' '}
            <span className="font-medium">{zone.totalArea || '-'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {zone.industries.slice(0, 3).map((industry, idx) => <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
            {industry}
          </span>)}
          {zone.industries.length > 3 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            +{zone.industries.length - 3}
          </span>}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <BriefcaseIcon className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-[11px] text-gray-700">
              {zone.associatedBusinesses ? zone.associatedBusinesses.length : 0}{' '}
              businesses
            </span>
          </div>
          <div className="flex space-x-3">
            <button className="text-blue-600 text-[12px] font-medium flex items-center" onClick={e => {
              e.stopPropagation();
              handleEditClick(e, zone.id);
            }}>
              Edit
            </button>
            <button className="text-gray-600 text-[12px] font-medium flex items-center" onClick={() => handleRowClick(zone.id)}>
              View
              <ChevronRightIcon className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>)}
    </div>
    {/* Pagination Controls */}
    {filteredZones.length > 0 && <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-4 sm:mb-0">
        <label htmlFor="rows-per-page" className="text-[12px] sm:text-sm text-gray-600 mr-2">
          Rows per page:
        </label>
        <select id="rows-per-page" className="border border-gray-300 rounded-md text-[12px] sm:text-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center justify-center">
          <button onClick={handlePreviousPage} disabled={currentPage === 1} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex">
            {/* Show limited page numbers with ellipsis for large page counts */}
            {Array.from({
              length: totalPages
            }, (_, i) => i + 1).filter(page => {
              // Show current page, first and last pages, and pages around current
              return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
            }).map((page, i, arr) => <Fragment key={page}>
              {i > 0 && arr[i - 1] !== page - 1 && <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm text-gray-500 border-t border-b border-gray-300">
                ...
              </span>}
              <button onClick={() => handlePageChange(page)} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border-t border-b border-gray-300 ${currentPage === page ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'} ${i === 0 && page !== 1 ? 'border-l border-gray-300' : ''}`}>
                {page}
              </button>
            </Fragment>)}
          </div>
          {/* Simple mobile pagination */}
          <div className="flex sm:hidden items-center border-t border-b border-gray-300 px-3 py-1">
            <span className="text-[12px] text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-[12px] sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {startIndex + 1}-{endIndex} of {filteredZones.length}
        </div>
      </div>
    </div>}
    {/* Empty State */}
    {filteredZones.length === 0 && <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
      <div className="mx-auto max-w-md">
        <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
          <FilterIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          No zones found for this filter
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search or filter criteria to find what you're
          looking for.
        </p>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      </div>
    </div>}
    {/* Floating Action Button */}
    {canCreate && (
      <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200" aria-label="Add new zone" onClick={handleCreateZone}>
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    )}
    {/* Zone Details Drawer */}
    {selectedZone && <ZoneDetailsDrawer isOpen={isDrawerOpen} onClose={handleDrawerClose} zone={selectedZone} />}
  </div>;
};