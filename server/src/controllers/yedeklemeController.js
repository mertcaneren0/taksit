const exportDatabase = async (req, res) => {
  return res.status(501).json({ message: 'Not Implemented: exportDatabase' });
};

const importDatabase = async (req, res) => {
  return res.status(501).json({ message: 'Not Implemented: importDatabase' });
};

module.exports = {
  exportDatabase,
  importDatabase,
};
