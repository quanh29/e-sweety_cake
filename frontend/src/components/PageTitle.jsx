import { useEffect } from 'react';

const PageTitle = ({ title }) => {
    useEffect(() => {
        const baseTitle = 'E-Sweetie Bake';
        document.title = title ? `${title} - ${baseTitle}` : baseTitle;
        
        return () => {
            document.title = baseTitle;
        };
    }, [title]);

    return null;
};

export default PageTitle;
