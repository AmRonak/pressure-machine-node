const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const recipeSetting = require('../models/recipeSetting');
const getmac = require('getmac')

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comment, pin, active } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: password,
      userLevel,
      attempts,
      autoLogoutTime,
      passwordExpiry,
      expiryDaysNotification,
      autoUnblockTime,
      comment,
      pin,
      active
    });

    await AuditLog.create({
      userId: req.user.id,
      macId: req.macAddress,
      log: `User Created `,
      oldValue: null,
      newValue: null,
      category: 'general',
      updatedUserId: newUser.id
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.loginUser = async (req, res) => {
  const { username, password, pin } = req.body;
  const macAddress = getmac.default();

  const user = await User.findOne({ where: { username } });

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const now = new Date();

  if (!user.active) {
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
      await AuditLog.create({
        userId: user.id,
        macId: macAddress,
        log: `User is blocked due to max login attempts`,
        oldValue: null,
        newValue: null,
        category: 'general'
      });
      return res.status(403).json({ error: 'User is blocked due to max login attempts' });
    }

    await user.save();
    await AuditLog.create({
      userId: user.id,
      macId: macAddress,
      log: `Incorrect password. Login attempts left: ${user.attempts - user.failedAttempts}`,
      oldValue: null,
      newValue: null,
      category: 'general'
    });
    return res.status(400).json({ message: `Incorrect password. Login attempts left: ${user.attempts - user.failedAttempts}` });
  }

  // Reset failed attempts on successful login
  user.failedAttempts = 0;
  await user.save();
  await AuditLog.create({
    userId: user.id,
    macId: macAddress,
    log: `User Logged In`,
    oldValue: null,
    newValue: null,
    category: 'general'
  });
  const token = jwt.sign({ id: user.id, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: `${user.passwordExpiry}d` });

  res.json({ token });
};

exports.currentProfile = (req, res) => {
  res.json({
    message: 'This is a secured profile route',
    user: req.user
  });
}

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: req.user.id // Exclude current user
        }
      },
      attributes: { exclude: ['password'] } // Exclude password from results
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
        user.blockTime = new Date();
      } else if (action === 'unblock') {
        if (user.active) {
          throw new AppError(`User ${user.username} is not blocked`, 400);
        }
        user.active = true;
        user.blockTime = null;
      }

      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `User ${action === 'block' ? "Blocked" : "Unblocked"}`,
        oldValue: null,
        newValue: null,
        category: 'general',
        updatedUserId: user.id
      });
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
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comment, pin } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new AppError('User not found', 400));

    if (username !== undefined && username !== user.username) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Username Changed`,
        oldValue: user.username,
        newValue: username,
        category: 'general',
        updatedUserId: user.id
      });
      user.username = username;
    }
    
    if (password !== undefined && password !== user.password) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Password Changed`,
        oldValue: null,
        newValue: null,
        category: 'general',
        updatedUserId: user.id
      });
      user.password = password;
    }

    if (userLevel !== undefined && userLevel !== user.userLevel) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `User Level Changed`,
        oldValue: user.userLevel,
        newValue: userLevel,
        category: 'general',
        updatedUserId: user.id
      });
      user.userLevel = userLevel;
    }

    if (attempts !== undefined && attempts !== user.attempts) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Attempts Changed`,
        oldValue: user.attempts,
        newValue: attempts,
        category: 'general',
        updatedUserId: user.id
      });
      user.attempts = attempts;
    }

    if (autoLogoutTime !== undefined && autoLogoutTime !== user.autoLogoutTime) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Auto Logout Time Changed`,
        oldValue: user.autoLogoutTime,
        newValue: autoLogoutTime,
        category: 'general',
        updatedUserId: user.id
      });
      user.autoLogoutTime = autoLogoutTime;
    }

    if (passwordExpiry !== undefined && passwordExpiry !== user.passwordExpiry) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Password Expiry Changed`,
        oldValue: user.passwordExpiry,
        newValue: passwordExpiry,
        category: 'general',
        updatedUserId: user.id
      });
      user.passwordExpiry = passwordExpiry;
    }

    if (expiryDaysNotification !== undefined && expiryDaysNotification !== user.expiryDaysNotification) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Expiry Days Notification Changed`,
        oldValue: user.expiryDaysNotification,
        newValue: expiryDaysNotification,
        category: 'general',
        updatedUserId: user.id
      });
      user.expiryDaysNotification = expiryDaysNotification;
    }

    if (autoUnblockTime !== undefined && autoUnblockTime !== user.autoUnblockTime) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Auto Unblock Time Changed`,
        oldValue: user.autoUnblockTime,
        newValue: autoUnblockTime,
        category: 'general',
        updatedUserId: user.id
      });
      user.autoUnblockTime = autoUnblockTime;
    }

    if (pin !== undefined && parseInt(pin) !== user.pin) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Pin Changed`,
        oldValue: user.pin,
        newValue: pin,
        category: 'general',
        updatedUserId: user.id
      });
      user.pin = pin;
    }
    
    user.comment = comment || user.comment;

    await user.save();

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
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();
    await AuditLog.create({
      userId: req.user.id,
      macId: req.macAddress,
      log: `Password Changed`,
      oldValue: null,
      newValue: null,
      category: 'general',
      updatedUserId: user.id
    });

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

