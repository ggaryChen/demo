import * as React from "react";
import { useParams } from "react-router-dom";
import cardData from "./doc.json";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export default function Article() {
  const { id: params } = useParams();
  return (
    <Card variant="outlined">
      <CardMedia
        component="img"
        alt="green iguana"
        image={cardData[params].img}
        aspect-ratio="16 / 9"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />
      <CardContent>
        <Typography gutterBottom variant="caption" component="div">
          {cardData[params].tag}
        </Typography>
        <Typography gutterBottom variant="h6" component="div">
          {cardData[params].title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {cardData[params].description}
        </Typography>
      </CardContent>
      <p>{cardData[params].authors[0].name}</p>
    </Card>
  );
}
