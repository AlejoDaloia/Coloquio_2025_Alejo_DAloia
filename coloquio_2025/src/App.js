import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import axios from 'axios';
import './App.css';

const theme = createTheme({
  typography: {
    fontFamily: '"Comic Relief", cursive',
  },
});

const getColor = (answer) => {
  switch (answer?.toLowerCase()) {
    case 'yes':
      return '#4CAF50';
    case 'no':
      return '#F44336';
    case 'maybe':
      return '#FFEB3B';
    default:
      return '#FFFFFF';
  }
};

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateQuestion = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return '¡No dejes la pregunta vacía!';
    if (trimmed.startsWith('¿') && trimmed.endsWith('?')) return '';
    if (!trimmed.endsWith('?')) return 'Recuerda terminar con ?';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateQuestion(question);
    if (validationError) {
      setError(validationError);
      setAnswer(null);
      return;
    }

    setError('');
    setLoading(true);
    setAnswer(null);

    try {
      const response = await axios.get('https://yesno.wtf/api');
      setAnswer(response.data);
    } catch {
      setAnswer({
        answer: 'Error',
        image: '',
        message: 'Ups... No pude consultar la bola mágica.',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ textAlign: 'center', color: '#fff' }}>
        <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
          🔮 ¡Haz tu pregunta!
        </Typography>

        <TextField
          fullWidth
          label="Escribe tu pregunta aquí"
          variant="filled"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          error={Boolean(error)}
          helperText={error || 'Termina con ? o ¿ ?'}
          sx={{
            bgcolor: '#fff',
            borderRadius: 1,
            mb: 2,
          }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            mb: 4,
            bgcolor: '#FF4081',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            px: 4,
            py: 1.5,
            borderRadius: 8,
            '&:hover': {
              bgcolor: '#F50057',
            },
          }}
        >
          {loading ? 'Consultando...' : 'Preguntar 🔮'}
        </Button>

        {loading && (
          <>
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Consultando la bola mágica...
            </Typography>
          </>
        )}
        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: getColor(answer.answer) }}
            >
              {answer.answer.toUpperCase()}
            </Typography>

            {answer.image && (
              <Card
                sx={{
                  maxWidth: 400,
                  mx: 'auto',
                  border: `5px solid ${getColor(answer.answer)}`,
                  borderRadius: 4,
                  boxShadow: 10,
                }}
              >
                <CardMedia
                  component="img"
                  image={answer.image}
                  alt={answer.answer}
                />
              </Card>
            )}

            {answer.message && (
              <Typography color="error" sx={{ mt: 2 }}>
                {answer.message}
              </Typography>
            )}
          </motion.div>
        )}
      </Container>
    </ThemeProvider>
  );
}