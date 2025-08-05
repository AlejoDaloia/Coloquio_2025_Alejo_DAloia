import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  CssBaseline,
  Modal,
  Box,
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
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [openModal, setOpenModal] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('magic8-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('magic8-history', JSON.stringify(history));
  }, [history]);

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
      setQuestion('');

      setHistory((prevHistory) => [
        { question: question.trim(), answer: response.data.answer },
        ...prevHistory,
      ]);
    } catch {
      setAnswer({
        answer: 'Error',
        image: '',
        message: 'Ups... No pude consultar la bola mágica.',
      });
      setHistory((prevHistory) => [
        { question: question.trim(), answer: 'Error' },
        ...prevHistory,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(
    (entry) => filter === 'all' || entry.answer.toLowerCase() === filter
  );

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
          sx={{ bgcolor: '#fff', borderRadius: 1, mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
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

          <Button
            variant="outlined"
            onClick={() => setOpenModal(true)}
            sx={{
              borderColor: '#fff',
              color: '#fff',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: 8,
              '&:hover': {
                bgcolor: '#fff',
                color: '#000',
              },
            }}
          >
            Ver Historial
          </Button>
        </Box>

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
                <CardMedia component="img" image={answer.image} alt={answer.answer} />
              </Card>
            )}

            {answer.message && (
              <Typography color="error" sx={{ mt: 2 }}>
                {answer.message}
              </Typography>
            )}
          </motion.div>
        )}

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 500,
              bgcolor: '#121212',
              color: '#fff',
              borderRadius: 4,
              boxShadow: 24,
              p: 4,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Historial
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {['all', 'yes', 'no', 'maybe'].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'contained' : 'outlined'}
                  onClick={() => setFilter(type)}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    bgcolor: filter === type ? getColor(type) : '#fff',
                    color: '#000',
                    borderColor: getColor(type),
                    '&:hover': {
                      bgcolor: getColor(type),
                      color: '#000',
                    },
                  }}
                >
                  {type === 'all' ? 'Todas' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </Box>

            {filteredHistory.map((entry, index) => (
              <Card
                key={index}
                sx={{
                  bgcolor: '#1e1e1e',
                  color: '#fff',
                  mb: 2,
                  p: 2,
                  borderLeft: `8px solid ${getColor(entry.answer)}`,
                }}
              >
                <Typography variant="body1">
                  <strong>Pregunta:</strong> {entry.question}
                </Typography>
                <Typography variant="body2">
                  <strong>Respuesta:</strong> {entry.answer.toUpperCase()}
                </Typography>
              </Card>
            ))}
          </Box>
        </Modal>
      </Container>
    </ThemeProvider>
  );
}