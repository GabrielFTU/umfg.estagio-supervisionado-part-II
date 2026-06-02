import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, style, onFocus, onBlur, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: '13px', color: '#666', fontWeight: 400, fontFamily: 'inherit' }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        style={{
          border: 'none',
          borderBottom: '1px solid #d1d5db',
          outline: 'none',
          padding: '8px 0',
          fontSize: '15px',
          color: '#111',
          background: 'transparent',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottomColor = '#111';
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottomColor = '#d1d5db';
          onBlur?.(e);
        }}
        {...props}
      />
    </div>
  ),
);

Input.displayName = 'Input';
