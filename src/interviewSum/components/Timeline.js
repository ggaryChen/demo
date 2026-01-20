import React, { useState, useRef, useEffect } from 'react';
import './Timeline.css';

function Timeline({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const progressBarRef = useRef(null);

  // 计算时间到百分比（基于最后一个时间块的结束时间）
  const calculatePosition = (timestamp) => {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').map(Number);
    const totalSeconds = parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
    
    const maxSeconds = data.timeBlocks && data.timeBlocks.length > 0
      ? (() => {
          const lastBlock = data.timeBlocks[data.timeBlocks.length - 1];
          const endParts = (lastBlock.end_time || '00:00:00').split(':').map(Number);
          return endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);
        })()
      : 3600;
    
    return Math.min((totalSeconds / (maxSeconds || 1)) * 100, 100);
  };

  // 计算时间块的宽度和位置
  const getBlockPosition = (block) => {
    const startPos = calculatePosition(block.start_time);
    const endPos = calculatePosition(block.end_time);
    return { start: startPos, end: endPos, width: endPos - startPos };
  };

  // 计算卡片位置，对齐时间块中心（使用 useEffect 确保只在 activeIndex 变化时计算）
  useEffect(() => {
    if (activeIndex === null || !data.timeBlocks || !data.timeBlocks[activeIndex] || !progressBarRef.current) {
      setCardPosition(null);
      return;
    }
    
    const block = data.timeBlocks[activeIndex];
    const blockPos = getBlockPosition(block);
    // 时间块的中心点位置（百分比）
    const blockCenter = (blockPos.start + blockPos.end) / 2;
    
    // 等待下一帧确保容器尺寸已确定
    requestAnimationFrame(() => {
      if (!progressBarRef.current) return;
      
      const container = progressBarRef.current;
      const containerWidth = container.offsetWidth;
      const cardMaxWidth = Math.min(420, containerWidth * 0.9);
      const cardHalfWidth = cardMaxWidth / 2;
      const margin = 10; // 边距
      
      // 默认居中在时间块中心
      let leftPercent = blockCenter;
      let alignment = 'center';
      let transform = 'translateX(-50%)'; // 默认居中
      
      // 计算卡片中心点的像素位置
      const centerPx = (blockCenter / 100) * containerWidth;
      
      // 检查左边界（卡片左边缘不能小于边距）
      if (centerPx - cardHalfWidth < margin) {
        leftPercent = (margin / containerWidth) * 100;
        alignment = 'left';
        transform = 'translateX(0)';
      }
      // 检查右边界（卡片右边缘不能大于容器宽度减去边距）
      else if (centerPx + cardHalfWidth > containerWidth - margin) {
        leftPercent = ((containerWidth - margin) / containerWidth) * 100;
        alignment = 'right';
        transform = 'translateX(-100%)';
      }
      
      setCardPosition({ 
        left: `${leftPercent}%`,
        alignment,
        transform,
        blockCenter: `${blockCenter}%` // 时间块中心位置，用于箭头定位
      });
    });
  }, [activeIndex, data.timeBlocks]);

  return (
    <div className="timeline-container">
      <h2 className="timeline-title">📋 面试分析结果</h2>

      {/* 高亮信息 */}
      <div className="analysis-section highlights-section">
        <h3 className="section-title">⭐ 亮点</h3>
        <div className="items-list">
          {data.highlights && data.highlights.length > 0 ? (
            data.highlights.map((highlight, index) => {
              // 兼容对象格式 {point, timestamp} 和字符串格式
              const highlightText = typeof highlight === 'string' 
                ? highlight 
                : (highlight.point || highlight);
              const timestamp = typeof highlight === 'object' ? highlight.timestamp : null;
              
              return (
                <div key={index} className="item">
                  <span className="item-icon">✓</span>
                  <span className="item-text">
                    {highlightText}
                    {timestamp && <span className="item-timestamp"> ({timestamp})</span>}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="empty-message">暂无亮点记录</p>
          )}
        </div>
      </div>

      {/* 不足之处 */}
      <div className="analysis-section lowlights-section">
        <h3 className="section-title">📍 需改进处</h3>
        <div className="items-list">
          {data.lowlights && data.lowlights.length > 0 ? (
            data.lowlights.map((lowlight, index) => {
              // 兼容对象格式 {issue, timestamp, suggestion} 和字符串格式
              const issueText = typeof lowlight === 'string' 
                ? lowlight 
                : (lowlight.issue || lowlight);
              const timestamp = typeof lowlight === 'object' ? lowlight.timestamp : null;
              const suggestion = typeof lowlight === 'object' ? lowlight.suggestion : null;
              
              return (
                <div key={index} className="item">
                  <span className="item-icon">!</span>
                  <span className="item-text">
                    {issueText}
                    {timestamp && <span className="item-timestamp"> ({timestamp})</span>}
                    {suggestion && <span className="item-suggestion"> - 建议：{suggestion}</span>}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="empty-message">暂无需改进内容</p>
          )}
        </div>
      </div>

      {/* 关键词 */}
      <div className="analysis-section entities-section">
        <h3 className="section-title">🔑 关键词提取</h3>
        <div className="entities-list">
          {data.entities && data.entities.length > 0 ? (
            data.entities.map((entity, index) => {
              // 兼容对象格式和字符串格式
              const entityText = typeof entity === 'string' 
                ? entity 
                : (entity.name || entity.text || String(entity));
              return (
                <span 
                  key={index} 
                  className={`entity-tag ${hoveredEntity === entityText ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredEntity(entityText)}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {entityText}
                </span>
              );
            })
          ) : (
            <p className="empty-message">暂无关键词提取</p>
          )}
        </div>
      </div>

      {/* 进度条时间线 */}
      <div className="timeline-section">
        <h3 className="section-title">📌 时间线总结</h3>
        
        {data.timeBlocks && data.timeBlocks.length > 0 ? (
          <>
            {/* 进度条 */}
            <div className="progress-timeline">
              <div className="progress-bar-container" ref={progressBarRef}>
                <div className="progress-bar-background">
                  <div className="progress-bar-fill" />
                </div>

                {/* 时间块标记 */}
                <div className="timeline-markers">
                  {data.timeBlocks.map((block, index) => {
                    const blockPos = getBlockPosition(block);
                    const isActive = activeIndex === index;
                    const isHovered = hoveredEntity && block.mentioned_entities && 
                      block.mentioned_entities.some(e => {
                        const entityText = typeof e === 'string' ? e : (e.name || e.text || String(e));
                        return entityText === hoveredEntity;
                      });
                    
                    return (
                      <div
                        key={index}
                        className={`timeline-block timeline-block-${block.performance_level || 'neutral'} ${isActive ? 'active' : ''} ${isHovered ? 'highlighted' : ''}`}
                        style={{
                          left: `${blockPos.start}%`,
                          width: `${Math.max(blockPos.width, 2)}%`
                        }}
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        title={block.segment_title}
                      >
                        <div className="block-indicator" />
                      </div>
                    );
                  })}
                </div>

                {/* 详细信息卡片（对齐时间块中心，放在 progress-bar-container 内以使用相同的定位上下文） */}
                {cardPosition && activeIndex !== null && data.timeBlocks[activeIndex] && (() => {
                  const block = data.timeBlocks[activeIndex];
                  
                  return (
                    <div
                      className={`timeline-detail-card card-${cardPosition.alignment}`}
                      style={{
                        visibility: cardPosition?.left ? 'visible' : 'hidden',  
                        left: cardPosition.left,
                        transform: cardPosition.transform,
                        '--arrow-position': cardPosition.blockCenter // CSS 变量，用于箭头位置
                      }}
                    >
                    <div className="card-header">
                      <span className="card-time">{block.start_time} - {block.end_time}</span>
                      <span className="card-level" data-level={block.performance_level}>
                        {block.performance_level}
                      </span>
                    </div>
                    <h4 className="card-title">{block.segment_title}</h4>
                    <p className="card-summary">{block.summary}</p>
                    <div className="card-key-points">
                      <strong>要点：</strong>
                      <ul>
                        {block.key_points && block.key_points.map((point, i) => {
                          // 兼容对象格式和字符串格式
                          const pointText = typeof point === 'string' 
                            ? point 
                            : (point.point || point.text || String(point));
                          return <li key={i}>{pointText}</li>;
                        })}
                      </ul>
                    </div>
                    {block.mentioned_entities && block.mentioned_entities.length > 0 && (
                      <div className="card-entities">
                        <strong>关键词：</strong>
                        {block.mentioned_entities.map((entity, i) => (
                          <span
                            key={i}
                            className="card-entity-tag"
                            onMouseEnter={() => setHoveredEntity(entity)}
                            onMouseLeave={() => setHoveredEntity(null)}
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              </div>
            </div>

            {/* 完整时间块列表 */}
            <div className="timeline-list">
              <div className="list-title">完整时间块</div>
              {data.timeBlocks.map((block, index) => (
                <div
                  key={index}
                  className={`timeline-list-item ${activeIndex === index ? 'highlight' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span className="item-time">{block.start_time} - {block.end_time}</span>
                  <span className="item-divider">→</span>
                  <span className="item-title">{block.segment_title}</span>
                  <span className={`item-level item-level-${block.performance_level}`}>
                    {block.performance_level}
                  </span>
                  <p className="item-summary">{block.summary}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="empty-message">暂无时间线数据</p>
        )}
      </div>

      {/* 总体总结 */}
      {data.interview_summary && (
        <div className="summary-section">
          <h3 className="section-title">📊 总体总结</h3>
          <p className="summary-text">{data.interview_summary}</p>
        </div>
      )}
    </div>
  );
}

export default Timeline;
