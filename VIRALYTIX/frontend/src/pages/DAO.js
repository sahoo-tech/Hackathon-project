import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { blockchainService } from '../services/api';

const DAO = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openNewProposal, setOpenNewProposal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newExpiresIn, setNewExpiresIn] = useState(7);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteType, setVoteType] = useState('for');
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blockchainService.getDAOProposals();
      setProposals(data);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to fetch proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleOpenNewProposal = () => {
    setOpenNewProposal(true);
  };

  const handleCloseNewProposal = () => {
    setOpenNewProposal(false);
    setNewTitle('');
    setNewDescription('');
    setNewExpiresIn(7);
  };

  const handleSubmitNewProposal = async () => {
    if (!newTitle || !newDescription) {
      setSnackbar({ open: true, message: 'Title and description are required.', severity: 'error' });
      return;
    }
    try {
      await blockchainService.createDAOProposal({
        title: newTitle,
        description: newDescription,
        expires_in_days: newExpiresIn
      });
      setSnackbar({ open: true, message: 'Proposal submitted successfully.', severity: 'success' });
      handleCloseNewProposal();
      fetchProposals();
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setSnackbar({ open: true, message: 'Failed to submit proposal.', severity: 'error' });
    }
  };

  const handleVote = async (proposalId, vote) => {
    setVoteLoading(true);
    setSelectedProposalId(proposalId);
    setVoteType(vote);
    try {
      await blockchainService.voteOnProposal({
        proposal_id: proposalId,
        vote: vote
      });
      setSnackbar({ open: true, message: 'Vote recorded.', severity: 'success' });
      fetchProposals();
    } catch (err) {
      console.error('Error voting on proposal:', err);
      setSnackbar({ open: true, message: 'Failed to record vote.', severity: 'error' });
    } finally {
      setVoteLoading(false);
      setSelectedProposalId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Open Science DAO
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Decentralized Autonomous Organization for Labs
        </Typography>
        <Typography variant="body1" paragraph>
          Participate in decentralized governance, submit and vote on proposals, earn tokens, and view immutable records.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpenNewProposal}>
              Submit New Proposal
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={fetchProposals} disabled={loading}>
              Refresh Proposals
            </Button>
          </Grid>
        </Grid>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {proposals.length === 0 && (
              <Typography>No proposals found.</Typography>
            )}
            {proposals.map((proposal) => (
              <ListItem key={proposal.id} divider>
                <ListItemText
                  primary={proposal.title}
                  secondary={`Status: ${proposal.status} | Expires: ${new Date(proposal.expires_at).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <Chip label={`For: ${proposal.votes_for}`} color="success" size="small" sx={{ mr: 1 }} />
                  <Chip label={`Against: ${proposal.votes_against}`} color="error" size="small" sx={{ mr: 1 }} />
                  <Chip label={`Abstain: ${proposal.votes_abstain}`} color="default" size="small" sx={{ mr: 1 }} />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ThumbUpIcon />}
                    disabled={voteLoading && selectedProposalId === proposal.id && voteType === 'for'}
                    onClick={() => handleVote(proposal.id, 'for')}
                    sx={{ mr: 1 }}
                  >
                    For
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<ThumbDownIcon />}
                    disabled={voteLoading && selectedProposalId === proposal.id && voteType === 'against'}
                    onClick={() => handleVote(proposal.id, 'against')}
                    sx={{ mr: 1 }}
                  >
                    Against
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<HowToVoteIcon />}
                    disabled={voteLoading && selectedProposalId === proposal.id && voteType === 'abstain'}
                    onClick={() => handleVote(proposal.id, 'abstain')}
                  >
                    Abstain
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* New Proposal Dialog */}
      <Dialog open={openNewProposal} onClose={handleCloseNewProposal} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Proposal</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="expires-in-label">Expires In (days)</InputLabel>
            <Select
              labelId="expires-in-label"
              value={newExpiresIn}
              label="Expires In (days)"
              onChange={(e) => setNewExpiresIn(e.target.value)}
            >
              {[7, 14, 21, 30].map((days) => (
                <MenuItem key={days} value={days}>{days}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewProposal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitNewProposal}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DAO;
