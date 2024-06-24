// controllers/parameterSettingController.js
const ParameterSetting = require('../models/parameterSetting');
const AppError = require('../utils/AppError');

exports.getParameterSettings = async (req, res, next) => {
  const macId = req.macAddress;

  try {
    let parameterSetting = await ParameterSetting.findOne({ where: { macId } });

    if (!parameterSetting) {
      parameterSetting = await ParameterSetting.create({ macId });
    }

    res.status(200).json({
      macId: parameterSetting.macId,
      defaultParameter: {
        companyName: parameterSetting.companyName,
        departmentName: parameterSetting.departmentName,
        equipmentName: parameterSetting.equipmentName,
        equipmentSerialNo: parameterSetting.equipmentSerialNo,
        comment: parameterSetting.defaultComment
      },
      printParameter: {
        areaName: parameterSetting.areaName,
        batchName: parameterSetting.batchName,
        batchNo: parameterSetting.batchNo,
        leakTestStatus: parameterSetting.leakTestStatus,
        comment: parameterSetting.printComment
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.updateParameterSettings = async (req, res, next) => {
  const macId = req.macAddress;
  const { companyName, departmentName, equipmentName, equipmentSerialNo, defaultComment, areaName, batchName, batchNo, leakTestStatus, printComment } = req.body;

  try {
    const parameterSetting = await ParameterSetting.findOne({ where: { macId } });

    if (!parameterSetting) return next(new AppError('Parameter setting not found', 404));

    // Ensure only Administrators and Managers can update default settings
    if (companyName !== undefined || departmentName !== undefined || equipmentName !== undefined || equipmentSerialNo !== undefined || defaultComment !== undefined) {
      if (req.user.userLevel !== 'Administrator' && req.user.userLevel !== 'Manager') {
        return next(new AppError('You do not have permission to update default settings', 403));
      }

      // Update default parameters
      if (companyName !== undefined) parameterSetting.companyName = companyName;
      if (departmentName !== undefined) parameterSetting.departmentName = departmentName;
      if (equipmentName !== undefined) parameterSetting.equipmentName = equipmentName;
      if (equipmentSerialNo !== undefined) parameterSetting.equipmentSerialNo = equipmentSerialNo;
      if (defaultComment !== undefined) parameterSetting.defaultComment = defaultComment;
    }

    // Update print parameters (any user can update)
    if (areaName !== undefined) parameterSetting.areaName = areaName;
    if (batchName !== undefined) parameterSetting.batchName = batchName;
    if (batchNo !== undefined) parameterSetting.batchNo = batchNo;
    if (leakTestStatus !== undefined) parameterSetting.leakTestStatus = leakTestStatus;
    if (printComment !== undefined) parameterSetting.printComment = printComment;

    await parameterSetting.save();

    res.status(200).json(parameterSetting);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
