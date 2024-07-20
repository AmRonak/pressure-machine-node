const Permission = require('../models/permission');

const seedPermissions = async () => {
  try {
    await Permission.bulkCreate([
      {
        module: 'Test Mode',
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'RECIPE SETTING',
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'SET PARAMETER',
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'USER PROFILE',
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'Reports',
        administrator: true,
        manager: false,
        supervisor: false,
        operator: false,
      },
      {
        module: 'USER MANAGEMENT',
        administrator: true,
        manager: true,
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
