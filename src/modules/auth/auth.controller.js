import AuthService from "./auth.service.js";
import prisma from "../../common/database/prismaClient.js";

class AuthController {
async login(req, res) {
  const { identifier, password, role } = req.body;
  if (!identifier || !password || !role) {
    return res
      .status(400)
      .json({ message: "Identifier, password, and role are required" });
  }

  const user = await AuthService.getUserByRole(identifier, password, role);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = AuthService.generateTokens(
    user.user_id,
    user.role
  );
  await AuthService.saveRefreshToken(user.user_id, refreshToken);

  // Include role-specific data
  let roleData = null;
  if (role === "Admin") {
    const adminData = await prisma.admin.findUnique({
      where: { user_id: user.user_id },
      include: {
        generalAnnouncements: true,
      },
    });
    roleData = adminData;
  }

  res.json({
    success: true,
    accessToken,
    refreshToken,
    message: "Login successful",
    user: {
      userId: user.user_id,
      role: user.role,
      ...(role === "Admin" ? { admin: roleData } : {}),
    },
  });
}


  async logout(req, res) {
    const user = req.user;
    await AuthService.deleteRefreshToken(user.user_id);

    res.json({
      success: true,
      message: "Logout successful",
    });
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const { decoded, expired } = AuthService.verifyToken(
      refreshToken,
      process.env.REFRESH_SECRET || "your-refresh-secret-key"
    );
    if (expired || !decoded)
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.userId },
    });
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ message: "Invalid refresh token" });

    const { accessToken, refreshToken: newRefreshToken } =
      AuthService.generateTokens(user.user_id, user.role);
    await AuthService.saveRefreshToken(user.user_id, newRefreshToken);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      message: "Token refreshed",
    });
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    try {
      const result = await AuthService.changePassword(user.user_id, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || 'Failed to change password' });
    }
  }
}

export default new AuthController();