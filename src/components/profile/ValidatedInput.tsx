import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ValidatedInputProps } from "../../@types/interfaces";

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  type,
  value,
  placeholder,
  error,
  onChange,
  showToggle,
  isShown,
  onToggleShow,
}) => (
  <div className="validated-input">
    <label htmlFor={labelId(label)} className="p-text-personal">
      {label}
      <input
        id={labelId(label)}
        type={showToggle && isShown ? "text" : type}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${labelId(label)}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="edit-input"
      />
    </label>
    {showToggle && onToggleShow && (
      <span onClick={onToggleShow} className="eye-icon">
        {isShown ? <FaEyeSlash /> : <FaEye />}
      </span>
    )}
    {error && (
      <p id={`${labelId(label)}-error`} className="error-message">
        {error}
      </p>
    )}
  </div>
);

function labelId(label: string) {
  return label.replace(/\s+/g, "").toLowerCase();
}

export default ValidatedInput;
