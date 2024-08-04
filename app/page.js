'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function WelcomePage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleExplore = () => {
    if (name.trim()) {
      localStorage.setItem('userName', name.trim());
      router.push(`/main`);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{
        backgroundImage: `url('/images/cake.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#388E3C', fontWeight: 'bold' }}>
          Welcome to Pantry Tracker
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
          Keep track of your ingredients and discover new recipes!
        </Typography>
        <TextField
          label="Enter your name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          fullWidth
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#388E3C',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#388E3C',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleExplore}
          sx={{ 
            mt: 2, 
            bgcolor: '#388E3C', 
            '&:hover': { bgcolor: '#2E7D32' },
            width: '100%',
          }}
        >
          Start Exploring
        </Button>
      </MotionPaper>
    </Box>
  );
}






















































































// // WelcomePage.js
// 'use client';
// import React, { useState, useContext } from 'react';
// import { Box, Typography, TextField, Button } from "@mui/material";
// import { motion } from "framer-motion";
// import { UserContext } from './UserContext';

// export default function WelcomePage({ onComplete }) {
//   const [name, setName] = useState('');
//   const { setUserName } = useContext(UserContext);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (name.trim()) {
//       setUserName(name.trim());
//       onComplete();
//     }
//   };

//   return (
//     <Box 
//       component={motion.div}
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       width="100vw" 
//       height="100vh" 
//       display="flex" 
//       flexDirection="column"
//       justifyContent="center" 
//       alignItems="center"
//     >
//       <Typography variant="h4" gutterBottom>
//         Welcome to Your Pantry Manager
//       </Typography>
//       <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//         <TextField
//           label="Your Name"
//           variant="outlined"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           sx={{ mr: 2 }}
//         />
//         <Button 
//           type="submit" 
//           variant="contained" 
//           sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
//         >
//           Enter
//         </Button>
//       </Box>
//     </Box>
//   );
// }