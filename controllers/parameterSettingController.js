// controllers/parameterSettingController.js
const AuditLog = require('../models/auditLog');
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
      if (companyName !== undefined && companyName !== parameterSetting.companyName) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Company Name Changed`,
          oldValue: parameterSetting.companyName,
          newValue: companyName,
          category: 'general'
        });
        parameterSetting.companyName = companyName;
      } 
      if (departmentName !== undefined && departmentName !== parameterSetting.departmentName) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Department Name Changed`,
          oldValue: parameterSetting.departmentName,
          newValue: departmentName,
          category: 'general'
        });
        parameterSetting.departmentName = departmentName;
      } 
      if (equipmentName !== undefined && equipmentName !== parameterSetting.equipmentName) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Eqipment Name Changed`,
          oldValue: parameterSetting.equipmentName,
          newValue: equipmentName,
          category: 'general'
        });
        parameterSetting.equipmentName = equipmentName;
      } 
      if (equipmentSerialNo !== undefined && equipmentSerialNo !== parameterSetting.equipmentSerialNo) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Equipment Serial No. Changed`,
          oldValue: parameterSetting.equipmentSerialNo,
          newValue: equipmentSerialNo,
          category: 'general'
        });
        parameterSetting.equipmentSerialNo = equipmentSerialNo;
      } 
      if (defaultComment !== undefined) parameterSetting.defaultComment = defaultComment;
    }

    // Update print parameters (any user can update)
    if (areaName !== undefined && areaName !== parameterSetting.areaName) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Area Name Changed`,
        oldValue: parameterSetting.areaName,
        newValue: areaName,
        category: 'general'
      });
      parameterSetting.areaName = areaName;
    } 
    if (batchName !== undefined && batchName !== parameterSetting.batchName) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Batch Name Changed`,
        oldValue: parameterSetting.batchName,
        newValue: batchName,
        category: 'general'
      });
      parameterSetting.batchName = batchName;
    } 
    if (batchNo !== undefined && batchNo !== parameterSetting.batchNo) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Batch No. Changed`,
        oldValue: parameterSetting.batchNo,
        newValue: batchNo,
        category: 'general'
      });
      parameterSetting.batchNo = batchNo;
    } 
    if (leakTestStatus !== undefined && leakTestStatus !== parameterSetting.leakTestStatus) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Leak Test Changed`,
        oldValue: parameterSetting.leakTestStatus,
        newValue: leakTestStatus,
        category: 'general'
      });
      parameterSetting.leakTestStatus = leakTestStatus;
    } 
    if (printComment !== undefined) parameterSetting.printComment = printComment;

    await parameterSetting.save();

    res.status(200).json(parameterSetting);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
