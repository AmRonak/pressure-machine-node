const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
// const getmac = require('getmac');
const Permission = require('../models/permission');
const { daysUntilExpiration, isPasswordExpired } = require('../utils/helper');
const ParameterSetting = require('../models/parameterSetting');

exports.createAdmin = async () => {
  try {
    await User.create({
      username: "admin",
      password: "Admin@123",
      userLevel: "Administrator",
      "pin": 1234,
      "attempts": 5,
      "autoLogoutTime": 20,
      "passwordExpiry": 1,
      "expiryDaysNotification": 10,
      "autoUnblockTime": 15
    });
  } catch (err) {
    console.log("err", err);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comments, pin, active } = req.body;

    const newUser = await User.create({
      username,
      password: password,
      userLevel,
      attempts,
      autoLogoutTime,
      passwordExpiry,
      expiryDaysNotification,
      autoUnblockTime,
      comments,
      pin,
      active
    });

    if (req.user.userLevel !== 'SuperAdmin') {
      await AuditLog.create({
        userId: req.user.id,
        // macId: req.macAddress,
        log: `User Created `,
        oldValue: null,
        newValue: null,
        category: 'General',
        updatedUserId: newUser.id,
        comment: comments ? comments : "",
        userName: req?.user?.username,
        userLevel: req?.user?.userLevel
      });
    }

    res.status(201).json(newUser);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.loginUser = async (req, res) => {
  const { username, password, pin } = req.body;
  // const macAddress = getmac.default();

  const user = await User.findOne({ where: { username } });

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  // if (user.isLoggedIn) {
  //   return res.status(400).json({ message: 'You are already logged in on another device or browser.' });
  // }

  const now = new Date();

  if (!user.active) {
    if (!user.blockTime) {
      return res.status(403).json({ message: `Account is blocked.` });
    }

    const blockTime = new Date(user.blockTime);
    const unblockTime = new Date(blockTime.getTime() + user.autoUnblockTime * 60000);

    if (now < unblockTime) {
      return res.status(403).json({ message: `Account is blocked. Try again after ${unblockTime}` });
    } else {
      // Unblock user
      user.active = true;
      user.blockTime = null;
      user.failedAttempts = 0;
      await user.save();
    }
  }

  let validPassword = false;
  if (password) {
    validPassword = password === user.password;
  } else if (pin) {
    validPassword = pin === user.pin;
  }
  if (!validPassword) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= user.attempts) {
      user.active = false;
      user.blockTime = now;
      await user.save();
      if (user.userLevel !== 'SuperAdmin') {
        await AuditLog.create({
          userId: user.id,
          // macId: macAddress,
          log: `User is blocked due to max login attempts`,
          oldValue: null,
          newValue: null,
          category: 'General',
          userName: user.username,
          userLevel: user.userLevel
        });
      }
      return res.status(403).json({ error: 'User is blocked due to max login attempts' });
    }

    await user.save();
    if (user.userLevel !== 'SuperAdmin') {
      await AuditLog.create({
        userId: user.id,
        // macId: macAddress,
        log: `Incorrect password. Login attempts left: ${user.attempts - user.failedAttempts}`,
        oldValue: null,
        newValue: null,
        category: 'General',
        userName: user.username,
        userLevel: user.userLevel
      });
    }
    return res.status(400).json({ message: `Incorrect password. Login attempts left: ${user.attempts - user.failedAttempts}` });
  }

  const [parameterSetting] = await ParameterSetting.findAll();

  if (!parameterSetting) {
    return res.status(400).json({ message: 'System Serial (Equipment Serial) number not found.' });
  }

  // Reset failed attempts on successful login
  user.failedAttempts = 0;
  // user.isLoggedIn = true;
  await user.save();
  if (user.userLevel !== 'SuperAdmin') {
    await AuditLog.create({
      userId: user.id,
      // macId: macAddress,
      log: `${user.username} Logged In to System ${parameterSetting?.equipmentSerialNo}`,
      oldValue: null,
      newValue: null,
      category: 'General',
      userName: user.username,
      userLevel: user.userLevel,
      comment: 'User Logged into System'
    });
  }
  const token = jwt.sign({ id: user.id, userLevel: user.userLevel, username: user.username }, process.env.JWT_SECRET, { expiresIn: `90d` });

  res.json({ token });
};

exports.currentProfile = async (req, res) => {
  try {
    const user = req.user;

    const currentUser = await User.findByPk(user.id);

    const passwordExpiryDays = currentUser.passwordExpiry;
    const passwordExpiryDate = new Date(currentUser.passwordUpdatedAt);
    // const passwordExpiryDate = new Date(passwordLastUpdated);
    passwordExpiryDate.setDate(passwordExpiryDate.getDate() + passwordExpiryDays);

    const currentDate = new Date();
    const daysLeft = Math.floor((passwordExpiryDate - currentDate) / (1000 * 60 * 60 * 24));
    let tokenExpirationInfo = null;
    let passwordExpired = false;

    const expired = isPasswordExpired(currentUser.passwordUpdatedAt, currentUser.passwordExpiry);

    if (expired) {
      passwordExpired = true;
    } else if (daysLeft <= 2 && daysLeft >= 0) {
      tokenExpirationInfo = `Password will expire in ${daysLeft} days`;
    }

    // let tokenExpirationInfo = null;
    // if (daysLeft <= currentUser.expiryDaysNotification) {
    //   tokenExpirationInfo = `Token will expire in ${daysLeft} days`;
    // }

    const permissions = await Permission.findAll();

    const [parameterSetting] = await ParameterSetting.findAll();

    // Filter modules based on user role
    const accessibleModules = permissions.filter(permission => permission[user.userLevel.toLowerCase()]);

    res.status(200).json({
      message: 'This is a secured profile route',
      user: {
        ...req.user,
        pin: currentUser.pin,
        permissions: accessibleModules.map(module => module.id),
        tokenExpirationInfo,
        passwordExpired,
        autoLogoutTime: currentUser.autoLogoutTime,
        systemSerialNumber: parameterSetting?.equipmentSerialNo ? parameterSetting.equipmentSerialNo : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.listUsers = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.userLevel !== "SuperAdmin") {
      whereClause["userLevel"] = {
        [Op.ne]: "SuperAdmin" // Exclude SuperAdmin userLevel
      }
    }

    const users = await User.findAll({
      where: whereClause
    });

    res.json(users);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.blockUser = async (req, res, next) => {
  const { ids, action } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Invalid or missing user IDs', 400));
    }

    if (!['block', 'unblock'].includes(action)) {
      return next(new AppError('Invalid action. Must be "block" or "unblock"', 400));
    }

    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });

    if (users.length === 0) {
      return next(new AppError('No users found with the provided IDs', 404));
    }

    const updates = users.map(async user => {
      if (action === 'block') {
        if (!user.active) {
          throw new AppError(`User ${user.username} is already blocked`, 400);
        }
        user.active = false;
      } else if (action === 'unblock') {
        if (user.active) {
          throw new AppError(`User ${user.username} is not blocked`, 400);
        }
        user.active = true;
        user.blockTime = null;
      }
      if (req.user.userLevel !== 'SuperAdmin') {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `User ${action === 'block' ? "Blocked" : "Unblocked"}`,
          oldValue: null,
          newValue: null,
          category: 'General',
          updatedUserId: user.id,
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }
      return user.save();
    });

    await Promise.all(updates);

    res.status(200).json({
      message: `Users have been ${action}ed successfully`,
      ids: ids
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comments, pin } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new AppError('User not found', 400));

    let oldUserData = { ...user.dataValues };

    if (username !== undefined && username !== user.username) {
      user.username = username;
    }

    if (password !== undefined && password !== user.password) {
      user.password = password;
      user.passwordUpdatedAt = new Date();
    }

    if (userLevel !== undefined && userLevel !== user.userLevel) {
      user.userLevel = userLevel;
    }

    if (attempts !== undefined && attempts !== user.attempts) {
      user.attempts = attempts;
    }

    if (autoLogoutTime !== undefined && autoLogoutTime !== user.autoLogoutTime) {
      user.autoLogoutTime = autoLogoutTime;
    }

    if (passwordExpiry !== undefined && passwordExpiry !== user.passwordExpiry) {
      user.passwordExpiry = passwordExpiry;
    }

    if (expiryDaysNotification !== undefined && expiryDaysNotification !== user.expiryDaysNotification) {
      user.expiryDaysNotification = expiryDaysNotification;
    }

    if (autoUnblockTime !== undefined && autoUnblockTime !== user.autoUnblockTime) {
      user.autoUnblockTime = autoUnblockTime;
    }

    if (pin !== undefined && parseInt(pin) !== user.pin) {
      user.pin = pin;
    }

    if (comments !== undefined && comments !== user.comments) {
      user.comments = comments;
    }

    await user.save();

    if (req.user.userLevel !== 'SuperAdmin') {

      if (username !== undefined && username !== oldUserData.username) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Username Changed`,
          oldValue: oldUserData.username,
          newValue: username,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (password !== undefined && password !== oldUserData.password) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Password Changed`,
          oldValue: null,
          newValue: null,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (userLevel !== undefined && userLevel !== oldUserData.userLevel) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `User Level Changed`,
          oldValue: oldUserData.userLevel,
          newValue: userLevel,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (attempts !== undefined && parseInt(attempts) !== oldUserData.attempts) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Attempts Changed`,
          oldValue: oldUserData.attempts,
          newValue: attempts,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (autoLogoutTime !== undefined && parseInt(autoLogoutTime) !== oldUserData.autoLogoutTime) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Auto Logout Time Changed`,
          oldValue: oldUserData.autoLogoutTime,
          newValue: autoLogoutTime,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (passwordExpiry !== undefined && parseInt(passwordExpiry) !== oldUserData.passwordExpiry) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Password Expiry Changed`,
          oldValue: oldUserData.passwordExpiry,
          newValue: passwordExpiry,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (expiryDaysNotification !== undefined && parseInt(expiryDaysNotification) !== oldUserData.expiryDaysNotification) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Expiry Days Notification Changed`,
          oldValue: oldUserData.expiryDaysNotification,
          newValue: expiryDaysNotification,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (autoUnblockTime !== undefined && parseInt(autoUnblockTime) !== oldUserData.autoUnblockTime) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Auto Unblock Time Changed`,
          oldValue: oldUserData.autoUnblockTime,
          newValue: autoUnblockTime,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

      if (pin !== undefined && pin !== oldUserData.pin) {
        await AuditLog.create({
          userId: req.user.id,
          // macId: req.macAddress,
          log: `Pin Changed`,
          oldValue: null,
          newValue: null,
          category: 'General',
          updatedUserId: oldUserData.id,
          comment: comments ? comments : "",
          userName: req?.user?.username,
          userLevel: req?.user?.userLevel
        });
      }

    }

    res.status(200).json(user);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isMatch = currentPassword === user.password;
    if (!isMatch) {
      return next(new AppError('Old password does not match', 401));
    }

    user.password = newPassword;
    user.passwordUpdatedAt = new Date();
    await user.save();
    if (req.user.userLevel !== 'SuperAdmin') {
      await AuditLog.create({
        userId: req.user.id,
        // macId: req.macAddress,
        log: `Password Changed`,
        oldValue: null,
        newValue: null,
        category: 'General',
        updatedUserId: user.id,
        userName: req?.user?.username,
        userLevel: req?.user?.userLevel
      });
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getUserById = async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError('User ID missing', 400));
  }

  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new AppError('User not found', 400));

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getAllUsernames = async (req, res, next) => {
  try {
    let users = await User.findAll({
      where: {
        userLevel: {
          [Op.ne]: "SuperAdmin"
        }
      },
      attributes: ['username']
    });

    users = users.map(result => result.username);

    res.status(200).json(users);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.logoutUserLogging = async (req, res, next) => {
  if (req.user.userLevel !== 'SuperAdmin') {
    await AuditLog.create({
      userId: req.user.id,
      // macId: req.macAddress,
      log: `User Logged out `,
      oldValue: null,
      newValue: null,
      category: 'General',
      updatedUserId: newUser.id || null,
      comment: comments ? comments : "",
      userName: req?.user?.username,
      userLevel: req?.user?.userLevel
    });
  }
}

// exports.logoutUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);

//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.isLoggedIn = false;
//     await user.save();

//     res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
