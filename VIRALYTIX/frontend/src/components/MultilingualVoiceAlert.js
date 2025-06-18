import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Paper, Select, MenuItem, FormControl, InputLabel, Slider, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SpeedIcon from '@mui/icons-material/Speed';

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'sw-KE', name: 'Swahili' }
];

const MultilingualVoiceAlert = ({ 
  text, 
  language = 'en-US', 
  enabled = true,
  autoPlay = false,
  showControls = true,
  onLanguageChange = null,
  variant = 'standard' // 'standard', 'compact', or 'minimal'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Initialize speech synthesis and get available voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSpeechSupported(false);
      console.warn('Speech Synthesis not supported in this browser.');
      return;
    }

    // Get available voices
    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
      
      // Try to find a voice for the selected language
      const matchingVoice = voices.find(voice => voice.lang === selectedLanguage);
      if (matchingVoice) {
        setSelectedVoice(matchingVoice);
      }
    };

    // Chrome loads voices asynchronously
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
  }, [selectedLanguage]);

  // Handle auto-play
  useEffect(() => {
    if (autoPlay && enabled && text) {
      speakText();
    }
  }, [text, autoPlay, enabled, selectedLanguage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update language when prop changes
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Speak the text
  const speakText = useCallback(() => {
    if (!enabled || !text || !isSpeechSupported) return;

    const synth = window.speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.volume = volume;
    utterance.rate = rate;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };
    
    synth.speak(utterance);
  }, [text, selectedLanguage, volume, rate, selectedVoice, enabled, isSpeechSupported]);

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    
    // Find a matching voice for the new language
    const matchingVoice = availableVoices.find(voice => voice.lang === newLanguage);
    if (matchingVoice) {
      setSelectedVoice(matchingVoice);
    }
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  // If speech synthesis is not supported or component is disabled, return null
  if (!isSpeechSupported || !enabled) {
    return null;
  }

  // If no controls should be shown, return null
  if (!showControls) {
    return null;
  }

  // Render minimal variant (just play/stop button)
  if (variant === 'minimal') {
    return (
      <IconButton 
        color="primary" 
        onClick={isPlaying ? stopSpeaking : speakText}
        disabled={!text}
        size="small"
      >
        {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
      </IconButton>
    );
  }

  // Render compact variant (play/stop button with language selector)
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          color="primary" 
          onClick={isPlaying ? stopSpeaking : speakText}
          disabled={!text}
        >
          {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            displayEmpty
            size="small"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  // Render standard variant (full controls)
  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Multilingual Voice Alert
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={selectedLanguage}
            label="Language"
            onChange={handleLanguageChange}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VolumeUpIcon sx={{ mr: 1 }} />
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.1}
            onChange={(e, newValue) => setVolume(newValue)}
            aria-labelledby="volume-slider"
            sx={{ mx: 1 }}
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {Math.round(volume * 100)}%
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SpeedIcon sx={{ mr: 1 }} />
          <Slider
            value={rate}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(e, newValue) => setRate(newValue)}
            aria-labelledby="rate-slider"
            sx={{ mx: 1 }}
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {rate}x
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={isPlaying ? "Stop" : "Play"}>
          <IconButton 
            color="primary" 
            onClick={isPlaying ? stopSpeaking : speakText}
            disabled={!text}
            size="large"
          >
            {isPlaying ? <StopIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default MultilingualVoiceAlert;
