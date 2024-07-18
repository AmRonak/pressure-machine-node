const Permission = require('../models/permission');
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
  try {
    const { module, superAdmin, administrator, manager, supervisor, operator } = req.body;

    let permission = await Permission.findOne({ where: { module } });

    if (!permission) {
      return next(new AppError(`${module} - Module Not Found`, 404));
    } else {
      permission.superAdmin = superAdmin !== undefined ? superAdmin : permission.superAdmin;
      permission.administrator = administrator !== undefined ? administrator : permission.administrator;
      permission.manager = manager !== undefined ? manager : permission.manager;
      permission.supervisor = supervisor !== undefined ? supervisor : permission.supervisor;
      permission.operator = operator !== undefined ? operator : permission.operator;
      await permission.save();
    }

    res.status(200).json(permission);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};