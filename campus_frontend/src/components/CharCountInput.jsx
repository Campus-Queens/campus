import React from 'react';

const CharCountInput = ({ 
  name, 
  value, 
  onChange, 
  maxLength, 
  placeholder, 
  required, 
  type = "text",
  className = "w-full px-3 py-2 border rounded-md",
  rows,
  label,
  ...props 
}) => {
  const remainingChars = maxLength - (value?.length || 0);
  const isNearLimit = remainingChars <= 10;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && '*'}
        </label>
        <span className={`text-xs ${isNearLimit ? 'text-yellow-600' : 'text-gray-500'}`}>
          {value?.length || 0}/{maxLength}
        </span>
      </div>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${className} ${isNearLimit ? 'border-yellow-500' : ''}`}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          className={`${className} ${isNearLimit ? 'border-yellow-500' : ''}`}
          {...props}
        />
      )}
    </div>
  );
};

export default CharCountInput; 