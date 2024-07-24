const AuditLog = require('../models/auditLog');
const ParameterSetting = require('../models/parameterSetting');
const AppError = require('../utils/AppError');

exports.getParameterSettings = async (req, res, next) => {
  const macId = req.macAddress;

  try {
    let parameterSetting = await ParameterSetting.findOne({ where: { macId } });

    if (!parameterSetting) {
      res.status(200).json({ message: "No Parameter Setting Found." })
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

    if (!parameterSetting) {
      // Ensure only Administrators and Managers can update default settings
      if (companyName !== undefined || departmentName !== undefined || equipmentName !== undefined || equipmentSerialNo !== undefined || defaultComment !== undefined) {
        if (req.user.userLevel !== 'Administrator' && req.user.userLevel !== 'Manager' && req.user.userLevel !== 'SuperAdmin') {
          return next(new AppError('You do not have permission to update default settings', 403));
        }
      }

      let parameterSetting = await ParameterSetting.create({ macId, ...req.body });

      if (companyName !== undefined || departmentName !== undefined || equipmentName !== undefined || equipmentSerialNo !== undefined || defaultComment !== undefined) {
        if (req.user.userLevel !== 'Administrator' && req.user.userLevel !== 'Manager' && req.user.userLevel !== 'SuperAdmin') {
          return next(new AppError('You do not have permission to update default settings', 403));
        }

        // Update default parameters
        if (companyName !== undefined) {
          await AuditLog.create({
            userId: req.user.id,
            macId: req.macAddress,
            log: `Company Name Changed`,
            oldValue: "-",
            newValue: companyName,
            category: 'general'
          });
        }
        if (departmentName !== undefined) {
          await AuditLog.create({
            userId: req.user.id,
            macId: req.macAddress,
            log: `Department Name Changed`,
            oldValue: "-",
            newValue: departmentName,
            category: 'general'
          });
        }
        if (equipmentName !== undefined) {
          await AuditLog.create({
            userId: req.user.id,
            macId: req.macAddress,
            log: `Eqipment Name Changed`,
            oldValue: "-",
            newValue: equipmentName,
            category: 'general'
          });
        }
        if (equipmentSerialNo !== undefined) {
          await AuditLog.create({
            userId: req.user.id,
            macId: req.macAddress,
            log: `Equipment Serial No. Changed`,
            oldValue: "-",
            newValue: equipmentSerialNo,
            category: 'general'
          });
        }
      }

      // Update print parameters (any user can update)
      if (areaName !== undefined) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Area Name Changed`,
          oldValue: "-",
          newValue: areaName,
          category: 'general'
        });
      }
      if (batchName !== undefined) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Batch Name Changed`,
          oldValue: "-",
          newValue: batchName,
          category: 'general'
        });
      }
      if (batchNo !== undefined) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Batch No. Changed`,
          oldValue: "-",
          newValue: batchNo,
          category: 'general'
        });
      }
      if (leakTestStatus !== undefined) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Leak Test Changed`,
          oldValue: "-",
          newValue: leakTestStatus,
          category: 'general'
        });
      }

      return res.status(200).json({
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
    } else {

      let oldParameterSetting = { ...parameterSetting.dataValues };

      // Ensure only Administrators and Managers can update default settings
      if (companyName !== undefined || departmentName !== undefined || equipmentName !== undefined || equipmentSerialNo !== undefined || defaultComment !== undefined) {
        if (req.user.userLevel !== 'Administrator' && req.user.userLevel !== 'Manager' && req.user.userLevel !== 'SuperAdmin') {
          return next(new AppError('You do not have permission to update default settings', 403));
        }

        // Update default parameters
        if (companyName !== undefined && companyName !== parameterSetting.companyName) {
          parameterSetting.companyName = companyName;
        }
        if (departmentName !== undefined && departmentName !== parameterSetting.departmentName) {
          parameterSetting.departmentName = departmentName;
        }
        if (equipmentName !== undefined && equipmentName !== parameterSetting.equipmentName) {
          parameterSetting.equipmentName = equipmentName;
        }
        if (equipmentSerialNo !== undefined && equipmentSerialNo !== parameterSetting.equipmentSerialNo) {
          parameterSetting.equipmentSerialNo = equipmentSerialNo;
        }
        if (defaultComment !== undefined) parameterSetting.defaultComment = defaultComment;
      }

      // Update print parameters (any user can update)
      if (areaName !== undefined && areaName !== parameterSetting.areaName) {
        parameterSetting.areaName = areaName;
      }
      if (batchName !== undefined && batchName !== parameterSetting.batchName) {
        parameterSetting.batchName = batchName;
      }
      if (batchNo !== undefined && batchNo !== parameterSetting.batchNo) {
        parameterSetting.batchNo = batchNo;
      }
      if (leakTestStatus !== undefined && leakTestStatus !== parameterSetting.leakTestStatus) {
        parameterSetting.leakTestStatus = leakTestStatus;
      }
      if (printComment !== undefined) parameterSetting.printComment = printComment;

      await parameterSetting.save();

      if (companyName !== undefined || departmentName !== undefined || equipmentName !== undefined || equipmentSerialNo !== undefined || defaultComment !== undefined) {
        if (req.user.userLevel !== 'Administrator' || req.user.userLevel !== 'Manager' && req.user.userLevel !== 'SuperAdmin') {
          if (companyName !== undefined && companyName !== oldParameterSetting.companyName) {
            await AuditLog.create({
              userId: req.user.id,
              macId: req.macAddress,
              log: `Company Name Changed`,
              oldValue: oldParameterSetting.companyName,
              newValue: companyName,
              category: 'general'
            });
          }
          if (departmentName !== undefined && departmentName !== oldParameterSetting.departmentName) {
            await AuditLog.create({
              userId: req.user.id,
              macId: req.macAddress,
              log: `Department Name Changed`,
              oldValue: oldParameterSetting.departmentName,
              newValue: departmentName,
              category: 'general'
            });
          }
          if (equipmentName !== undefined && equipmentName !== oldParameterSetting.equipmentName) {
            await AuditLog.create({
              userId: req.user.id,
              macId: req.macAddress,
              log: `Eqipment Name Changed`,
              oldValue: oldParameterSetting.equipmentName,
              newValue: equipmentName,
              category: 'general'
            });
          }
          if (equipmentSerialNo !== undefined && equipmentSerialNo !== oldParameterSetting.equipmentSerialNo) {
            await AuditLog.create({
              userId: req.user.id,
              macId: req.macAddress,
              log: `Equipment Serial No. Changed`,
              oldValue: oldParameterSetting.equipmentSerialNo,
              newValue: equipmentSerialNo,
              category: 'general'
            });
          }
        }
      }
      if (areaName !== undefined && areaName !== oldParameterSetting.areaName) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Area Name Changed`,
          oldValue: oldParameterSetting.areaName,
          newValue: areaName,
          category: 'general'
        });
      }
      if (batchName !== undefined && batchName !== oldParameterSetting.batchName) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Batch Name Changed`,
          oldValue: oldParameterSetting.batchName,
          newValue: batchName,
          category: 'general'
        });
      }
      if (batchNo !== undefined && batchNo !== oldParameterSetting.batchNo) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Batch No. Changed`,
          oldValue: oldParameterSetting.batchNo,
          newValue: batchNo,
          category: 'general'
        });
      }
      if (leakTestStatus !== undefined && leakTestStatus !== oldParameterSetting.leakTestStatus) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Leak Test Changed`,
          oldValue: oldParameterSetting.leakTestStatus,
          newValue: leakTestStatus,
          category: 'general'
        });
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
    }

  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
