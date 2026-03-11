import * as mockData from './mockData';

// Mock Supabase Client
export const supabase: any = {
    auth: {
        getSession: async () => ({
            data: {
                session: {
                    user: mockData.MOCK_USER,
                    access_token: 'mock-token',
                }
            },
            error: null
        }),
        onAuthStateChange: (callback: any) => {
            // Immediately trigger callback with mock session
            setTimeout(() => {
                callback('SIGNED_IN', {
                    user: mockData.MOCK_USER,
                    access_token: 'mock-token',
                });
            }, 0);
            return { data: { subscription: { unsubscribe: () => { } } } };
        },
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({
            data: { user: mockData.MOCK_USER, session: {} },
            error: null
        }),
    },
    from: (table: string) => ({
        select: (columns: string) => ({
            eq: (column: string, value: any) => ({
                single: async () => {
                    if (table.toLowerCase() === 'user' || table === 'User') {
                        return { data: mockData.MOCK_USER, error: null };
                    }
                    return { data: null, error: null };
                }
            })
        })
    })
};

