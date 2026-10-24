import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import './echo';

const appName = import.meta.env.VITE_APP_NAME || 'NASA Health Monitoring System';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`] as any;

        if (page?.default && page.default.layout === undefined) {
            if (name === 'welcome') {
                page.default.layout = null;
            } else if (name.startsWith('auth/')) {
                page.default.layout = (children: React.ReactNode) => <AuthLayout>{children}</AuthLayout>;
            } else if (name.startsWith('settings/')) {
                page.default.layout = (children: React.ReactNode) => (
                    <AppLayout>
                        <SettingsLayout>{children}</SettingsLayout>
                    </AppLayout>
                );
            } else {
                page.default.layout = (children: React.ReactNode) => <AppLayout>{children}</AppLayout>;
            }
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
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
