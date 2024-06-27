const MasterParameter = require('../models/masterParameter');
const AppError = require('../utils/AppError');

exports.getMasterParameter = async (req, res, next) => {
  const macId = req.macAddress;

  try {
    let masterParameter = await MasterParameter.findOne({ where: { macId } });

    if (!masterParameter) {
      masterParameter = await MasterParameter.create({ macId });
    }

    res.status(200).json(masterParameter);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.updateMasterParameter = async (req, res, next) => {
  const macId = req.macAddress;
  const { gasketPressure, gasketPressureAlarmTime, glovePressureAlarmTime, pressurePursuingPressure, pressurePursuingTime, glovePressure, valveOnTime, valveOffTime,
    motor1, motor2, motor3, valve1, valve2
   } = req.body;

  try {
    const masterParameter = await MasterParameter.findOne({ where: { macId } });

    if (!masterParameter) return next(new AppError('Master parameter not found', 404));

    // Update master parameters
    if (gasketPressure !== undefined) masterParameter.gasketPressure = gasketPressure;
    if (gasketPressureAlarmTime !== undefined) masterParameter.gasketPressureAlarmTime = gasketPressureAlarmTime;
    if (glovePressureAlarmTime !== undefined) masterParameter.glovePressureAlarmTime = glovePressureAlarmTime;
    if (pressurePursuingPressure !== undefined) masterParameter.pressurePursuingPressure = pressurePursuingPressure;
    if (pressurePursuingTime !== undefined) masterParameter.pressurePursuingTime = pressurePursuingTime;
    if (glovePressure !== undefined) masterParameter.glovePressure = glovePressure;
    if (valveOnTime !== undefined) masterParameter.valveOnTime = valveOnTime;
    if (valveOffTime !== undefined) masterParameter.valveOffTime = valveOffTime;
    if (motor1 !== undefined) masterParameter.motor1 = motor1;
    if (motor2 !== undefined) masterParameter.motor2 = motor2;
    if (motor3 !== undefined) masterParameter.motor3 = motor3;
    if (valve1 !== undefined) masterParameter.valve1 = valve1;
    if (valve2 !== undefined) masterParameter.valve2 = valve2;

    await masterParameter.save();

    res.status(200).json(masterParameter);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
