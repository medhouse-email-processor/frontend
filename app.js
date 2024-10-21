const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all routes and serve the index.html file for any route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server on port 9000
app.listen(9000, () => {
    console.log('Server is running on port 9000');
});
