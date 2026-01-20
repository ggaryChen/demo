import React, { useState, useRef } from 'react';
import './InterviewSum.css';
import TextInput from './components/TextInput';
import ProgressBar from './components/ProgressBar';
import Timeline from './components/Timeline';
import { processInterviewScript } from './utils/aiProcessor';

function InterviewSum() {
  const [scriptText, setScriptText] = useState('');
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // 防抖用的 ref，确保请求只能发送一次
  const isProcessingRef = useRef(false);

  const handleProcess = async () => {
    // 防抖检查：如果已经在处理中，直接返回
    if (isProcessingRef.current || loading) {
      return;
    }

    if (!scriptText.trim()) {
      setError('请输入面试脚本内容');
      return;
    }

    // 标记正在处理，防止重复点击
    isProcessingRef.current = true;
    setLoading(true);
    setError(null);
    setProgress(0);
    setTimelineData(null); // 清空旧结果，确保新请求时没有缓存影响

    try {
      // 模拟 AI 处理过程
      const result = await processInterviewScript(scriptText, setProgress);
      setTimelineData(result);
      setProgress(100);
    } catch (err) {
      setError(err.message || '处理失败，请重试');
      setTimelineData(null); // 错误时也要清空结果，不显示旧数据
      setProgress(0);
    } finally {
      setLoading(false);
      // 处理完成后，延迟 500ms 再允许下一次点击（防止快速重复点击）
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  const handleClear = () => {
    setScriptText('');
    setTimelineData(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="interview-sum-container">
      <div className="interview-sum-header">
        <h1>📝 面试脚本汇总分析</h1>
        <p>将面试脚本转换为时间线形式，快速理解关键信息</p>
      </div>

      <div className="interview-sum-content">
        <div className="input-section">
          <TextInput
            value={scriptText}
            onChange={setScriptText}
            disabled={loading}
            placeholder="请粘贴面试脚本内容...&#10;&#10;示例:&#10;00:00 - 05:30 面试官: 你好，欢迎来面试&#10;05:30 - 08:00 求职者: 感谢邀请，很高兴见到你&#10;08:00 - 12:00 面试官: 请介绍一下你的项目经验？"
          />

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleProcess}
              disabled={loading || !scriptText.trim()}
            >
              {loading ? '处理中...' : '🚀 开始分析'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              🗑️ 清空
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        {loading && (
          <ProgressBar progress={progress} />
        )}

        {timelineData && !loading && (
          <Timeline data={timelineData} />
        )}
      </div>
    </div>
  );
}

export default InterviewSum;
