import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import NasaChatbot from '@/components/nasa-chatbot';
import './echo';

const appName = import.meta.env.VITE_APP_NAME || 'NASA Health Monitoring System';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`] as any;

        if (page?.default) {
            if (name === 'welcome' || name.startsWith('auth/') || name === 'Dataset' || name === 'dashboard') {
                page.default.layout = (children: React.ReactNode) => children;
            } else if (page.default.layout === undefined) {
                if (name.startsWith('settings/')) {
                    page.default.layout = (children: React.ReactNode) => (
                        <AppLayout>
                            <SettingsLayout>{children}</SettingsLayout>
                        </AppLayout>
                    );
                } else {
                    page.default.layout = (children: React.ReactNode) => <AppLayout>{children}</AppLayout>;
                }
            }
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <NasaChatbot />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#38bdf8',
    },
});

// Initialize light/dark theme on load
initializeTheme();
