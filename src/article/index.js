import * as React from "react";
import { useParams } from "react-router-dom";
import cardData from "./doc.json";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// 生成 TOC 辅助函数
function extractToc(md) {
  const lines = md.split('\n');
  const toc = [];
  lines.forEach((line, idx) => {
    const match = /^(#{1,3})\s+(.+)/.exec(line);
    if (match) {
      toc.push({
        level: match[1].length,
        text: match[2].replace(/[#*`]+/g, '').trim(),
        id: `toc-${idx}`
      });
    }
  });
  return toc;
}

export default function Article() {
  const { id: params } = useParams();
  const article = cardData[params];
  const [mdContent, setMdContent] = React.useState("");
  // 阅读进度 state
  const [progress, setProgress] = React.useState(0);
  const contentRef = React.useRef();
  // 计算正文区顶部高度（封面高度）
  const coverHeightPx = typeof window !== 'undefined' && window.innerWidth < 600 ? 200 : (window.innerWidth < 900 ? 320 : 400);
  // 目录/滚动条动态 top
  const [sideTop, setSideTop] = React.useState(coverHeightPx + 32);
  const tocBoxRef = React.useRef();
  const scrollBoxRef = React.useRef();
  // 进度条高度
  const progressBarHeight = 240; // px, 视觉高度

  React.useEffect(() => {
    if (article.body) {
      // 获取 basename，优先用 PUBLIC_URL 环境变量，否则用 '/demo/'
      const basename = process.env.PUBLIC_URL || '/demo';
      // 拼接成绝对路径，确保不会出现重复斜杠
      const mdUrl = `/demo/${article.body}`.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
      fetch(mdUrl)
        .then((res) => res.text())
        .then((text) => setMdContent(text));
    }
  }, [article.body]);

  React.useEffect(() => {
    function onScroll() {
      // 计算页面整体进度
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const total = docHeight - winHeight;
      let percent = Math.max(0, Math.min(1, scrollTop / total));
      setProgress(isNaN(percent) ? 0 : percent);

      // 目录/滚动条居中逻辑
      const tocH = tocBoxRef.current ? tocBoxRef.current.offsetHeight : 320;
      const centerTop = `calc(50vh - ${tocH / 2}px)`;
      if (scrollTop > coverHeightPx) {
        setSideTop(centerTop);
      } else {
        setSideTop(coverHeightPx + 32);
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [coverHeightPx]);

  const toc = React.useMemo(() => extractToc(mdContent), [mdContent]);

  // 滚动到锚点
  const handleTocClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 生成与 slug/title 相关的稳定随机颜色
  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // pastel HSL
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 85%)`;
  }
  const coverColor = stringToColor(article.slug || article.title || params);

  // 自定义 markdown 渲染样式
  const components = {
    h1: ({node, ...props}) => {
      const id = node.position ? `toc-${node.position.start.line-1}` : undefined;
      return <Typography id={id} variant="h4" sx={{ fontWeight: 800, mt: 4, mb: 2 }} {...props} />;
    },
    h2: ({node, ...props}) => {
      const id = node.position ? `toc-${node.position.start.line-1}` : undefined;
      return <Typography id={id} variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }} {...props} />;
    },
    h3: ({node, ...props}) => {
      const id = node.position ? `toc-${node.position.start.line-1}` : undefined;
      return <Typography id={id} variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1.5 }} {...props} />;
    },
    p: ({node, ...props}) => <Typography variant="body1" sx={{ mb: 2, fontSize: 17, lineHeight: 1.9 }} {...props} />,
    ul: ({node, ...props}) => <Box component="ul" sx={{ pl: 3, mb: 2, fontSize: 17, lineHeight: 1.9 }} {...props} />,
    ol: ({node, ...props}) => <Box component="ol" sx={{ pl: 3, mb: 2, fontSize: 17, lineHeight: 1.9 }} {...props} />,
    li: ({node, ...props}) => <li style={{ marginBottom: 6 }}>{props.children}</li>,
    blockquote: ({node, ...props}) => <Box component="blockquote" sx={{ borderLeft: '4px solid #eee', pl: 2, color: 'text.secondary', fontStyle: 'italic', my: 2 }}>{props.children}</Box>,
    code({node, className, children, ...props}) {
      const inline = node.position.start.line === node.position.end.line;
      const match = /language-(\w+)/.exec(className || "");
      return !inline ? (
        <SyntaxHighlighter
          style={oneLight}
          language={match ? match[1] : undefined}
          PreTag="div"
          customStyle={{ borderRadius: 8, fontSize: 15, margin: '16px 0' }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <Box component="code" sx={{ bgcolor: '#f5f5f5', px: 0.5, borderRadius: 1, fontSize: 15, color: '#d6336c' }} {...props}>
          {children}
        </Box>
      );
    },
    a: ({node, ...props}) => <a style={{ color: '#1976d2', textDecoration: 'underline' }} {...props} />,
    img: ({node, ...props}) => <Box component="img" sx={{ maxWidth: '100%', my: 2, borderRadius: 2 }} {...props} />,
    table: ({node, ...props}) => <Box component="table" sx={{ my: 2, borderCollapse: 'collapse', width: '100%' }} {...props} />,
    th: ({node, ...props}) => <Box component="th" sx={{ border: '1px solid #eee', p: 1, bgcolor: '#fafafa' }} {...props} />,
    td: ({node, ...props}) => <Box component="td" sx={{ border: '1px solid #eee', p: 1 }} {...props} />,
    hr: () => <Box component="hr" sx={{ border: 0, borderTop: '1px solid #e0e0e0', my: 3, opacity: 0.5 }} />,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
      {/* 左侧导航栏 */}
      <Box
        ref={tocBoxRef}
        sx={{
          width: 200,
          minWidth: 160,
          maxWidth: 240,
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          left: 0,
          top: sideTop,
          height: 'auto',
          pr: 2,
          pt: 4,
          overflowY: 'auto',
          color: 'text.secondary',
          fontSize: 15,
          bgcolor: 'rgba(250,252,255,0.92)',
          borderRadius: 3,
          boxShadow: '0 2px 12px 0 rgba(80,80,180,0.08)',
          mx: 2,
          zIndex: 1300,
          pointerEvents: 'auto',
          transition: 'box-shadow 0.2s, background 0.2s, top 0.4s cubic-bezier(.4,1.6,.6,1)',
          '&:hover': {
            boxShadow: '0 4px 24px 0 rgba(80,80,180,0.16)',
            bgcolor: 'rgba(240,245,255,0.98)',
          },
        }}
      >
        <Box sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>目录</Box>
        {toc.map(item => (
          <Box
            key={item.id}
            sx={{
              pl: (item.level - 1) * 2,
              py: 0.5,
              cursor: 'pointer',
              color: 'text.secondary',
              borderRadius: 2,
              transition: 'background 0.2s, color 0.2s',
              '&:hover': { color: 'primary.main', background: 'rgba(66,165,245,0.08)' },
            }}
            onClick={() => handleTocClick(item.id)}
          >
            {item.text}
          </Box>
        ))}
      </Box>
      {/* 右侧正文区 */}
      <Box ref={contentRef} sx={{ flex: 1, position: 'relative' }}>
        {/* 封面随机色块 */}
        <Box
          sx={{
            width: "100%",
            height: { xs: 200, sm: 320, md: 400 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: coverColor,
            mb: { xs: 2, sm: 4 },
          }}
        />
        {/* 内容区居中，宽度适中 */}
        <Box sx={{ maxWidth: 680, mx: "auto", px: { xs: 2, sm: 0 } }}>
          {/* 标签、日期、阅读时长 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip label={article.tag} color="primary" size="small" sx={{ fontWeight: 600 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {article.date ? new Date(article.date).toLocaleDateString() : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {article.readTime || "5 min read"}
              </Typography>
            </Box>
          </Box>
          {/* 标题 */}
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
            {article.title}
          </Typography>
          {/* 作者信息 */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              src={article.authors[0].avatar}
              alt={article.authors[0].name}
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {article.authors[0].name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {article.authors[0].role || "Contributing Writer"}
              </Typography>
            </Box>
          </Box>
          {/* 正文描述 */}
          <Typography variant="body1" color="text.primary" sx={{ fontSize: 18, lineHeight: 1.8, mb: 4 }}>
            {article.description}
          </Typography>
          {/* markdown 正文 */}
          <Box sx={{ fontSize: 17, lineHeight: 1.9, color: 'text.primary', mb: 6 }}>
            <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>{mdContent}</ReactMarkdown>
          </Box>
        </Box>
      </Box>
      {/* 右侧可视化滚动条 */}
      <Box
        ref={scrollBoxRef}
        sx={{
          position: 'fixed',
          right: 24,
          top: sideTop,
          height: `${progressBarHeight}px`,
          width: 16,
          display: { xs: 'none', md: 'block' },
          zIndex: 1200,
          pr: 1,
          transition: 'width 0.2s, top 0.4s cubic-bezier(.4,1.6,.6,1)',
          '&:hover .progress-bar': {
            width: 10,
            boxShadow: '0 4px 24px 0 rgba(80,80,180,0.18)',
          },
        }}
      >
        <Box
          className="progress-bar"
          sx={{
            width: 6,
            height: '100%',
            bgcolor: '#f3f6fa',
            borderRadius: 4,
            mx: 'auto',
            position: 'relative',
            boxShadow: '0 2px 8px 0 rgba(80,80,180,0.08)',
            transition: 'width 0.2s, box-shadow 0.2s',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: `${Math.round(progress * 100)}%`,
              background: 'linear-gradient(180deg, #42a5f5 0%, #1976d2 100%)',
              borderRadius: 4,
              transition: 'height 0.2s',
              boxShadow: '0 2px 8px 0 rgba(80,80,180,0.10)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
