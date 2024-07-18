const Permission = require('../models/permission');
const sequelize = require('../sequelize');

const seedPermissions = async () => {
  try {
    await Permission.bulkCreate([
      {
        module: 'User Module',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Parameter Settings',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Recipe Settings',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Master Settings',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Test Result',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Report',
        superAdmin: true,
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      }
    ]);
    console.log('Permissions seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Failed to seed permissions:', error);
    process.exit(1);
  }
};

seedPermissions();
