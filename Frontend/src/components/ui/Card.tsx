import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    padding = 'md',
    shadow = 'md'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    };
    
    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
    };
    
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700';
    const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;
    
    return (
        <div className={classes}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
        {children}
    </h3>
);

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
    <div className={`text-gray-600 dark:text-gray-300 ${className}`}>
        {children}
    </div>
);

export default Card;