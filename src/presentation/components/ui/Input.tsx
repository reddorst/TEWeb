import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input
                className={`input-field ${className}`}
                {...props}
            />
        </div>
    );
};
