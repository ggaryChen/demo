import React from 'react';
import './TextInput.css';

function TextInput({ value, onChange, disabled, placeholder }) {
  return (
    <div className="text-input-wrapper">
      <label htmlFor="script-input" className="input-label">
        📄 面试脚本输入
      </label>
      <textarea
        id="script-input"
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        spellCheck="false"
      />
      <div className="input-hint">
        💡 支持时间戳格式: 00:00 - 05:30 说话人: 内容
      </div>
    </div>
  );
}

export default TextInput;
