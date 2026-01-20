import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress }) {
  const stages = [
    { name: '解析文本', progress: 20 },
    { name: '提取时间戳', progress: 40 },
    { name: 'AI 汇总', progress: 70 },
    { name: '生成时间线', progress: 100 },
  ];

  const currentStage = [...stages].reverse().find(s => progress >= s.progress) || stages[0];

  return (
    <div className="progress-container">
      <h3 className="progress-title">⏳ 处理进度</h3>

      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`,
            }}
          />
        </div>
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>

      <div className="stages-container">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`stage ${progress >= stage.progress ? 'active' : ''}`}
          >
            <div className="stage-dot">
              {progress >= stage.progress ? (
                <span className="stage-check">✓</span>
              ) : (
                <span className="stage-number">{index + 1}</span>
              )}
            </div>
            <div className="stage-name">{stage.name}</div>
          </div>
        ))}
      </div>

      <div className="current-stage">
        <strong>当前阶段:</strong> {currentStage.name}
      </div>
    </div>
  );
}

export default ProgressBar;
