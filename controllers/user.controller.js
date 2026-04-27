// src/controllers/user.controller.js
import * as userService from "../services/user.service.js";
import { logAudit } from "../utils/auditLogger.js";

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);

    await logAudit({
      userId: req.user.id,
      action: "USER_CREATED",
      module: "User Mgmt",
      entityType: "User",
      objectAffected: newUser.id,
      newValue: newUser.toJSON(),
      status: "Success",
      remarks: `Created user ${newUser.username}`,
      req,
    }).catch(() => { });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const existingUser = await userService.getUserById(req.params.id);
    if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });
    const oldUserData = existingUser.toJSON();

    const updatedUser = await userService.updateUser(req.params.id, req.body);

    await logAudit({
      userId: req.user?.id || null,
      action: "USER_UPDATED",
      module: "User Mgmt",
      entityType: "User",
      objectAffected: updatedUser.id,
      oldValue: oldUserData,
      newValue: updatedUser.toJSON(),
      status: "Success",
      remarks: `Updated user ${updatedUser.username}`,
      req,
    }).catch(() => { }); // ✅ safe — logging failure won't break the API

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });


    await logAudit({
      userId: req.params.id,
      action: "USER_DELETED",
      module: "User Mgmt",
      entityType: "User",
      objectAffected: req.params.id,
      oldValue: user.toJSON(),
      status: "Success",
      remarks: `Deleted user ${user.username}`,
      req,
    }).catch(() => {
      console.error("Audit log failed for user deletion");
    });

    await userService.deleteUser(req.params.id);


    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};