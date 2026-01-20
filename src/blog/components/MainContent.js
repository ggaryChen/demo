import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RssFeedRoundedIcon from "@mui/icons-material/RssFeedRounded";
import cardData from "../../article/doc.json";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

const SyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 0,
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 20,
  boxShadow: "0 2px 8px 0 rgba(0,0,0,0.06)",
  transition: "box-shadow 0.3s, transform 0.3s",
  "&:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
    boxShadow: "0 8px 24px 0 rgba(0,0,0,0.12)",
    transform: "translateY(-4px) scale(1.02)",
  },
  "&:focus-visible": {
    outline: "3px solid",
    outlineColor: "hsla(210, 98%, 48%, 0.5)",
    outlineOffset: "2px",
  },
}));

const SyledCardContent = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 16,
  flexGrow: 1,
  "&:last-child": {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export function Search({ value, onChange }) {
  return (
    <FormControl sx={{ width: { xs: "100%", md: "25ch" } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: "text.primary" }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          "aria-label": "search",
        }}
        value={value}
        onChange={onChange}
      />
    </FormControl>
  );
}

// 生成与 title 相关的稳定随机颜色
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 85%)`;
}

export default function MainContent() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState(null);
  const [cardState, setCardState] = React.useState(cardData);
  const [searchValue, setSearchValue] = React.useState("");
  const filterArray = [...new Set(cardData.map((card) => card.tag))];

  const navigate = useNavigate();

  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleClick = (filter) => {
    setCardState(cardData.filter((card) => card.tag === filter));
    setSearchValue("");
    console.log(filter);
  };

  const reset = () => {
    setCardState(cardData);
    setSearchValue("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (!value) {
      setCardState(cardData);
      return;
    }
    const lower = value.toLowerCase();
    setCardState(
      cardData.filter((card) =>
        card.title.toLowerCase().includes(lower) ||
        card.description.toLowerCase().includes(lower) ||
        card.tag.toLowerCase().includes(lower)
      )
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          Hui Chen
        </Typography>
        <Typography>Hui's blog</Typography>
      </div>
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          flexDirection: "row",
          gap: 1,
          width: { xs: "100%", md: "fit-content" },
          overflow: "auto",
        }}
      >
        <Search value={searchValue} onChange={handleSearchChange} />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          width: "100%",
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          gap: 4,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            gap: 1,
            overflow: "auto",
          }}
        >
          <Chip
            onClick={reset}
            size="medium"
            label="All categories"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
          {filterArray.map((filter, i) => (
            <Chip
              onClick={() => handleClick(filter)}
              size="medium"
              label={filter}
              sx={{
                backgroundColor: "transparent",
                border: "none",
              }}
              key={i}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "row",
            gap: 1,
            width: { xs: "100%", md: "fit-content" },
            overflow: "auto",
          }}
        >
          <Search value={searchValue} onChange={handleSearchChange} />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      <Grid container spacing={2} columns={12}>
        {cardState.map((card, i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <SyledCard
              variant="outlined"
              onFocus={() => handleFocus(0)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === 0 ? "Mui-focused" : ""}
              onClick={() => navigate(`/article/${i}`)}
            >
              {/* 随机色块封面 */}
              <Box
                sx={{
                  width: '100%',
                  height: 180,
                  background: stringToColor(card.slug || card.title || String(i)),
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
              <SyledCardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={card.tag} color="primary" size="small" sx={{ fontWeight: 600 }} />
                </Box>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: 16, lineHeight: 1.6, mb: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {card.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Avatar src={card.authors?.[0]?.avatar} alt={card.authors?.[0]?.name} sx={{ width: 28, height: 28 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {card.authors?.[0]?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.date ? new Date(card.date).toLocaleDateString() : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.readTime || '5 min read'}
                  </Typography>
                </Box>
              </SyledCardContent>
            </SyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
