exports.up = (pgm) => {
  // Add IP and location columns to page_views
  pgm.addColumns('page_views', {
    ip_address: { type: 'text' },
    city: { type: 'text' },
    region: { type: 'text' },
    country: { type: 'text' },
  });

  // Create index on IP for faster lookups
  pgm.createIndex('page_views', 'ip_address');
};

exports.down = (pgm) => {
  // Rollback: remove the columns
  pgm.dropColumns('page_views', ['ip_address', 'city', 'region', 'country']);
  pgm.dropIndex('page_views', 'ip_address');
};
