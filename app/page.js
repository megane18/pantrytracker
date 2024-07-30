import { Box } from "@mui/material";


const item =[
  'eggs',
  'banana',
  'potato',
  'onions',
  'lettuce',
  'avocado',
  'tortilla'
]

export default function Home() {
  return (
   <Box width="100vw" height="100vh"
   display={"flex"}
   justifyContent={"center"}
   alignItems={"center"}>
    <Box width='100px' height='600px'></Box>
   </Box>
  );
}
