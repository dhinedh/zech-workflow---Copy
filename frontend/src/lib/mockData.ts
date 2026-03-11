export const MOCK_USER = {
    id: 'user-123',
    email: 'demo@zech.ai',
    name: 'Demo User',
    role: 'SUPER_ADMIN',
    companyId: 'company-1',
    isActive: true,
};

export const MOCK_PROFILE = {
    id: 'user-123',
    email: 'demo@zech.ai',
    full_name: 'Demo User',
    name: 'Demo User',
    role: 'SUPER_ADMIN',
    company_id: 'company-1',
    companyId: 'company-1',
    status: 'ACTIVE',
    isActive: true,
};

export const MOCK_STATS = {
    assignmentsCount: 12,
    urgentCount: 3,
    weeklyHours: "38.5",
    upcomingMeetings: 2
};

export const MOCK_TASKS = [
    {
        id: 'task-1',
        title: 'Complete UI Redesign',
        status: 'IN_PROGRESS',
        project: { name: 'Zech Workflow' },
    },
    {
        id: 'task-2',
        title: 'API Documentation',
        status: 'TODO',
        project: { name: 'Backend System' },
    },
    {
        id: 'task-3',
        title: 'Client Meeting Preparation',
        status: 'IN_PROGRESS',
        project: { name: 'Marketing Campaign' },
    },
];

export const MOCK_NOTIFICATIONS = [
    {
        id: 'notif-1',
        title: 'New Assignment',
        message: 'You have been assigned to the "Mobile App" project.',
        isRead: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'notif-2',
        title: 'Meeting Reminder',
        message: 'Standup meeting in 15 minutes.',
        isRead: true,
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_PROJECTS = [
    {
        id: 'proj-1',
        name: 'Zech Workflow',
        description: 'Internal project management system redesign.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        progress: 75,
        manager: { name: 'Alice Wong' },
        client: { name: 'Zech AI' },
        milestones: [
            { id: 'm-1', title: 'UI Mockups', dueDate: '2024-03-15', status: 'COMPLETED' },
            { id: 'm-2', title: 'Frontend Implementation', dueDate: '2024-04-20', status: 'IN_PROGRESS' },
        ]
    },
    {
        id: 'proj-2',
        name: 'Cloud Migration',
        description: 'Migrating legacy servers to AWS.',
        status: 'ON_HOLD',
        priority: 'MEDIUM',
        startDate: '2024-02-15',
        progress: 40,
        manager: { name: 'Bob Smith' },
        client: { name: 'Legacy Corp' },
        milestones: []
    },
];

export const MOCK_TEAM = [
    { id: 'team-1', name: 'John Doe', role: 'Developer', avatar: null, email: 'john@zech.ai', status: 'online' },
    { id: 'team-2', name: 'Jane Smith', role: 'Designer', avatar: null, email: 'jane@zech.ai', status: 'busy' },
    { id: 'team-3', name: 'Alice Wong', role: 'Manager', avatar: null, email: 'alice@zech.ai', status: 'offline' },
];

export const MOCK_ATTENDANCE = [
    {
        id: 'att-1',
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date(new Date().setHours(9, 0, 0)).toISOString(),
        checkOutTime: null,
        totalHours: 2.5,
        workType: 'Office'
    },
    {
        id: 'att-2',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        checkInTime: new Date(Date.now() - 86400000).setHours(9, 0, 0),
        checkOutTime: new Date(Date.now() - 86400000).setHours(18, 0, 0),
        totalHours: 9.0,
        workType: 'Remote'
    }
];

export const MOCK_MEETINGS = [
    {
        id: 'meet-1',
        title: 'Weekly Sync',
        description: 'Discuss project progress and blockers.',
        startTime: new Date(new Date().setHours(14, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(15, 0, 0)).toISOString(),
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        meetingType: 'TEAM_SYNC',
        organizer: { name: 'Alice Wong' }
    },
    {
        id: 'meet-2',
        title: 'Client Review',
        description: 'Present the latest UI mockups to the client.',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        meetingLink: 'https://meet.google.com/xyz-pqr-stu',
        meetingType: 'CLIENT_REVIEW',
        organizer: { name: 'John Doe' }
    }
];

export const MOCK_CHANNELS = [
    {
        id: 'chan-1',
        name: 'General',
        type: 'GROUP',
        members: [{ user: MOCK_USER }, { user: MOCK_TEAM[0] }, { user: MOCK_TEAM[1] }],
        updatedAt: new Date().toISOString()
    },
    {
        id: 'chan-2',
        name: 'Project Alpha',
        type: 'PROJECT',
        members: [{ user: MOCK_USER }, { user: MOCK_TEAM[2] }],
        updatedAt: new Date().toISOString()
    },
    {
        id: 'chan-3',
        name: 'Jane Smith',
        type: 'DIRECT',
        members: [{ user: MOCK_USER }, { user: MOCK_TEAM[1] }],
        updatedAt: new Date().toISOString()
    }
];

export const MOCK_MESSAGES = {
    'chan-1': [
        {
            id: 'msg-1',
            senderId: 'team-1',
            content: 'Hello everyone!',
            channelId: 'chan-1',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            sender: MOCK_TEAM[0]
        },
        {
            id: 'msg-2',
            senderId: 'user-123',
            content: 'Hi John!',
            channelId: 'chan-1',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            sender: MOCK_USER
        }
    ],
    'chan-3': [
        {
            id: 'msg-3',
            senderId: 'team-2',
            content: 'Do you have the latest design files?',
            channelId: 'chan-3',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            sender: MOCK_TEAM[1]
        }
    ]
};

export const MOCK_REPORTS = [
    {
        id: 'rep-1',
        title: 'Daily Progress Report - March 10',
        content: 'Worked on the dashboard navigation and theme switching.',
        status: 'SUBMITTED',
        date: '2024-03-10',
        author: { name: 'Demo User' }
    }
];
