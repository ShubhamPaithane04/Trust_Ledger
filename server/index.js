const path = require('path');
const { createApp } = require('./app');

const dataFile = process.env.LEDGER_FILE || path.join(__dirname, 'data', 'ledger.json');
const { app } = createApp({ dataFile });

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Ledger stored in ${dataFile}`);
});
