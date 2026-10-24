import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { configureEcho } from '@laravel/echo-react';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
    }
}

window.Pusher = Pusher;

const echoConfig = {
    broadcaster: 'reverb' as const,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
};

window.Echo = new Echo(echoConfig);
configureEcho(echoConfig);

export default window.Echo;
