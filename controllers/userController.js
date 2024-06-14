const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const recipeSetting = require('../models/recipeSetting');

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

    // Create new record with default Recipe Settings
    await recipeSetting.create({
      userId: newUser.id
    });

    res.status(201).json(newUser);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.loginUser = async (req, res) => {
  const { username, password, pin } = req.body;

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
      return res.status(403).json({ error: 'Account Blocked. Too many failed login attempts' });
    }

    await user.save();
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Reset failed attempts on successful login
  user.failedAttempts = 0;
  await user.save();

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
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new AppError('User not found', 400));

    const { block } = req.query;
    if (block !== 'true' && block !== 'false') {
      return next(new AppError('Invalid block parameter', 400));
    }

    const isBlocked = user.blockTime !== null;

    if (block === 'true' && isBlocked) {
      return next(new AppError('User is already blocked', 400));
    }

    if (block === 'false' && !isBlocked) {
      return next(new AppError('User is not blocked', 400));
    }

    user.active = block === 'false';
    user.blockTime = block === 'true' ? new Date() : null;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
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

    user.username = username || user.username;
    if (password) {
      user.password = password
    }
    user.userLevel = userLevel || user.userLevel;
    user.attempts = attempts || user.attempts;
    user.autoLogoutTime = autoLogoutTime || user.autoLogoutTime;
    user.passwordExpiry = passwordExpiry || user.passwordExpiry;
    user.expiryDaysNotification = expiryDaysNotification || user.expiryDaysNotification;
    user.autoUnblockTime = autoUnblockTime || user.autoUnblockTime;
    user.comment = comment || user.comment;
    user.pin = pin || user.pin;

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

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};


