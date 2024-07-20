const Permission = require('../models/permission');
const sequelize = require('../sequelize');
const AppError = require('../utils/AppError');

exports.getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.updatePermissions = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const updates = req.body;

    for (let update of updates) {
      const { module, superAdmin, administrator, manager, supervisor, operator } = update;

      await Permission.update({
        superAdmin,
        administrator,
        manager,
        supervisor,
        operator
      }, {
        where: { module },
        transaction
      });
    }

    await transaction.commit();

    const updatedPermissions = await Permission.findAll();

    res.status(200).json(updatedPermissions);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};