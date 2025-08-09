'use client';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

function ClientOnlyToaster() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <Toaster />;
}

export default ClientOnlyToaster;