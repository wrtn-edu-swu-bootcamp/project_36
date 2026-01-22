import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  className?: string;
}

export default function Alert({
  children,
  variant = 'info',
  icon,
  className = '',
}: AlertProps) {
  const variantClass = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    danger: 'alert-danger',
  }[variant];

  const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
  };

  return (
    <div className={`${variantClass} ${className}`}>
      <span className="text-2xl flex-shrink-0">{icon || defaultIcons[variant]}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
