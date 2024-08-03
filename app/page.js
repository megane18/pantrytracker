'use client';
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, Fade, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import { collection, query, getDocs, setDoc, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "reactfire";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Autocomplete from '@mui/material/Autocomplete';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const MotionBox = motion(Box);

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const firestore = useFirestore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [itemName, setItemName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedItem, setHighlightedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleShowSearch = () => {
    setShowSearch(prev => !prev);
  };

  const handleSearch = () => {
    if (itemName.trim()) {
      const foundItem = pantry.find(item => item.name.toLowerCase() === itemName.trim().toLowerCase());
      if (foundItem) {
        setModalMessage(`Item "${itemName}" found in the pantry. Current quantity: ${foundItem.quantity}`);
        setHighlightedItem(foundItem.name);
        setTimeout(() => setHighlightedItem(null), 5000); // Remove highlight after 5 seconds
      } else {
        setModalMessage(`Item "${itemName}" not found in the pantry.`);
      }
      handleOpenModal();
    }
  };

  const handleAddItem = async () => {
    try {
      if (newItemName.trim() === '') {
        setModalMessage('Item name cannot be empty.');
        handleOpenModal();
        return;
      }
      const itemRef = doc(firestore, 'pantry', newItemName.trim().toLowerCase());
      await setDoc(itemRef, {
        quantity: newItemQuantity,
        lastUpdated: new Date()
      });
      setModalMessage(`Added new item "${newItemName.trim()}" with quantity ${newItemQuantity}`);
      handleCloseAddModal();
      handleOpenModal();
      fetchItems();
      setNewItemName('');
      setNewItemQuantity(1);
    } catch (error) {
      console.error("Error adding item:", error);
      setModalMessage("An error occurred while adding the item");
      handleOpenModal();
    }
  };

  const handleUpdateQuantity = async (itemName, change) => {
    try {
      const itemRef = doc(firestore, 'pantry', itemName);
      await updateDoc(itemRef, {
        quantity: increment(change),
        lastUpdated: new Date()
      });
      setModalMessage(`Updated ${itemName} quantity. New quantity: ${pantry.find(item => item.name === itemName).quantity + change}`);
      handleOpenModal();
      fetchItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
      setModalMessage("An error occurred while updating the quantity");
      handleOpenModal();
    }
  };

  const fetchItems = useCallback(async () => {
    setError(null);
    try {
      const pantryCollection = collection(firestore, 'pantry');
      const pantrySnapshot = await getDocs(pantryCollection);
      const pantryItems = pantrySnapshot.docs.map(doc => ({
        name: doc.id,
        quantity: doc.data().quantity || 0,
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      }));
      setPantry(pantryItems);
      setSuggestions(pantryItems.map(item => item.name));
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items. Please try again later.");
    }
  }, [firestore]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteDoc(doc(firestore, 'pantry', itemId));
      setModalMessage("Item removed successfully!");
      handleOpenModal();
      fetchItems();
    } catch (error) {
      console.error("Error removing item:", error);
      setModalMessage("An error occurred while removing the item");
      handleOpenModal();
    }
  };

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" flexDirection="column" alignItems="center" gap={2}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="contained"
          onClick={handleShowSearch}
          startIcon={<SearchIcon />}
          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
        >
          {showSearch ? "Hide Search" : "Show Search"}
        </Button>
        <Button
          variant="contained"
          onClick={handleOpenAddModal}
          startIcon={<AddIcon />}
          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' }, ml: 2 }}
        >
          Add Item
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stack width='100%' direction={'row'} spacing={2} justifyContent="center">
              <Autocomplete
                freeSolo
                options={suggestions}
                renderInput={(params) => <TextField {...params} label="Search Item" variant="outlined" />}
                value={itemName}
                onInputChange={(event, newValue) => {
                  setItemName(newValue);
                }}
                style={{ width: 300 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#4CAF59' } }}
              >
                Search
              </Button>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <Modal
        open={showAddModal}
        onClose={handleCloseAddModal}
        aria-labelledby="add-item-modal-title"
        aria-describedby="add-item-modal-description"
      >
        <Fade in={showAddModal}>
          <Box sx={modalStyle}>
            <Typography id="add-item-modal-title" variant="h6" component="h2" gutterBottom>
              Add New Item
            </Typography>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              margin="normal"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Number(e.target.value))}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button onClick={handleCloseAddModal}>Cancel</Button>
              <Button variant="contained" onClick={handleAddItem} sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}>
                Add Item
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Fade in={modalOpen}>
          <Box sx={modalStyle}>
            <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
              Pantry Update
            </Typography>
            <Typography id="modal-description" sx={{ mt: 2 }}>
              {modalMessage}
            </Typography>
            <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Close</Button>
          </Box>
        </Fade>
      </Modal>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <MotionBox 
        border="1px solid #356" 
        marginBottom="20px" 
        borderRadius="10px" 
        overflow="hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box width="800px" height="100px" bgcolor="#4CAF50" display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h5" color="#FFF" textAlign="center">
            Pantry Items
          </Typography>
        </Box>
        <Box width="800px" height="400px" overflow="auto">
          <Stack spacing={2} padding="20px">
            <AnimatePresence>
              {pantry.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    width="100%"
                    minHeight="110px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor={highlightedItem === item.name ? "#FFF59D" : "#f0f0f0"}
                    padding="0 20px"
                    borderRadius="8px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                  >
                    <Typography variant="h6" color="#333">
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body1" color="#666" marginRight="10px">
                        Quantity: {item.quantity}
                      </Typography>
                      <Tooltip title="Decrease quantity">
                        <IconButton
                          onClick={() => handleUpdateQuantity(item.name, -1)}
                          sx={{ color: '#f44336' }}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Increase quantity">
                        <IconButton
                          onClick={() => handleUpdateQuantity(item.name, 1)}
                          sx={{ color: '#4CAF50' }}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove item">
                        <IconButton
                          onClick={() => handleRemoveItem(item.name)}
                          sx={{ color: '#f44336' }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        </Box>
      </MotionBox>
    </Box>
  );
}