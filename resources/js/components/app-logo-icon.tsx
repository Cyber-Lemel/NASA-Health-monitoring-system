import React from 'react';
import NasaLogo from '@/components/nasa-logo';

export default function AppLogoIcon(props: React.SVGAttributes<SVGElement>) {
    return <NasaLogo size={props.width || 36} className={props.className} {...props} />;
}
