const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comment, pin, active } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
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
    res.status(201).json(newUser);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const now = new Date();

  if (!user.active) {
    const blockTime = new Date(user.blockTime);
    const unblockTime = new Date(blockTime.getTime() + user.autoUnblockTime * 60000);
    console.log("unblockTime ", unblockTime);
    if (now < unblockTime) {
      return res.status(403).json({ message: `Account is blocked. Try again after ${unblockTime}` });
    } else {
      // Unblock user
      user.active = true;
      user.failedAttempts = 0;
      await user.save();
    }
  }

  const validPassword = await bcrypt.compare(password, user.password);

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

  const token = jwt.sign({ id: user.id, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
};

exports.currentProfile = (req, res) => {
  res.json({
      message: 'This is a secured profile route',
      user: req.user
  });
} 

exports.forgetPassword = async (req, res, next) => {
  try {
    const { username, newPassword, pin } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return next(new AppError('User not found', 400));
    if (user.pin !== parseInt(pin)) return next(new AppError('Invalid PIN', 400));

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send('Password updated successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { username, password, userLevel, attempts, autoLogoutTime, passwordExpiry, expiryDaysNotification, autoUnblockTime, comment, pin, active } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new AppError('User not found', 400));

    user.username = username || user.username;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.userLevel = userLevel || user.userLevel;
    user.attempts = attempts || user.attempts;
    user.autoLogoutTime = autoLogoutTime || user.autoLogoutTime;
    user.passwordExpiry = passwordExpiry || user.passwordExpiry;
    user.expiryDaysNotification = expiryDaysNotification || user.expiryDaysNotification;
    user.autoUnblockTime = autoUnblockTime || user.autoUnblockTime;
    user.comment = comment || user.comment;
    user.pin = pin || user.pin;
    user.active = active !== undefined ? active : user.active;

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
