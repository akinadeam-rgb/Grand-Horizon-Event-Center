/**
 * Data definitions and LocalStorage service for Grand Horizon Event Center
 */

const TIME_SLOTS = [
  { id: 's1', name: 'Morning', time: '08:00 AM - 11:00 AM', icon: 'fa-sun' },
  { id: 's2', name: 'Midday', time: '11:30 AM - 02:30 PM', icon: 'fa-cloud-sun' },
  { id: 's3', name: 'Afternoon', time: '03:00 PM - 06:00 PM', icon: 'fa-sun-plant-wilt' },
  { id: 's4', name: 'Late Afternoon', time: '06:30 PM - 09:30 PM', icon: 'fa-moon' },
  { id: 's5', name: 'Evening', time: '10:00 PM - 01:00 AM', icon: 'fa-star' }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EVENT_CATEGORIES = [
  'Corporate',
  'Wedding',
  'Workshop',
  'Concert',
  'Gala',
  'Exhibition',
  'Seminar',
  'Private Party',
  'Other'
];

const DEFAULT_SEED_REQUESTS = [
  {
    id: 'req-101',
    slotId: 'Monday-s1',
    day: 'Monday',
    slotIdOnly: 's1',
    slotName: 'Morning',
    slotTime: '08:00 AM - 11:00 AM',
    eventTitle: 'Annual Tech Summit 2026',
    organizer: 'Apex Innovations Ltd',
    category: 'Corporate',
    estimatedGuests: 120,
    notes: 'Requires main stage projector, podium setup, and standard wireless mic.',
    status: 'approved',
    createdAt: '2026-08-18T09:15:00Z'
  },
  {
    id: 'req-102',
    slotId: 'Monday-s3',
    day: 'Monday',
    slotIdOnly: 's3',
    slotName: 'Afternoon',
    slotTime: '03:00 PM - 06:00 PM',
    eventTitle: 'Q3 Regional Leadership Review',
    organizer: 'Horizon Dynamics',
    category: 'Corporate',
    estimatedGuests: 45,
    notes: 'Catering table set up at the rear. High-speed WiFi needed for remote stream.',
    status: 'pending',
    createdAt: '2026-08-19T08:30:00Z'
  },
  {
    id: 'req-103',
    slotId: 'Tuesday-s2',
    day: 'Tuesday',
    slotIdOnly: 's2',
    slotName: 'Midday',
    slotTime: '11:30 AM - 02:30 PM',
    eventTitle: 'Global AI Developers Workshop',
    organizer: 'DevStudio Inc',
    category: 'Workshop',
    estimatedGuests: 85,
    notes: 'Classroom seating layout required with dual power strips per table.',
    status: 'approved',
    createdAt: '2026-08-17T14:20:00Z'
  },
  {
    id: 'req-104',
    slotId: 'Wednesday-s4',
    day: 'Wednesday',
    slotIdOnly: 's4',
    slotName: 'Late Afternoon',
    slotTime: '06:30 PM - 09:30 PM',
    eventTitle: 'Johnson & Miller Wedding Reception',
    organizer: 'Sarah Johnson',
    category: 'Wedding',
    estimatedGuests: 200,
    notes: 'Dance floor setup, champagne tower table, and stage space for 4-piece live band.',
    status: 'pending',
    createdAt: '2026-08-19T11:45:00Z'
  },
  {
    id: 'req-105',
    slotId: 'Thursday-s1',
    day: 'Thursday',
    slotIdOnly: 's1',
    slotName: 'Morning',
    slotTime: '08:00 AM - 11:00 AM',
    eventTitle: 'Healthcare Innovation Symposium',
    organizer: 'MedCare Global Group',
    category: 'Seminar',
    estimatedGuests: 150,
    notes: 'Requires registration desk outside main hall and round breakout tables.',
    status: 'approved',
    createdAt: '2026-08-16T16:10:00Z'
  },
  {
    id: 'req-106',
    slotId: 'Friday-s3',
    day: 'Friday',
    slotIdOnly: 's3',
    slotName: 'Afternoon',
    slotTime: '03:00 PM - 06:00 PM',
    eventTitle: 'Contemporary Art Showcase',
    organizer: 'Creative Arts Guild',
    category: 'Exhibition',
    estimatedGuests: 90,
    notes: 'Modular easel stands setup. Requested slot adjustment.',
    status: 'cancelled',
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'req-107',
    slotId: 'Friday-s5',
    day: 'Friday',
    slotIdOnly: 's5',
    slotName: 'Evening',
    slotTime: '10:00 PM - 01:00 AM',
    eventTitle: 'Annual Charity Gala Dinner',
    organizer: 'Hope Foundation International',
    category: 'Gala',
    estimatedGuests: 250,
    notes: 'Formal banquet dining layout, spotlight stage lighting, and coat check room.',
    status: 'approved',
    createdAt: '2026-08-18T13:00:00Z'
  },
  {
    id: 'req-108',
    slotId: 'Saturday-s2',
    day: 'Saturday',
    slotIdOnly: 's2',
    slotName: 'Midday',
    slotTime: '11:30 AM - 02:30 PM',
    eventTitle: 'SaaSify v3.0 Product Launch Keynote',
    organizer: 'SaaSify Technologies',
    category: 'Corporate',
    estimatedGuests: 180,
    notes: 'Dual side projectors, LED backlighting, press conference seating area.',
    status: 'pending',
    createdAt: '2026-08-19T14:15:00Z'
  },
  {
    id: 'req-109',
    slotId: 'Saturday-s4',
    day: 'Saturday',
    slotIdOnly: 's4',
    slotName: 'Late Afternoon',
    slotTime: '06:30 PM - 09:30 PM',
    eventTitle: 'Summer Indie Rock Fest',
    organizer: 'Soundwave Live Events',
    category: 'Concert',
    estimatedGuests: 320,
    notes: 'Full concert sound system rig, security barrier setup, merchandise booth space.',
    status: 'approved',
    createdAt: '2026-08-14T18:00:00Z'
  },
  {
    id: 'req-110',
    slotId: 'Sunday-s3',
    day: 'Sunday',
    slotIdOnly: 's3',
    slotName: 'Afternoon',
    slotTime: '03:00 PM - 06:00 PM',
    eventTitle: 'Community Youth Mentorship Seminar',
    organizer: 'Civic Youth Alliance',
    category: 'Seminar',
    estimatedGuests: 65,
    notes: 'Theater-style seating layout with center aisle.',
    status: 'pending',
    createdAt: '2026-08-19T16:00:00Z'
  }
];

const STORAGE_KEY = 'grand_horizon_bookings_v1';

class StorageService {
  static getRequests() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveRequests(DEFAULT_SEED_REQUESTS);
        return DEFAULT_SEED_REQUESTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return DEFAULT_SEED_REQUESTS;
    }
  }

  static saveRequests(requests) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  static resetToSeedData() {
    this.saveRequests(DEFAULT_SEED_REQUESTS);
    return DEFAULT_SEED_REQUESTS;
  }

  static addRequest(newReq) {
    const requests = this.getRequests();
    requests.push(newReq);
    this.saveRequests(requests);
    return requests;
  }

  static updateRequestStatus(requestId, newStatus) {
    const requests = this.getRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      this.saveRequests(requests);
    }
    return requests;
  }

  static deleteRequest(requestId) {
    let requests = this.getRequests();
    requests = requests.filter(r => r.id !== requestId);
    this.saveRequests(requests);
    return requests;
  }
}
