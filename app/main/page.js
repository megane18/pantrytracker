'use client';

import { Box, Stack, Typography, Button, Modal, TextField, IconButton, Tooltip, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Snackbar } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShareIcon from '@mui/icons-material/Share';
import { collection, query, getDocs, setDoc, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "reactfire";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Autocomplete from '@mui/material/Autocomplete';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

const categories = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Other'];
const commonItems = ['Milk', 'Bread', 'Eggs', 'Bananas', 'Tomatoes'];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [userName, setUserName] = useState("Your Name");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowSearch = () => setShowSearch(prev => !prev);
  const handleOpenRecipeModal = () => setShowRecipeModal(true);
  const handleCloseRecipeModal = () => setShowRecipeModal(false);
  const handleOpenShoppingListModal = () => setShowShoppingListModal(true);
  const handleCloseShoppingListModal = () => setShowShoppingListModal(false);

  const handleSearch = () => {
    if (itemName.trim()) {
      const foundItem = pantry.find(item => item.name.toLowerCase() === itemName.trim().toLowerCase());
      if (foundItem) {
        setModalMessage(`Item "${itemName}" found in the pantry. Current quantity: ${foundItem.quantity}`);
        setHighlightedItem(foundItem.name);
        setTimeout(() => setHighlightedItem(null), 5000);
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
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
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

  const handleSignOut = () => {
    window.location.href = '/';
  };

  const handleAddShoppingItem = () => {
    if (newShoppingItem.trim()) {
      const category = categorizeItem(newShoppingItem.trim());
      setShoppingList([...shoppingList, { name: newShoppingItem.trim(), category, checked: false }]);
      setNewShoppingItem('');
    }
  };

  const handleRemoveShoppingItem = (index) => {
    const updatedList = shoppingList.filter((_, i) => i !== index);
    setShoppingList(updatedList);
  };

  const handleToggleShoppingItem = (index) => {
    const updatedList = shoppingList.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updatedList);
  };

  const categorizeItem = (itemName) => {
    // This is a simple categorization. You might want to expand this logic.
    if (['apple', 'banana', 'tomato', 'lettuce'].some(word => itemName.toLowerCase().includes(word))) return 'Produce';
    if (['milk', 'cheese', 'yogurt'].some(word => itemName.toLowerCase().includes(word))) return 'Dairy';
    if (['chicken', 'beef', 'pork'].some(word => itemName.toLowerCase().includes(word))) return 'Meat';
    return 'Other';
  };

  const suggestLowStockItems = () => {
    return pantry.filter(item => item.quantity <= 1).map(item => item.name);
  };

  const handleQuickAdd = (item) => {
    const category = categorizeItem(item);
    setShoppingList([...shoppingList, { name: item, category, checked: false }]);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(shoppingList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setShoppingList(items);
  };

  const handleShareList = () => {
    const listText = shoppingList.map(item => item.name).join(', ');
    navigator.clipboard.writeText(listText).then(() => {
      setSnackbarMessage('Shopping list copied to clipboard!');
      setSnackbarOpen(true);
    });
  };
  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" sx={{ bgcolor: '#f0f4f0' }}>
      {/* Header */}
      <Box
        width="100%"
        bgcolor="#388E3C"
        padding={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <IconButton onClick={() => setMenuOpen(true)}>
          <MenuIcon sx={{ color: '#fff' }} />
        </IconButton>
        <Typography variant="h6" color="#fff" fontWeight="bold">
          Pantry Tracker
        </Typography>
        <Box width={48} /> {/* Placeholder for balance */}
      </Box>

      {/* Main Content */}
      <Box flex="1" display="flex" flexDirection="column" alignItems="center" padding={2} overflow="auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 600 }}
        >
          <Stack spacing={3} alignItems="center" width="100%">
            {/* Search and Add Buttons */}
            <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" width="100%">
                <TextField
                  variant="outlined"
                  placeholder="Search item..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Tooltip title="Search">
                  <IconButton onClick={handleSearch} sx={{ bgcolor: '#4CAF50', color: '#fff', '&:hover': { bgcolor: '#45a049' } }}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  onClick={handleOpenAddModal}
                  sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                >
                  Add Item
                </Button>
              </Stack>
            </Paper>

            {/* Search Results Highlight */}
            <AnimatePresence>
              {highlightedItem && (
                <MotionBox
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  sx={{ mt: 2, p: 2, border: '1px solid #4CAF50', borderRadius: 1, bgcolor: '#e8f5e9', width: '100%' }}
                >
                  <Typography variant="body1">Found: {highlightedItem}</Typography>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Pantry Items Display */}
            <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
              <Typography variant="h6" gutterBottom>Your Pantry</Typography>
              {pantry.length === 0 ? (
                <Typography variant="body1">Your pantry is empty</Typography>
              ) : (
                <Stack spacing={2} width="100%">
                  {pantry.map((item) => (
                    <Paper
                      key={item.name}
                      elevation={2}
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: highlightedItem === item.name ? '#c8e6c9' : '#fff',
                        transition: 'background-color 0.3s',
                      }}
                    >
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Box display="flex" alignItems="center">
                        <IconButton onClick={() => handleUpdateQuantity(item.name, -1)} disabled={item.quantity <= 0} size="small">
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                        <IconButton onClick={() => handleUpdateQuantity(item.name, 1)} size="small">
                          <AddIcon />
                        </IconButton>
                        <IconButton onClick={() => handleRemoveItem(item.name)} size="small" sx={{ color: '#f44336' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </motion.div>
      </Box>


<AnimatePresence>
  {menuOpen && (
    <MotionBox
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.3 }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '250px',
        height: '100%',
        bgcolor: '#388E3C',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        boxShadow: 3,
      }}
    >
      <IconButton
        sx={{ alignSelf: 'flex-end', color: '#fff' }}
        onClick={() => setMenuOpen(false)}
      >
        <CloseIcon />
      </IconButton>
      <Stack spacing={9} sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AccountCircleIcon sx={{ fontSize: 60 }} />
          <Typography variant="h6">{userName}</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<RestaurantIcon />}
          onClick={handleOpenRecipeModal}
          sx={{ bgcolor: '#66BB6A', '&:hover': { bgcolor: '#4CAF50' } }}
        >
          Recipe Ideas
        </Button>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={handleOpenShoppingListModal}
          sx={{ bgcolor: '#66BB6A', '&:hover': { bgcolor: '#4CAF50' } }}
        >
          Shopping List
        </Button>
      </Stack>
      <Button
        variant="contained"
        onClick={handleSignOut}
        sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' }, mt: 'auto' }}
      >
        Sign Out
      </Button>
    </MotionBox>
  )}
</AnimatePresence>


      {/* Modals */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            {modalMessage}
          </Typography>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Modal open={showAddModal} onClose={handleCloseAddModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Add New Item
          </Typography>
          <TextField
            fullWidth
            label="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
          <Button
            onClick={handleAddItem}
            variant="contained"
            sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
          >
            Add Item
          </Button>
        </Box>
      </Modal>
      <Modal open={showRecipeModal} onClose={handleCloseRecipeModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Simple Recipe Ideas
          </Typography>
          <Typography variant="body1" paragraph>
            1. Quick Pasta: Cook pasta, toss with olive oil, garlic, and any vegetables from your pantry.
          </Typography>
          <Typography variant="body1" paragraph>
            2. Stir Fry: Combine rice, mixed vegetables, and protein of choice with soy sauce.
          </Typography>
          <Typography variant="body1" paragraph>
            3. Soup: Simmer broth with canned beans, vegetables, and herbs for a comforting meal.
          </Typography>
          <Button
            onClick={handleCloseRecipeModal}
            variant="contained"
            sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      
     {/* Shopping List Modal */}
     <Modal open={showShoppingListModal} onClose={handleCloseShoppingListModal}>
        <Box sx={{ ...modalStyle, width: 600, maxHeight: '80vh', overflow: 'auto' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Shopping List
          </Typography>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              label="Add item"
              value={newShoppingItem}
              onChange={(e) => setNewShoppingItem(e.target.value)}
            />
            <Button
              onClick={handleAddShoppingItem}
              variant="contained"
              sx={{ ml: 1, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              Add
            </Button>
          </Box>
          <Typography variant="subtitle1" gutterBottom>Quick Add:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {commonItems.map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => handleQuickAdd(item)}
                sx={{ bgcolor: '#81C784', '&:hover': { bgcolor: '#66BB6A' } }}
              />
            ))}
          </Box>
          <Typography variant="subtitle1" gutterBottom>Suggested (Low Stock):</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {suggestLowStockItems().map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => handleQuickAdd(item)}
                sx={{ bgcolor: '#FFB74D', '&:hover': { bgcolor: '#FFA726' } }}
              />
            ))}
          </Box>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="shoppingList">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {shoppingList.map((item, index) => (
                    <Draggable key={item.name} draggableId={item.name} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ bgcolor: item.checked ? '#E8F5E9' : 'inherit' }}
                        >
                          <ListItemText 
                            primary={item.name} 
                            secondary={item.category}
                            sx={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleToggleShoppingItem(index)}>
                              {item.checked ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleRemoveShoppingItem(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              onClick={handleCloseShoppingListModal}
              variant="contained"
              sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              Close
            </Button>
            <Button
              onClick={handleShareList}
              variant="contained"
              startIcon={<ShareIcon />}
              sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1E88E5' } }}
            >
              Share List
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

        </Box>

  );
}
  