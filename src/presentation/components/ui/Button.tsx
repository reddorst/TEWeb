import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
    // mapped to .btn and .btn-primary in index.css
    // Simplified for this demo
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            {...props}
        />
    );
};
