import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, BarChart3, Plus, Camera, MapPin, Clock, User, Building, ChevronLeft, ChevronRight, Bell, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, AlertCircle, TrendingUp, Target, Award, DollarSign, Percent, Mic, MicOff, Square } from 'lucide-react';

const SalesTrackerApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Speech-to-Text functionality
  const useSpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setIsSupported(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }, []);

    const startListening = () => {
      if (recognitionRef.current && isSupported) {
        setIsListening(true);
        recognitionRef.current.start();
      }
    };

    const stopListening = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    const resetTranscript = () => {
      setTranscript('');
    };

    return {
      isListening,
      transcript,
      isSupported,
      startListening,
      stopListening,
      resetTranscript
    };
  };

  // Pipeline stages configuration
  const pipelineStages = [
    { id: 'prospect', name: 'Prospect', color: 'bg-gray-500' },
    { id: 'contact-made', name: 'Contact Made', color: 'bg-blue-500' },
    { id: 'meeting-held', name: 'Meeting Held', color: 'bg-yellow-500' },
    { id: 'proposal-sent', name: 'Proposal Sent', color: 'bg-orange-500' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-500' },
    { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
    { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' }
  ];

  // Enhanced initial data with expanded dataset
  const [agents, setAgents] = useState([
    { id: 1, name: 'John Smith', organization: 'ABC Insurance', email: 'john@abc.com', phone: '+1-555-0123', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-01', pipelineStage: 'negotiation', dealValue: 85000, expectedCloseDate: '2024-03-30', probability: 75 },
    { id: 2, name: 'Sarah Johnson', organization: 'XYZ Financial', email: 'sarah@xyz.com', phone: '+1-555-0124', status: 'Active', addedBy: 'Maria Garcia', dateAdded: '2024-03-02', pipelineStage: 'proposal-sent', dealValue: 125000, expectedCloseDate: '2024-04-15', probability: 60 },
    { id: 3, name: 'Mike Chen', organization: 'Global Advisors', email: 'mike@global.com', phone: '+1-555-0125', status: 'Prospect', addedBy: 'Alex Johnson', dateAdded: '2024-03-03', pipelineStage: 'meeting-held', dealValue: 65000, expectedCloseDate: '2024-04-10', probability: 45 },
    { id: 4, name: 'Lisa Rodriguez', organization: 'Premier Solutions', email: 'lisa@premier.com', phone: '+1-555-0126', status: 'Active', addedBy: 'David Chen', dateAdded: '2024-03-04', pipelineStage: 'meeting-held', dealValue: 95000, expectedCloseDate: '2024-04-20', probability: 50 },
    { id: 5, name: 'Robert Taylor', organization: 'Pacific Mutual', email: 'robert@pacific.com', phone: '+1-555-0127', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-05', pipelineStage: 'contact-made', dealValue: 75000, expectedCloseDate: '2024-05-01', probability: 30 },
    { id: 6, name: 'Emily Davis', organization: 'Coastal Benefits', email: 'emily@coastal.com', phone: '+1-555-0128', status: 'Prospect', addedBy: 'Maria Garcia', dateAdded: '2024-03-06', pipelineStage: 'closed-won', dealValue: 115000, expectedCloseDate: '2024-03-25', probability: 100 },
    { id: 7, name: 'James Wilson', organization: 'Metropolitan Life', email: 'james@metlife.com', phone: '+1-555-0129', status: 'Active', addedBy: 'David Chen', dateAdded: '2024-03-07', pipelineStage: 'proposal-sent', dealValue: 145000, expectedCloseDate: '2024-04-05', probability: 70 },
    { id: 8, name: 'Amanda Brown', organization: 'National Insurance', email: 'amanda@national.com', phone: '+1-555-0130', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-08', pipelineStage: 'closed-won', dealValue: 180000, expectedCloseDate: '2024-03-20', probability: 100 },
    { id: 9, name: 'Kevin Martinez', organization: 'Regional Trust', email: 'kevin@regional.com', phone: '+1-555-0131', status: 'Inactive', addedBy: 'Maria Garcia', dateAdded: '2024-03-09', pipelineStage: 'closed-lost', dealValue: 55000, expectedCloseDate: '2024-03-15', probability: 0 },
    { id: 10, name: 'Jessica Lee', organization: 'Unity Financial', email: 'jessica@unity.com', phone: '+1-555-0132', status: 'Active', addedBy: 'David Chen', dateAdded: '2024-03-10', pipelineStage: 'contact-made', dealValue: 88000, expectedCloseDate: '2024-04-25', probability: 25 },
    { id: 11, name: 'Michael Anderson', organization: 'Liberty Mutual', email: 'michael@liberty.com', phone: '+1-555-0133', status: 'Prospect', addedBy: 'Alex Johnson', dateAdded: '2024-03-11', pipelineStage: 'proposal-sent', dealValue: 92000, expectedCloseDate: '2024-04-12', probability: 55 },
    { id: 12, name: 'Jennifer Thompson', organization: 'Sunrise Insurance', email: 'jennifer@sunrise.com', phone: '+1-555-0134', status: 'Active', addedBy: 'Maria Garcia', dateAdded: '2024-03-12', pipelineStage: 'closed-won', dealValue: 78000, expectedCloseDate: '2024-03-18', probability: 100 },
    { id: 13, name: 'Christopher Garcia', organization: 'Eagle Benefits', email: 'chris@eagle.com', phone: '+1-555-0135', status: 'Active', addedBy: 'David Chen', dateAdded: '2024-03-13', pipelineStage: 'negotiation', dealValue: 135000, expectedCloseDate: '2024-04-08', probability: 80 },
    { id: 14, name: 'Ashley Miller', organization: 'Pioneer Financial', email: 'ashley@pioneer.com', phone: '+1-555-0136', status: 'Prospect', addedBy: 'Alex Johnson', dateAdded: '2024-03-14', pipelineStage: 'meeting-held', dealValue: 68000, expectedCloseDate: '2024-05-15', probability: 40 },
    { id: 15, name: 'Matthew Jackson', organization: 'Summit Insurance', email: 'matt@summit.com', phone: '+1-555-0137', status: 'Active', addedBy: 'Maria Garcia', dateAdded: '2024-03-15', pipelineStage: 'contact-made', dealValue: 98000, expectedCloseDate: '2024-05-20', probability: 35 },
    { id: 16, name: 'Nicole White', organization: 'Cornerstone Benefits', email: 'nicole@cornerstone.com', phone: '+1-555-0138', status: 'Inactive', addedBy: 'David Chen', dateAdded: '2024-03-16', pipelineStage: 'closed-lost', dealValue: 42000, expectedCloseDate: '2024-03-10', probability: 0 },
    { id: 17, name: 'Daniel Harris', organization: 'Meridian Insurance', email: 'daniel@meridian.com', phone: '+1-555-0139', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-17', pipelineStage: 'contact-made', dealValue: 112000, expectedCloseDate: '2024-05-25', probability: 20 },
    { id: 18, name: 'Stephanie Clark', organization: 'Horizon Financial', email: 'stephanie@horizon.com', phone: '+1-555-0140', status: 'Active', addedBy: 'Maria Garcia', dateAdded: '2024-03-18', pipelineStage: 'negotiation', dealValue: 165000, expectedCloseDate: '2024-04-02', probability: 85 },
    { id: 19, name: 'Ryan Lewis', organization: 'Apex Benefits', email: 'ryan@apex.com', phone: '+1-555-0141', status: 'Prospect', addedBy: 'David Chen', dateAdded: '2024-03-19', pipelineStage: 'meeting-held', dealValue: 73000, expectedCloseDate: '2024-05-10', probability: 45 },
    { id: 20, name: 'Lauren Walker', organization: 'Pinnacle Insurance', email: 'lauren@pinnacle.com', phone: '+1-555-0142', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-20', pipelineStage: 'closed-won', dealValue: 220000, expectedCloseDate: '2024-03-28', probability: 100 },
    { id: 21, name: 'Brandon Young', organization: 'Crystal Financial', email: 'brandon@crystal.com', phone: '+1-555-0143', status: 'Active', addedBy: 'Maria Garcia', dateAdded: '2024-03-21', pipelineStage: 'proposal-sent', dealValue: 87000, expectedCloseDate: '2024-04-18', probability: 65 },
    { id: 22, name: 'Samantha King', organization: 'Diamond Benefits', email: 'samantha@diamond.com', phone: '+1-555-0144', status: 'Prospect', addedBy: 'David Chen', dateAdded: '2024-03-22', pipelineStage: 'meeting-held', dealValue: 105000, expectedCloseDate: '2024-05-05', probability: 50 },
    { id: 23, name: 'Justin Scott', organization: 'Platinum Insurance', email: 'justin@platinum.com', phone: '+1-555-0145', status: 'Active', addedBy: 'Alex Johnson', dateAdded: '2024-03-23', pipelineStage: 'contact-made', dealValue: 156000, expectedCloseDate: '2024-06-01', probability: 25 },
    { id: 24, name: 'Rachel Green', organization: 'Golden Gate Financial', email: 'rachel@goldengate.com', phone: '+1-555-0146', status: 'Inactive', addedBy: 'Maria Garcia', dateAdded: '2024-03-24', pipelineStage: 'closed-lost', dealValue: 38000, expectedCloseDate: '2024-03-22', probability: 0 },
    { id: 25, name: 'Tyler Adams', organization: 'Silverstone Benefits', email: 'tyler@silverstone.com', phone: '+1-555-0147', status: 'Active', addedBy: 'David Chen', dateAdded: '2024-03-25', pipelineStage: 'prospect', dealValue: 67000, expectedCloseDate: '2024-06-15', probability: 15 }
  ]);

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      agentId: 1,
      agentName: 'John Smith',
      organization: 'ABC Insurance',
      repName: 'Alex Johnson',
      date: '2024-03-15',
      time: '14:30',
      duration: 45,
      type: 'In-Person',
      agenda: 'First Introduction',
      nextSteps: 'Follow up with proposal next week',
      location: 'Downtown Office, 123 Main St',
      proofUploaded: true,
      keyPersonnel: 'John Smith (ABC Insurance), Mary Wilson (Operations Manager)',
      pipelineStage: 'Meeting Held',
      notes: 'Great initial meeting. Client showed strong interest in our premium package.',
      followUpDate: '2024-03-22'
    },
    {
      id: 2,
      agentId: 2,
      agentName: 'Sarah Johnson',
      organization: 'XYZ Financial',
      repName: 'Maria Garcia',
      date: '2024-03-14',
      time: '10:00',
      duration: 30,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Schedule demo for next Tuesday',
      location: 'Virtual - Zoom',
      proofUploaded: true,
      keyPersonnel: 'Sarah Johnson, Mike Chen (CTO)',
      pipelineStage: 'Proposal Shared',
      notes: 'Discussed technical requirements. Need to prepare custom demo.',
      followUpDate: '2024-03-19'
    },
    {
      id: 3,
      agentId: 3,
      agentName: 'Mike Chen',
      organization: 'Global Advisors',
      repName: 'Alex Johnson',
      date: '2024-03-13',
      time: '16:00',
      duration: 60,
      type: 'In-Person',
      agenda: 'Proposal Review',
      nextSteps: 'Waiting for board approval',
      location: 'Client Office',
      proofUploaded: true,
      keyPersonnel: 'Mike Chen, Jennifer Lee (CFO)',
      pipelineStage: 'Contract Signing',
      notes: 'Proposal well received. Board meeting scheduled for next week.',
      followUpDate: '2024-03-20'
    },
    {
      id: 4,
      agentId: 4,
      agentName: 'Lisa Rodriguez',
      organization: 'Premier Solutions',
      repName: 'David Chen',
      date: '2024-03-12',
      time: '11:30',
      duration: 90,
      type: 'In-Person',
      agenda: 'Lunch / Networking',
      nextSteps: 'Schedule formal presentation for stakeholders',
      location: 'Rosewood Restaurant',
      proofUploaded: true,
      keyPersonnel: 'Lisa Rodriguez, Tom Bradley (VP Sales)',
      pipelineStage: 'Relationship Building',
      notes: 'Excellent rapport building session. Client is very interested in our enterprise solutions.',
      followUpDate: '2024-03-26'
    },
    {
      id: 5,
      agentId: 5,
      agentName: 'Robert Taylor',
      organization: 'Pacific Mutual',
      repName: 'Alex Johnson',
      date: '2024-03-11',
      time: '09:00',
      duration: 35,
      type: 'Virtual',
      agenda: 'First Introduction',
      nextSteps: 'Send product overview and schedule in-person meeting',
      location: 'Virtual - Teams',
      proofUploaded: true,
      keyPersonnel: 'Robert Taylor, Angela Price (Regional Director)',
      pipelineStage: 'Initial Contact',
      notes: 'Strong opening call. Client has immediate need for our services.',
      followUpDate: '2024-03-18'
    },
    {
      id: 6,
      agentId: 6,
      agentName: 'Emily Davis',
      organization: 'Coastal Benefits',
      repName: 'Maria Garcia',
      date: '2024-03-10',
      time: '15:15',
      duration: 75,
      type: 'In-Person',
      agenda: 'Training / Onboarding',
      nextSteps: 'Complete onboarding documentation',
      location: 'Training Center, Suite 200',
      proofUploaded: true,
      keyPersonnel: 'Emily Davis, Training Team',
      pipelineStage: 'Agent Onboarded',
      notes: 'Successful onboarding session. Agent is ready to start writing business.',
      followUpDate: '2024-03-17'
    },
    {
      id: 7,
      agentId: 7,
      agentName: 'James Wilson',
      organization: 'Metropolitan Life',
      repName: 'David Chen',
      date: '2024-03-09',
      time: '13:45',
      duration: 40,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Prepare customized proposal based on requirements',
      location: 'Virtual - Zoom',
      proofUploaded: true,
      keyPersonnel: 'James Wilson, Susan Miller (Compliance Officer)',
      pipelineStage: 'Needs Assessment',
      notes: 'Detailed discussion of compliance requirements and product fit.',
      followUpDate: '2024-03-21'
    },
    {
      id: 8,
      agentId: 8,
      agentName: 'Amanda Brown',
      organization: 'National Insurance',
      repName: 'Alex Johnson',
      date: '2024-03-08',
      time: '12:00',
      duration: 120,
      type: 'In-Person',
      agenda: 'Contract Signing',
      nextSteps: 'Process paperwork and setup account',
      location: 'Conference Room A',
      proofUploaded: true,
      keyPersonnel: 'Amanda Brown, Legal Team, Operations Manager',
      pipelineStage: 'Contract Signed',
      notes: 'Contract successfully signed. Major win for Q1 targets.',
      followUpDate: '2024-03-15'
    },
    {
      id: 9,
      agentId: 10,
      agentName: 'Jessica Lee',
      organization: 'Unity Financial',
      repName: 'David Chen',
      date: '2024-03-07',
      time: '14:00',
      duration: 25,
      type: 'Virtual',
      agenda: 'First Introduction',
      nextSteps: 'Send information packet and schedule follow-up',
      location: 'Virtual - Phone',
      proofUploaded: false,
      keyPersonnel: 'Jessica Lee',
      pipelineStage: 'Initial Contact',
      notes: 'Brief introductory call. Agent expressed interest in learning more.',
      followUpDate: '2024-03-14'
    },
    {
      id: 10,
      agentId: 11,
      agentName: 'Michael Anderson',
      organization: 'Liberty Mutual',
      repName: 'Alex Johnson',
      date: '2024-03-06',
      time: '10:30',
      duration: 55,
      type: 'In-Person',
      agenda: 'Proposal Review',
      nextSteps: 'Address concerns and revise proposal',
      location: 'Liberty Mutual Office',
      proofUploaded: true,
      keyPersonnel: 'Michael Anderson, Finance Team',
      pipelineStage: 'Proposal Review',
      notes: 'Some concerns about pricing. Need to adjust proposal and present alternatives.',
      followUpDate: '2024-03-13'
    },
    {
      id: 11,
      agentId: 12,
      agentName: 'Jennifer Thompson',
      organization: 'Sunrise Insurance',
      repName: 'Maria Garcia',
      date: '2024-03-05',
      time: '11:00',
      duration: 80,
      type: 'In-Person',
      agenda: 'Training / Onboarding',
      nextSteps: 'Complete certification process',
      location: 'Regional Training Facility',
      proofUploaded: true,
      keyPersonnel: 'Jennifer Thompson, Certification Team',
      pipelineStage: 'Training Complete',
      notes: 'Excellent performance during training. Ready for certification.',
      followUpDate: '2024-03-12'
    },
    {
      id: 12,
      agentId: 13,
      agentName: 'Christopher Garcia',
      organization: 'Eagle Benefits',
      repName: 'David Chen',
      date: '2024-03-04',
      time: '16:30',
      duration: 45,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Schedule stakeholder presentation',
      location: 'Virtual - Teams',
      proofUploaded: true,
      keyPersonnel: 'Christopher Garcia, Department Heads',
      pipelineStage: 'Stakeholder Buy-in',
      notes: 'Positive feedback from department heads. Moving forward with larger presentation.',
      followUpDate: '2024-03-18'
    },
    {
      id: 13,
      agentId: 15,
      agentName: 'Matthew Jackson',
      organization: 'Summit Insurance',
      repName: 'Maria Garcia',
      date: '2024-03-03',
      time: '09:30',
      duration: 65,
      type: 'In-Person',
      agenda: 'Lunch / Networking',
      nextSteps: 'Follow up with formal proposal',
      location: 'Summit Club',
      proofUploaded: true,
      keyPersonnel: 'Matthew Jackson, Regional Team',
      pipelineStage: 'Relationship Building',
      notes: 'Great networking event. Multiple decision makers present and engaged.',
      followUpDate: '2024-03-17'
    },
    {
      id: 14,
      agentId: 17,
      agentName: 'Daniel Harris',
      organization: 'Meridian Insurance',
      repName: 'Alex Johnson',
      date: '2024-03-02',
      time: '13:00',
      duration: 30,
      type: 'Virtual',
      agenda: 'First Introduction',
      nextSteps: 'Send capabilities overview',
      location: 'Virtual - Zoom',
      proofUploaded: true,
      keyPersonnel: 'Daniel Harris',
      pipelineStage: 'Initial Contact',
      notes: 'Good first impression. Agent is evaluating multiple vendors.',
      followUpDate: '2024-03-16'
    },
    {
      id: 15,
      agentId: 18,
      agentName: 'Stephanie Clark',
      organization: 'Horizon Financial',
      repName: 'Maria Garcia',
      date: '2024-03-01',
      time: '15:45',
      duration: 50,
      type: 'In-Person',
      agenda: 'Proposal Review',
      nextSteps: 'Finalize terms and prepare contract',
      location: 'Horizon Financial HQ',
      proofUploaded: true,
      keyPersonnel: 'Stephanie Clark, Executive Team',
      pipelineStage: 'Contract Preparation',
      notes: 'Executive team approved proposal. Moving to contract phase.',
      followUpDate: '2024-03-08'
    },
    {
      id: 16,
      agentId: 20,
      agentName: 'Lauren Walker',
      organization: 'Pinnacle Insurance',
      repName: 'Alex Johnson',
      date: '2024-02-29',
      time: '14:15',
      duration: 95,
      type: 'In-Person',
      agenda: 'Contract Signing',
      nextSteps: 'Begin implementation process',
      location: 'Pinnacle Conference Room',
      proofUploaded: true,
      keyPersonnel: 'Lauren Walker, C-Suite Team',
      pipelineStage: 'Contract Signed',
      notes: 'Major contract signed. Largest deal of the quarter.',
      followUpDate: '2024-03-07'
    },
    {
      id: 17,
      agentId: 21,
      agentName: 'Brandon Young',
      organization: 'Crystal Financial',
      repName: 'Maria Garcia',
      date: '2024-02-28',
      time: '10:00',
      duration: 40,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Address technical questions and concerns',
      location: 'Virtual - Teams',
      proofUploaded: true,
      keyPersonnel: 'Brandon Young, IT Team',
      pipelineStage: 'Technical Review',
      notes: 'IT team has specific integration requirements. Need technical follow-up.',
      followUpDate: '2024-03-14'
    },
    {
      id: 18,
      agentId: 23,
      agentName: 'Justin Scott',
      organization: 'Platinum Insurance',
      repName: 'Alex Johnson',
      date: '2024-02-27',
      time: '11:30',
      duration: 70,
      type: 'In-Person',
      agenda: 'Training / Onboarding',
      nextSteps: 'Schedule advanced training modules',
      location: 'Training Facility',
      proofUploaded: true,
      keyPersonnel: 'Justin Scott, Training Staff',
      pipelineStage: 'Basic Training Complete',
      notes: 'Completed basic training successfully. Ready for advanced modules.',
      followUpDate: '2024-03-13'
    },
    {
      id: 19,
      agentId: 25,
      agentName: 'Tyler Adams',
      organization: 'Silverstone Benefits',
      repName: 'David Chen',
      date: '2024-02-26',
      time: '13:30',
      duration: 35,
      type: 'Virtual',
      agenda: 'First Introduction',
      nextSteps: 'Schedule in-depth discovery meeting',
      location: 'Virtual - Phone',
      proofUploaded: false,
      keyPersonnel: 'Tyler Adams',
      pipelineStage: 'Initial Contact',
      notes: 'Promising initial call. Large potential opportunity.',
      followUpDate: '2024-03-11'
    },
    {
      id: 20,
      agentId: 14,
      agentName: 'Ashley Miller',
      organization: 'Pioneer Financial',
      repName: 'Alex Johnson',
      date: '2024-02-25',
      time: '16:00',
      duration: 60,
      type: 'In-Person',
      agenda: 'Proposal Review',
      nextSteps: 'Await final decision from board',
      location: 'Pioneer Financial Boardroom',
      proofUploaded: true,
      keyPersonnel: 'Ashley Miller, Board of Directors',
      pipelineStage: 'Final Review',
      notes: 'Presented to full board. Decision expected within two weeks.',
      followUpDate: '2024-03-10'
    },
    {
      id: 21,
      agentId: 19,
      agentName: 'Ryan Lewis',
      organization: 'Apex Benefits',
      repName: 'David Chen',
      date: '2024-02-24',
      time: '12:45',
      duration: 85,
      type: 'In-Person',
      agenda: 'Lunch / Networking',
      nextSteps: 'Develop partnership proposal',
      location: 'Country Club',
      proofUploaded: true,
      keyPersonnel: 'Ryan Lewis, Partnership Team',
      pipelineStage: 'Partnership Discussion',
      notes: 'Discussing strategic partnership opportunities. Very promising.',
      followUpDate: '2024-03-16'
    },
    {
      id: 22,
      agentId: 22,
      agentName: 'Samantha King',
      organization: 'Diamond Benefits',
      repName: 'David Chen',
      date: '2024-02-23',
      time: '14:30',
      duration: 45,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Prepare detailed implementation timeline',
      location: 'Virtual - Zoom',
      proofUploaded: true,
      keyPersonnel: 'Samantha King, Project Management Team',
      pipelineStage: 'Implementation Planning',
      notes: 'Client ready to move forward. Need detailed implementation plan.',
      followUpDate: '2024-03-09'
    },
    {
      id: 23,
      agentId: 1,
      agentName: 'John Smith',
      organization: 'ABC Insurance',
      repName: 'Alex Johnson',
      date: '2024-02-22',
      time: '10:15',
      duration: 25,
      type: 'Virtual',
      agenda: 'Follow-up Meeting',
      nextSteps: 'Schedule contract signing meeting',
      location: 'Virtual - Phone',
      proofUploaded: false,
      keyPersonnel: 'John Smith, Legal Department',
      pipelineStage: 'Legal Review',
      notes: 'Legal review complete. Ready for final signatures.',
      followUpDate: '2024-03-01'
    },
    {
      id: 24,
      agentId: 7,
      agentName: 'James Wilson',
      organization: 'Metropolitan Life',
      repName: 'David Chen',
      date: '2024-02-21',
      time: '15:00',
      duration: 55,
      type: 'In-Person',
      agenda: 'Training / Onboarding',
      nextSteps: 'Complete compliance training',
      location: 'Metropolitan Life Training Center',
      proofUploaded: true,
      keyPersonnel: 'James Wilson, Compliance Team',
      pipelineStage: 'Compliance Training',
      notes: 'Working through compliance requirements. Progress is good.',
      followUpDate: '2024-03-07'
    },
    {
      id: 25,
      agentId: 2,
      agentName: 'Sarah Johnson',
      organization: 'XYZ Financial',
      repName: 'Maria Garcia',
      date: '2024-02-20',
      time: '11:45',
      duration: 40,
      type: 'Virtual',
      agenda: 'Relationship Building',
      nextSteps: 'Plan quarterly business review',
      location: 'Virtual - Teams',
      proofUploaded: true,
      keyPersonnel: 'Sarah Johnson, Account Management',
      pipelineStage: 'Account Management',
      notes: 'Quarterly check-in. Relationship remains strong.',
      followUpDate: '2024-05-20'
    }
  ]);

  const [reps] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@company.com', meetingsThisMonth: 15, conversionRate: 85, status: 'Active' },
    { id: 2, name: 'Maria Garcia', email: 'maria@company.com', meetingsThisMonth: 18, conversionRate: 92, status: 'Active' },
    { id: 3, name: 'David Chen', email: 'david@company.com', meetingsThisMonth: 12, conversionRate: 78, status: 'Active' },
    { id: 4, name: 'Jennifer Lopez', email: 'jennifer@company.com', meetingsThisMonth: 0, conversionRate: 0, status: 'Inactive' },
    { id: 5, name: 'Robert Kim', email: 'robert@company.com', meetingsThisMonth: 8, conversionRate: 88, status: 'Active' },
    { id: 6, name: 'Lisa Thompson', email: 'lisa@company.com', meetingsThisMonth: 5, conversionRate: 72, status: 'Active' },
    { id: 7, name: 'Michael Santos', email: 'michael@company.com', meetingsThisMonth: 2, conversionRate: 45, status: 'Active' },
    { id: 8, name: 'Emma Rodriguez', email: 'emma@company.com', meetingsThisMonth: 0, conversionRate: 0, status: 'Inactive' }
  ]);

  // Notification system
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userRole === 'rep' && meetings.length > 0) {
        setNotifications([
          { id: 1, type: 'reminder', message: 'Follow up with John Smith due today', time: '2 hours ago' },
          { id: 2, type: 'success', message: 'Meeting with Sarah Johnson logged successfully', time: '1 day ago' }
        ]);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [userRole, meetings.length]);

  // Enhanced Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TIMEBOX</h1>
          <p className="text-gray-600">Smart sales activity tracking & pipeline management</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {setUserRole('rep'); setCurrentUser('Alex Johnson'); setCurrentView('rep-dashboard');}}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <User className="w-5 h-5" />
            <span>Login as Sales Rep</span>
          </button>
          <button
            onClick={() => {setUserRole('manager'); setCurrentUser('Manager'); setCurrentView('manager-dashboard');}}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Award className="w-5 h-5" />
            <span>Login as Manager</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">Demo credentials - Click any button to explore</p>
        </div>
      </div>
    </div>
  );

  // Navbar Component
  const Navbar = ({ title, subtitle, showBack = false, onBack = null }) => {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">TIMEBOX</h1>
                  {title && <p className="text-sm text-gray-600">{title}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {currentUser}
              </div>
              <button
                onClick={() => setCurrentView('login')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Sales Rep Dashboard
  const RepDashboard = () => {
    const userMeetings = meetings.filter(m => m.repName === currentUser);
    const thisMonthMeetings = userMeetings.filter(m => new Date(m.date).getMonth() === new Date().getMonth());
    const avgDuration = thisMonthMeetings.length > 0 ? Math.round(thisMonthMeetings.reduce((sum, m) => sum + m.duration, 0) / thisMonthMeetings.length) : 0;
    const inPersonMeetings = thisMonthMeetings.filter(m => m.type === 'In-Person').length;
    const virtualMeetings = thisMonthMeetings.filter(m => m.type === 'Virtual').length;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title={`Welcome back, ${currentUser}`} />

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded">
            <div className="flex">
              <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">You have {notifications.length} notification(s)</p>
                <div className="mt-2 space-y-1">
                  {notifications.map(notif => (
                    <p key={notif.id} className="text-xs text-blue-600">{notif.message}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Stats */}
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{thisMonthMeetings.length}</div>
                  <div className="text-sm font-medium text-blue-700">This Month</div>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{agents.filter(a => a.addedBy === currentUser).length}</div>
                  <div className="text-sm font-medium text-emerald-700">My Agents</div>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{avgDuration}m</div>
                  <div className="text-sm font-medium text-amber-700">Avg Duration</div>
                </div>
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{Math.round((inPersonMeetings / (inPersonMeetings + virtualMeetings)) * 100) || 0}%</div>
                  <div className="text-sm font-medium text-purple-700">In-Person</div>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setCurrentView('add-agent')}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Add Agent</span>
            </button>
            <button
              onClick={() => setCurrentView('add-meeting')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Log Meeting</span>
            </button>
            <button
              onClick={() => setCurrentView('pipeline')}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Target className="w-5 h-5" />
              <span className="font-semibold">Manage Pipeline</span>
            </button>
          </div>

          {/* Recent Meetings with Enhanced UI */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Recent Meetings</h2>
                <button 
                  onClick={() => setCurrentView('all-meetings')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y">
              {userMeetings.slice(0, 5).map((meeting) => (
                <div key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-800">{meeting.agentName}</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          meeting.type === 'In-Person' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {meeting.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{meeting.organization}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center space-x-4">
                        <span>{meeting.date}</span>
                        <span>{meeting.duration} min</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{meeting.location}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Next: {meeting.nextSteps}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${meeting.proofUploaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Add Agent Screen
  const AddAgentScreen = () => {
    const [agentData, setAgentData] = useState({
      name: '',
      organization: '',
      email: '',
      phone: '',
      notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (agentData.name && agentData.organization) {
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newAgent = {
          id: agents.length + 1,
          ...agentData,
          status: 'Prospect',
          addedBy: currentUser,
          dateAdded: new Date().toISOString().split('T')[0]
        };
        setAgents([...agents, newAgent]);
        
        // Add success notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `Agent ${agentData.name} added successfully!`,
          time: 'Just now'
        }]);
        
        setCurrentView('rep-dashboard');
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          title="Add New Agent" 
          showBack={true}
          onBack={() => setCurrentView('rep-dashboard')}
        />

        <div className="p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Agent Information</h2>
              <p className="text-sm text-gray-600">Add a new agent to your network</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentData.name}
                  onChange={(e) => setAgentData({...agentData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  value={agentData.organization}
                  onChange={(e) => setAgentData({...agentData, organization: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company or organization name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={agentData.email}
                    onChange={(e) => setAgentData({...agentData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={agentData.phone}
                    onChange={(e) => setAgentData({...agentData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={agentData.notes}
                  onChange={(e) => setAgentData({...agentData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional notes about this agent..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!agentData.name || !agentData.organization || isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                (!agentData.name || !agentData.organization || isSubmitting)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Adding Agent...' : 'Add Agent'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Add Meeting Screen
  const AddMeetingScreen = () => {
    const [meetingData, setMeetingData] = useState({
      agentId: '',
      duration: '',
      type: 'In-Person',
      agenda: '',
      nextSteps: '',
      keyPersonnel: '',
      notes: '',
      followUpDate: ''
    });
    const [proofUploaded, setProofUploaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('Getting location...');
    const [activeRecordingField, setActiveRecordingField] = useState(null);

    // Initialize speech-to-text
    const {
      isListening,
      transcript,
      isSupported,
      startListening,
      stopListening,
      resetTranscript
    } = useSpeechToText();

    const agendaOptions = [
      'First Introduction',
      'Follow-up Meeting',
      'Lunch / Networking',
      'Proposal Review',
      'Contract Signing',
      'Training / Onboarding',
      'Relationship Building'
    ];

    // Simulate getting location
    useEffect(() => {
      setTimeout(() => {
        setCurrentLocation('Downtown Office, 123 Business St');
      }, 1000);
    }, []);

    // Handle speech-to-text transcript updates
    useEffect(() => {
      if (transcript && activeRecordingField) {
        setMeetingData(prev => ({
          ...prev,
          [activeRecordingField]: prev[activeRecordingField] + transcript
        }));
        resetTranscript();
      }
    }, [transcript, activeRecordingField, resetTranscript]);

    const handleStartRecording = (fieldName) => {
      if (activeRecordingField && activeRecordingField !== fieldName) {
        stopListening();
      }
      setActiveRecordingField(fieldName);
      startListening();
    };

    const handleStopRecording = () => {
      stopListening();
      setActiveRecordingField(null);
    };

    const VoiceRecordButton = ({ fieldName, isActive, onStart, onStop }) => {
      if (!isSupported) {
        return (
          <div className="text-xs text-gray-400 p-2">
            Speech recognition not supported
          </div>
        );
      }

      return (
        <div className="flex items-center space-x-2">
          {isActive ? (
            <>
              <button
                type="button"
                onClick={onStop}
                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 transition-colors"
              >
                <Square className="w-3 h-3" />
                <span>Stop</span>
              </button>
              <div className="flex items-center space-x-1 text-red-600 text-xs">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span>Recording...</span>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onStart(fieldName)}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors"
            >
              <Mic className="w-3 h-3" />
              <span>Record</span>
            </button>
          )}
        </div>
      );
    };

    const handleSubmit = async () => {
      // Stop any active recording before submitting
      if (isListening) {
        handleStopRecording();
      }

      if (meetingData.agentId && meetingData.duration && meetingData.agenda) {
        if (meetingData.type === 'In-Person' && !proofUploaded) {
          alert('Photo proof is required for in-person meetings');
          return;
        }

        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agent = agents.find(a => a.id === parseInt(meetingData.agentId));
        const newMeeting = {
          id: meetings.length + 1,
          agentId: parseInt(meetingData.agentId),
          agentName: agent.name,
          organization: agent.organization,
          repName: currentUser,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          duration: parseInt(meetingData.duration),
          type: meetingData.type,
          agenda: meetingData.agenda,
          nextSteps: meetingData.nextSteps,
          keyPersonnel: meetingData.keyPersonnel,
          notes: meetingData.notes,
          followUpDate: meetingData.followUpDate,
          proofUploaded,
          location: meetingData.type === 'In-Person' ? currentLocation : 'Virtual Meeting',
          pipelineStage: 'Meeting Held'
        };
        
        setMeetings([...meetings, newMeeting]);
        
        // Add success notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `Meeting with ${agent.name} logged successfully!`,
          time: 'Just now'
        }]);
        
        setCurrentView('rep-dashboard');
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          title="Log New Meeting" 
          showBack={true}
          onBack={() => setCurrentView('rep-dashboard')}
        />

        <div className="p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Voice Recording Notice */}
            {isSupported && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Recording Available
                </h3>
                <p className="text-sm text-purple-700">
                  Use the microphone buttons to record your notes, next steps, and attendee information instead of typing. 
                  Your voice will be converted to text automatically.
                </p>
              </div>
            )}

            {/* Auto-captured info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Auto-captured Information
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {currentLocation}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent *
              </label>
              <select
                value={meetingData.agentId}
                onChange={(e) => setMeetingData({...meetingData, agentId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} - {agent.organization}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({...meetingData, duration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={meetingData.followUpDate}
                  onChange={(e) => setMeetingData({...meetingData, followUpDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMeetingData({...meetingData, type: 'In-Person'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    meetingData.type === 'In-Person'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">In-Person</div>
                  <div className="text-xs text-gray-500">Face-to-face meeting</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingData({...meetingData, type: 'Virtual'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    meetingData.type === 'Virtual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Virtual</div>
                  <div className="text-xs text-gray-500">Online meeting</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Agenda *
              </label>
              <select
                value={meetingData.agenda}
                onChange={(e) => setMeetingData({...meetingData, agenda: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select meeting purpose</option>
                {agendaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Key Personnel Present
                </label>
                <VoiceRecordButton 
                  fieldName="keyPersonnel"
                  isActive={activeRecordingField === 'keyPersonnel' && isListening}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
              </div>
              <input
                type="text"
                value={meetingData.keyPersonnel}
                onChange={(e) => setMeetingData({...meetingData, keyPersonnel: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Names and titles of attendees... (Or use voice recording)"
              />
              {activeRecordingField === 'keyPersonnel' && isListening && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700">
                  🎤 Listening... Name the key people who attended this meeting.
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Notes
                </label>
                <VoiceRecordButton 
                  fieldName="notes"
                  isActive={activeRecordingField === 'notes' && isListening}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
              </div>
              <textarea
                value={meetingData.notes}
                onChange={(e) => setMeetingData({...meetingData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Key discussion points, decisions made... (Or use voice recording)"
              />
              {activeRecordingField === 'notes' && isListening && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  🎤 Listening... Speak now and your words will be added to the notes.
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Next Steps
                </label>
                <VoiceRecordButton 
                  fieldName="nextSteps"
                  isActive={activeRecordingField === 'nextSteps' && isListening}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
              </div>
              <textarea
                value={meetingData.nextSteps}
                onChange={(e) => setMeetingData({...meetingData, nextSteps: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="Action items and follow-up tasks... (Or use voice recording)"
              />
              {activeRecordingField === 'nextSteps' && isListening && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  🎤 Listening... Describe the next steps and action items.
                </div>
              )}
            </div>

            {/* Proof of Meeting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Meeting {meetingData.type === 'In-Person' && '*'}
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                proofUploaded ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                {proofUploaded ? (
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                ) : (
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                )}
                <p className="text-sm text-gray-600 mb-3">
                  {meetingData.type === 'In-Person' 
                    ? 'Photo required (selfie with agent, business card, location, etc.)'
                    : 'Screenshot optional (Zoom/Teams confirmation, etc.)'
                  }
                </p>
                <button
                  type="button"
                  onClick={() => setProofUploaded(!proofUploaded)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    proofUploaded
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {proofUploaded ? 'Photo Uploaded ✓' : 'Upload Photo'}
                </button>
                {proofUploaded && (
                  <div className="mt-2 text-xs text-green-600">
                    Photo uploaded successfully - meeting_proof_001.jpg
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!meetingData.agentId || !meetingData.duration || !meetingData.agenda || (meetingData.type === 'In-Person' && !proofUploaded) || isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                (!meetingData.agentId || !meetingData.duration || !meetingData.agenda || (meetingData.type === 'In-Person' && !proofUploaded) || isSubmitting)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Logging Meeting...' : 'Log Meeting'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // All Meetings View
  const AllMeetingsScreen = () => {
    const [sortBy, setSortBy] = useState('date');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userMeetings = userRole === 'rep' 
      ? meetings.filter(m => m.repName === currentUser)
      : meetings;

    let filteredMeetings = userMeetings.filter(meeting => {
      const matchesSearch = meeting.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meeting.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meeting.agenda.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || meeting.type.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    // Sort meetings
    filteredMeetings.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'duration':
          return b.duration - a.duration;
        case 'agent':
          return a.agentName.localeCompare(b.agentName);
        default:
          return 0;
      }
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          title={`All Meetings - ${filteredMeetings.length} found`}
          showBack={true}
          onBack={() => setCurrentView(userRole === 'rep' ? 'rep-dashboard' : 'manager-dashboard')}
        />

        <div className="p-4">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agents, organizations, or agenda..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="duration">Duration</option>
                  <option value="agent">Agent Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meetings List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{meeting.agentName}</h3>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            meeting.type === 'In-Person' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {meeting.type}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            meeting.proofUploaded 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {meeting.proofUploaded ? '✓ Verified' : '⚠ No Proof'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{meeting.organization}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{meeting.date} at {meeting.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{meeting.duration} minutes</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{meeting.location}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span><strong>Agenda:</strong> {meeting.agenda}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4" />
                              <span><strong>Stage:</strong> {meeting.pipelineStage}</span>
                            </div>
                            {userRole === 'manager' && (
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span><strong>Rep:</strong> {meeting.repName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        <Edit className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </div>
                    </div>
                    
                    {meeting.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800"><strong>Notes:</strong> {meeting.notes}</p>
                      </div>
                    )}
                    
                    {meeting.nextSteps && (
                      <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-800"><strong>Next Steps:</strong> {meeting.nextSteps}</p>
                        {meeting.followUpDate && (
                          <p className="text-xs text-orange-600 mt-1">Follow-up: {meeting.followUpDate}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No meetings found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // All Representatives View (for Manager)
  const AllRepsScreen = () => {
    const [sortBy, setSortBy] = useState('meetings');
    const [searchQuery, setSearchQuery] = useState('');

    let filteredReps = reps.filter(rep => 
      rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort reps
    filteredReps.sort((a, b) => {
      switch (sortBy) {
        case 'meetings':
          return b.meetingsThisMonth - a.meetingsThisMonth;
        case 'conversion':
          return b.conversionRate - a.conversionRate;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          title={`All Representatives - ${filteredReps.length} total`}
          showBack={true}
          onBack={() => setCurrentView('manager-dashboard')}
        />

        <div className="p-4">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meetings">Meetings This Month</option>
                  <option value="conversion">Conversion Rate</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReps.map((rep) => {
              const repMeetings = meetings.filter(m => m.repName === rep.name);
              const repAgents = agents.filter(a => a.addedBy === rep.name);
              
              return (
                <div key={rep.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{rep.name}</h3>
                        <p className="text-sm text-gray-600">{rep.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rep.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{rep.meetingsThisMonth}</div>
                      <div className="text-xs text-blue-600">This Month</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{rep.conversionRate}%</div>
                      <div className="text-xs text-green-600">Conversion</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Meetings:</span>
                      <span className="font-medium">{repMeetings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agents Added:</span>
                      <span className="font-medium">{repAgents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In-Person:</span>
                      <span className="font-medium">{repMeetings.filter(m => m.type === 'In-Person').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Virtual:</span>
                      <span className="font-medium">{repMeetings.filter(m => m.type === 'Virtual').length}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedRep(rep.name);
                        setDashboardView('rep-detail');
                        setCurrentView('manager-dashboard');
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReps.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No representatives found</h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Pipeline Board Component
  const PipelineBoard = () => {
    const [draggedCard, setDraggedCard] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRep, setSelectedRep] = useState('all');

    const filteredAgents = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRep = selectedRep === 'all' || agent.addedBy === selectedRep;
      return matchesSearch && matchesRep && (userRole === 'manager' || agent.addedBy === currentUser);
    });

    const handleDragStart = (e, agent) => {
      setDraggedCard(agent);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStage) => {
      e.preventDefault();
      if (draggedCard && draggedCard.pipelineStage !== newStage) {
        const updatedAgents = agents.map(agent => {
          if (agent.id === draggedCard.id) {
            return { ...agent, pipelineStage: newStage };
          }
          return agent;
        });
        setAgents(updatedAgents);
        
        // Add notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          message: `${draggedCard.name} moved to ${pipelineStages.find(s => s.id === newStage)?.name}`,
          time: 'Just now'
        }]);
      }
      setDraggedCard(null);
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const getStageAgents = (stageId) => {
      return filteredAgents.filter(agent => agent.pipelineStage === stageId);
    };

    const getTotalValue = (agents) => {
      return agents.reduce((sum, agent) => sum + (agent.dealValue || 0), 0);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView(userRole === 'rep' ? 'rep-dashboard' : 'manager-dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800">TIMEBOX</h1>
                    <p className="text-sm text-gray-600">Sales Pipeline - Drag cards to move prospects</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentUser}
                  </div>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prospects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {userRole === 'manager' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rep</label>
                  <select
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Representatives</option>
                    {reps.map(rep => (
                      <option key={rep.id} value={rep.name}>{rep.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Board */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {pipelineStages.map((stage) => {
              const stageAgents = getStageAgents(stage.id);
              const stageValue = getTotalValue(stageAgents);
              
              return (
                <div 
                  key={stage.id}
                  className="bg-white rounded-xl shadow-sm min-h-96"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className={`${stage.color} text-white p-4 rounded-t-xl`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{stage.name}</h3>
                      <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded">
                        {stageAgents.length}
                      </span>
                    </div>
                    <div className="text-xs opacity-90">
                      {formatCurrency(stageValue)}
                    </div>
                  </div>

                  {/* Stage Cards */}
                  <div className="p-3 space-y-3">
                    {stageAgents.map((agent) => (
                      <div
                        key={agent.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, agent)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all transform hover:scale-105"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{agent.name}</h4>
                            <p className="text-xs text-gray-600">{agent.organization}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Percent className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{agent.probability}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatCurrency(agent.dealValue)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(agent.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        
                        {userRole === 'manager' && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{agent.addedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {stageAgents.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No prospects in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pipeline Summary */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Pipeline Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredAgents.length}
                </div>
                <div className="text-sm text-gray-600">Total Prospects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(getTotalValue(filteredAgents))}
                </div>
                <div className="text-sm text-gray-600">Pipeline Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(filteredAgents.reduce((sum, a) => sum + a.probability, 0) / filteredAgents.length) || 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Probability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(filteredAgents.reduce((sum, a) => sum + (a.dealValue * a.probability / 100), 0))}
                </div>
                <div className="text-sm text-gray-600">Weighted Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Manager Dashboard
  const ManagerDashboard = () => {
    const [dashboardView, setDashboardView] = useState('overview');
    const [selectedTimeframe, setSelectedTimeframe] = useState('month');
    const [selectedRep, setSelectedRep] = useState('all');

    const filteredMeetings = selectedRep === 'all' 
      ? meetings 
      : meetings.filter(m => m.repName === selectedRep);

    const totalMeetings = filteredMeetings.length;
    const inPersonCount = filteredMeetings.filter(m => m.type === 'In-Person').length;
    const virtualCount = filteredMeetings.filter(m => m.type === 'Virtual').length;
    const avgDuration = filteredMeetings.length > 0 
      ? Math.round(filteredMeetings.reduce((sum, m) => sum + m.duration, 0) / filteredMeetings.length) 
      : 0;

    const OverviewDashboard = () => (
      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Representative</label>
              <select 
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Representatives</option>
                {reps.map(rep => (
                  <option key={rep.id} value={rep.name}>{rep.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">{totalMeetings}</div>
                <div className="text-sm font-medium text-cyan-700">Total Meetings</div>
                <div className="text-xs font-semibold text-green-600 mt-1">↑ 12% vs last {selectedTimeframe}</div>
              </div>
              <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">85%</div>
                <div className="text-sm font-medium text-emerald-700">Conversion Rate</div>
                <div className="text-xs font-semibold text-green-600 mt-1">↑ 5% vs last {selectedTimeframe}</div>
              </div>
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">{avgDuration}m</div>
                <div className="text-sm font-medium text-orange-700">Avg Duration</div>
                <div className="text-xs font-semibold text-blue-600 mt-1">+3 min vs last {selectedTimeframe}</div>
              </div>
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-800">{reps.filter(r => r.status === 'Active').length}</div>
                <div className="text-sm font-medium text-violet-700">Active Reps</div>
                <div className="text-xs font-medium text-slate-600 mt-1">{reps.filter(r => r.meetingsThisMonth === 0).length} idle this month</div>
              </div>
              <div className="w-14 h-14 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Types Chart */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-slate-800 mb-6">Meeting Distribution</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded shadow-sm"></div>
                <span className="text-sm font-medium text-slate-700">In-Person Meetings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-slate-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-700 shadow-sm" 
                    style={{width: `${totalMeetings > 0 ? (inPersonCount / totalMeetings) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-800 w-12 bg-blue-100 px-2 py-1 rounded">{inPersonCount}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded shadow-sm"></div>
                <span className="text-sm font-medium text-slate-700">Virtual Meetings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-slate-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full transition-all duration-700 shadow-sm" 
                    style={{width: `${totalMeetings > 0 ? (virtualCount / totalMeetings) * 100 : 0}%`}}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-800 w-12 bg-emerald-100 px-2 py-1 rounded">{virtualCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Top Performers</h3>
            <button 
              onClick={() => setCurrentView('all-reps')}
              className="text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {reps
              .filter(rep => rep.meetingsThisMonth > 0)
              .sort((a, b) => b.meetingsThisMonth - a.meetingsThisMonth)
              .slice(0, 3)
              .map((rep, index) => (
                <div key={rep.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{rep.name}</div>
                      <div className="text-sm text-gray-600">{rep.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{rep.meetingsThisMonth} meetings</div>
                    <div className="text-sm text-green-600">{rep.conversionRate}% conversion</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        {reps.filter(r => r.meetingsThisMonth === 0).length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Attention Required</h3>
                <p className="text-red-700 mb-3">
                  {reps.filter(r => r.meetingsThisMonth === 0).length} representative(s) have no meetings logged this month
                </p>
                <div className="space-y-2">
                  {reps.filter(r => r.meetingsThisMonth === 0).map(rep => (
                    <div key={rep.id} className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded">
                      {rep.name} - Last activity: No recent meetings
                    </div>
                  ))}
                </div>
                <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    const RepDetailDashboard = () => {
      const [selectedRepDetail, setSelectedRepDetail] = useState(reps[0].name);
      const repData = reps.find(r => r.name === selectedRepDetail);
      const repMeetings = meetings.filter(m => m.repName === selectedRepDetail);
      const repAgents = agents.filter(a => a.addedBy === selectedRepDetail);

      return (
        <div className="p-4 space-y-6">
          {/* Rep Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Representative
            </label>
            <select 
              value={selectedRepDetail}
              onChange={(e) => setSelectedRepDetail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reps.map(rep => (
                <option key={rep.id} value={rep.name}>{rep.name}</option>
              ))}
            </select>
          </div>

          {/* Rep Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{repData.name}</h2>
                <p className="opacity-90">{repData.email}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded ${repData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {repData.status}
                  </span>
                  <span>Joined: Jan 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rep Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{repMeetings.length}</div>
              <div className="text-sm text-gray-600">Total Meetings</div>
              <div className="text-xs text-gray-500 mt-1">All time</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-green-600">{repData.meetingsThisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
              <div className="text-xs text-gray-500 mt-1">vs 6 last month</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{repAgents.length}</div>
              <div className="text-sm text-gray-600">Agents Added</div>
              <div className="text-xs text-gray-500 mt-1">In network</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-orange-600">{repData.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-gray-500 mt-1">Pipeline success</div>
            </div>
          </div>

          {/* Pipeline Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Pipeline Progress</h3>
            <div className="space-y-4">
              {[
                { stage: 'Prospect Identified', count: 12, color: 'bg-gray-400' },
                { stage: 'Contact Made', count: 8, color: 'bg-blue-400' },
                { stage: 'Meeting Held', count: 6, color: 'bg-yellow-400' },
                { stage: 'Proposal Shared', count: 4, color: 'bg-orange-400' },
                { stage: 'Agent Onboarded', count: 2, color: 'bg-green-400' }
              ].map((item, index) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.stage}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{width: `${(item.count / 12) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-full min-w-8 text-center">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {repMeetings.slice(0, 5).map((meeting) => (
                <div key={meeting.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-16 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{meeting.agenda}</div>
                    <div className="text-sm text-gray-600">{meeting.agentName} • {meeting.organization}</div>
                    <div className="text-xs text-gray-500 mt-1">{meeting.date} • {meeting.duration} minutes • {meeting.type}</div>
                    {meeting.nextSteps && (
                      <div className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                        Next: {meeting.nextSteps}
                      </div>
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${meeting.proofUploaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">TIMEBOX</h1>
                  <p className="text-sm text-gray-600">Manager Dashboard - Team performance insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentUser}
                  </div>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setDashboardView('overview')}
                className={`py-4 border-b-2 transition-colors font-medium ${
                  dashboardView === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setDashboardView('rep-detail')}
                className={`py-4 border-b-2 transition-colors font-medium ${
                  dashboardView === 'rep-detail'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Rep Details</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView('pipeline')}
                className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Pipeline</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {dashboardView === 'overview' ? <OverviewDashboard /> : <RepDetailDashboard />}
      </div>
    );
  };

  // Main App Router
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginScreen />;
      case 'rep-dashboard':
        return <RepDashboard />;
      case 'add-agent':
        return <AddAgentScreen />;
      case 'add-meeting':
        return <AddMeetingScreen />;
      case 'manager-dashboard':
        return <ManagerDashboard />;
      case 'all-meetings':
        return <AllMeetingsScreen />;
      case 'all-reps':
        return <AllRepsScreen />;
      case 'pipeline':
        return <PipelineBoard />;
      default:
        return <LoginScreen />;
    }
  };

  return <div className="font-sans min-h-screen">{renderCurrentView()}</div>;
};

export default SalesTrackerApp;