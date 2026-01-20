/**
 * AI 处理模块 - 使用 OpenRouter API 调用大模型
 * 通过 GPT-4-mini 进行面试脚本分析
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = 'xxx';
const MODEL = 'deepseek/deepseek-v3.2';
const CACHE_PREFIX = 'interview_sum_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天过期

/**
 * 生成缓存键（基于输入文本的哈希）
 */
const generateCacheKey = (text) => {
  // 简单的哈希函数
  let hash = 0;
  const normalizedText = text.trim().toLowerCase();
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return `${CACHE_PREFIX}${Math.abs(hash)}`;
};

/**
 * 从缓存获取结果
 */
const getCachedResult = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // 检查是否过期
    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('读取缓存失败:', error);
    return null;
  }
};

/**
 * 保存结果到缓存
 */
const setCachedResult = (cacheKey, data) => {
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('保存缓存失败:', error);
    // 如果存储空间不足，尝试清理旧缓存
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 50) {
        // 删除最旧的10个缓存
        const sortedKeys = cacheKeys.map(k => ({
          key: k,
          timestamp: JSON.parse(localStorage.getItem(k))?.timestamp || 0
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        sortedKeys.slice(0, 10).forEach(({ key }) => {
          localStorage.removeItem(key);
        });
        
        // 重试保存
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (e) {
      console.error('清理缓存失败:', e);
    }
  }
};

export const processInterviewScript = async (scriptText, setProgress) => {
  // 检查缓存
  const cacheKey = generateCacheKey(scriptText);
  const cachedResult = getCachedResult(cacheKey);
  
  if (cachedResult) {
    // 缓存命中，快速显示进度
    console.log('使用缓存结果');
    setProgress(0);
    // 快速动画到100%
    await new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          setProgress(100);
          clearInterval(interval);
          setTimeout(resolve, 100);
        } else {
          setProgress(progress);
        }
      }, 50);
    });
    return cachedResult;
  }
  // 平滑进度控制：0 -> 90 在 10 秒内完成；90 -> 98 慢速推进；当 API 返回时快速推进到 100
  let progress = 0;
  let mainInterval = null;
  let slowInterval = null;
  let finished = false;

  const safeSet = (p) => {
    // 使用一位小数，保证进度平滑且单向增长
    const val = Math.max(progress, Math.min(100, Number(Number(p).toFixed(1))));
    progress = val;
    if (typeof setProgress === 'function') setProgress(progress);
  };

  // 启动平滑计时器（0 -> 90 over 10s）
  const startSmoothTo90 = () => {
    const duration = 10000; // ms
    const start = Date.now();
    const initial = progress;
    // 更细腻的更新频率
    mainInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const target = initial + (90 - initial) * t;
      if (target > progress) safeSet(target);
      if (t >= 1) {
        clearInterval(mainInterval);
        mainInterval = null;
        // 进入慢速推进 90 -> 98（更小步长、更平滑）
        slowInterval = setInterval(() => {
          if (progress < 98) {
            safeSet(progress + 0.2);
          } else {
            clearInterval(slowInterval);
            slowInterval = null;
          }
        }, 400);
      }
    }, 100);
  };

  try {
    // 初始化并开始平滑进度
    safeSet(0);
    startSmoothTo90();

    // 并行发起 API 调用
    const analysisPromise = callAIAnalysis(scriptText, setProgress);

    // 当 API 返回或出错时，我们会加速进度到 100
    const analysisResult = await analysisPromise;

    // 如果还在自动推进，停止这些定时器
    if (mainInterval) { clearInterval(mainInterval); mainInterval = null; }
    if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }

    // 快速推进到 100（分几个小步以显得平滑）
    await new Promise((resolve) => {
      const accel = setInterval(() => {
        if (progress >= 100) {
          clearInterval(accel);
          resolve();
        } else {
          // 每次跨步提高，距离越小步长越小
          const step = Math.max(4, Math.ceil((100 - progress) / 6));
          safeSet(progress + step);
        }
      }, 50);
    });

    // 确保 100% 持续一会儿以便 UI 能看到完成状态
    await new Promise(r => setTimeout(r, 180));

    const timelineData = parseAIResponse(analysisResult);
    // 再次保证显示 100
    safeSet(100);
    finished = true;
    
    // 保存到缓存
    setCachedResult(cacheKey, timelineData);
    
    return timelineData;
  } catch (error) {
    if (mainInterval) { clearInterval(mainInterval); mainInterval = null; }
    if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }
    console.error('AI 处理失败:', error);
    throw new Error(`API 调用失败: ${error.message}`);
  }
};

/**
 * 调用 OpenRouter API 分析面试脚本
 */
const callAIAnalysis = async (scriptText, setProgress) => {
  const prompt = buildAnalysisPrompt(scriptText);

  // 调用 API 前不强制修改进度，让主控制器平滑推进

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API 错误 (${response.status}): ${errorData.error?.message || '未知错误'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * 构建分析提示词
 */
const buildAnalysisPrompt = (scriptText) => {
  return `请深度分析这段面试脚本，并以严格的JSON格式返回结果。

【面试脚本】
${scriptText}

【任务要求】
请提供以下信息：

1. **interview_summary** - 对整体面试的总体评价（100字以内），包括总体印象和建议
2. **highlights** - 面试中的亮点（求职者表现优秀的地方），返回数组，最多5个，每个包含：
   - point: 亮点描述
   - timestamp: 对应时间（格式 HH:MM:SS）
3. **lowlights** - 面试中的不足之处（需要改进的地方），返回数组，最多5个，每个包含：
   - issue: 问题描述
   - timestamp: 对应时间（格式 HH:MM:SS）
   - suggestion: 改进建议
4. **entities** - 关键词提取（技术栈、公司名、项目名、专业术语等），返回数组，最多15个
5. **time_blocks** - 按时间段划分的详细面试内容分析，每个时间块包括：
   - start_time: 开始时间（格式 HH:MM:SS）
   - end_time: 结束时间（格式 HH:MM:SS）
   - segment_title: 环节标题（如：自我介绍、技术讨论、项目经验、压力测试等）
   - summary: 该时间段的详细总结（60-100字）
   - key_points: 该时间段的关键要点（数组，2-4个）
   - performance_level: 表现评级（excellent/good/neutral/needs_improvement）
   - mentioned_entities: 该时间段提及的关键词（数组，可从 entities 中选取）

【输出格式】
必须返回有效的JSON，格式如下：
{
  "interview_summary": "整体评价文字",
  "highlights": [
    {"point": "技术知识扎实，对框架原理理解深入", "timestamp": "00:05:00"},
    {"point": "沟通清晰，能够很好地解释复杂概念", "timestamp": "00:12:30"}
  ],
  "lowlights": [
    {"issue": "在某个技术问题上回答不够准确", "timestamp": "00:15:00", "suggestion": "需要加强对该领域的学习"},
    {"issue": "时间管理不够好，某些回答过于冗长", "timestamp": "00:20:00", "suggestion": "可以更加简洁地表达想法"}
  ],
  "entities": ["React", "Node.js", "MySQL", "Redis", "Docker", "微服务架构"],
  "time_blocks": [
    {
      "start_time": "00:00:00",
      "end_time": "00:03:00",
      "segment_title": "自我介绍",
      "summary": "候选人介绍了自己的教育背景、工作经验和技能特长。表现自信且条理清晰，能够很好地把握时间。",
      "key_points": ["教育背景solid", "5年开发经验", "全栈能力"],
      "performance_level": "excellent",
      "mentioned_entities": ["React", "Node.js"]
    },
    {
      "start_time": "00:03:00",
      "end_time": "00:15:00",
      "segment_title": "技术讨论",
      "summary": "深入讨论了React框架的原理、虚拟DOM机制和性能优化。候选人展现了扎实的理论基础和实战经验，举例清晰有力。",
      "key_points": ["虚拟DOM理解深入", "性能优化经验丰富", "能够从源码层面解释"],
      "performance_level": "excellent",
      "mentioned_entities": ["React", "虚拟DOM", "性能优化"]
    }
  ]
}

【重要提示】
- 只返回JSON格式，不要有其他文本或说明
- time_blocks 至少要有3个时间块，覆盖面试的主要阶段
- start_time 和 end_time 必须从脚本中提取或合理推断，保持递增顺序
- 内容要深入、具体、有建设性
- 避免使用"该候选人"等重复表述，直接描述现象和表现
- performance_level 必须从给定的4个选项中选择
- mentioned_entities 应从 entities 数组中选取`;
};

/**
 * 解析 AI 返回的结果
 */
const parseAIResponse = (aiResponse) => {
  try {
    let jsonStr = aiResponse;

    // 尝试从 markdown 代码块中提取 JSON (支持 ```json 和 ```)
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    }

    // 尝试直接解析
    let analysis;
    try {
      analysis = JSON.parse(jsonStr.trim());
    } catch (e) {
      // 如果直接解析失败，尝试查找第一个 { 和最后一个 }
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const extractedJson = jsonStr.substring(startIdx, endIdx + 1);
        analysis = JSON.parse(extractedJson);
      } else {
        throw e;
      }
    }

    // 构建时间线数据，兼容新的时间块结构
    const timelineData = {
      interview_summary: analysis.interview_summary || '',
      highlights: analysis.highlights || [],
      lowlights: analysis.lowlights || [],
      entities: analysis.entities || [],
      timeBlocks: analysis.time_blocks || [],
      summary: analysis.interview_summary || generateOverallSummary(analysis),
      totalDuration: extractTotalDuration(analysis.time_blocks),
    };

    return timelineData;
  } catch (error) {
    console.error('JSON 解析失败:', error);
    console.error('原始 AI 响应:', aiResponse.substring(0, 500)); // 只打印前500个字符避免过长
    throw new Error('分析结果解析失败，请重试。错误：' + error.message);
  }
};

/**
 * 生成总体总结（备用）
 */
const generateOverallSummary = (analysis) => {
  const highlightsCount = analysis.highlights?.length || 0;
  const lowlightsCount = analysis.lowlights?.length || 0;
  const entitiesCount = analysis.entities?.length || 0;

  return `本次面试共识别 ${highlightsCount} 个亮点、${lowlightsCount} 个需改进处、${entitiesCount} 个关键词。`;
};

/**
 * 提取总时长
 */
const extractTotalDuration = (timeBlocks) => {
  if (!timeBlocks || timeBlocks.length === 0) return '00:00:00';

  const lastBlock = timeBlocks[timeBlocks.length - 1];
  if (lastBlock.end_time) {
    return lastBlock.end_time;
  }

  return '00:00:00';
};

