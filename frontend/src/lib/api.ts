import axios from 'axios';
import * as mockData from './mockData';

// Create basic axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mocking the behavior of axios for all requests
api.interceptors.request.use(async (config) => {
    const { url, method } = config;
    console.log(`[MOCK API] ${method?.toUpperCase()} ${url}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let data: any = null;

    if (url?.includes('/users/stats')) {
        data = mockData.MOCK_STATS;
    } else if (url?.includes('/tasks')) {
        data = mockData.MOCK_TASKS;
    } else if (url?.includes('/notifications/read-all')) {
        data = { message: 'All marked as read' };
    } else if (url?.includes('/notifications')) {
        data = mockData.MOCK_NOTIFICATIONS;
    } else if (url?.includes('/projects')) {
        if (url.match(/\/projects\/[a-zA-Z0-9-]+/)) {
            data = mockData.MOCK_PROJECTS[0]; // Return first project for detail view
        } else {
            data = mockData.MOCK_PROJECTS;
        }
    } else if (url?.includes('/attendance')) {
        data = mockData.MOCK_ATTENDANCE;
    } else if (url?.includes('/meetings')) {
        data = mockData.MOCK_MEETINGS;
    } else if (url?.includes('/messages/channels')) {
        if (url.match(/\/channels\/[a-zA-Z0-9-]+\/messages/)) {
            const channelId = url.split('/')[3];
            data = (mockData.MOCK_MESSAGES as any)[channelId] || [];
        } else {
            data = mockData.MOCK_CHANNELS;
        }
    } else if (url?.includes('/messages/users') || url?.includes('/users')) {
        data = mockData.MOCK_TEAM;
    } else if (url?.includes('/messages/messages')) {
        data = { id: `msg-${Date.now()}`, content: config.data ? JSON.parse(config.data).content : '', createdAt: new Date().toISOString(), sender: mockData.MOCK_USER };
    } else if (url?.includes('/reports')) {
        data = mockData.MOCK_REPORTS;
    } else if (url?.includes('/auth/login') || url?.includes('/auth/register') || url?.includes('/auth/refresh')) {
        data = { accessToken: 'mock-access-token', user: mockData.MOCK_USER };
    }


    // Wrap in the format the frontend expects
    const response = {
        data: {
            success: true,
            data: data,
            message: 'Success (Mocked)'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
    };

    // Return a resolved promise that axios will then pass to the response interceptors/success handler
    // Actually, to truly intercept and prevent the network request, we should throw a "fake" error or use an adapter
    // But since this is a mock implementation, we'll just modify the adapter later if needed.
    // Easier way: Use a custom adapter.
    return Promise.reject({
        isMockResponse: true,
        response: response
    });
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.isMockResponse) {
            return Promise.resolve(error.response);
        }
        return Promise.reject(error);
    }
);

export default api;

