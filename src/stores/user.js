import { defineStore } from "pinia";
import Cookies from "js-cookie";
import { login as userLogin, register } from "@/api/login";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: Cookies.get("token") || "", // 从Cookie读取令牌（持久化）
    role: Cookies.get("role") || "", // 角色（STUDENT/TEACHER/ADMIN）
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || null, // 用户信息
    lastActivityTime: Date.now(), // 最后活动时间
  }),
  actions: {
    // 登录：存储令牌和角色
    async login(loginForm) {
      console.log("loginForm", loginForm);
      const { username, password } = loginForm;
      const res = await userLogin({
        username: username,
        password: password,
      });
      if (res.code !== 200) {
        throw new Error(res.message || '登录失败');
      }
      this.token = res.data.token;
      this.role = res.data.roleCode;
      // 保存完整的用户信息到 userInfo
      this.userInfo = {
        userId: res.data.userId, // ✅ 正确存储userId
        username: res.data.username,
        realName: res.data.realName,
        major: res.data.major,
        grade: res.data.grade,
        className: res.data.className,
        phone: res.data.phone,
        email: res.data.email,
        emailVerified: res.data.emailVerified,
        introduce: res.data.introduce,
        avatar: res.data.avatar,
        lastLoginTime: res.data.lastLoginTime,
        expireDate: res.data.expireDate,
        expireTime: res.data.expireTime,
      };
      // 持久化存储（防止页面刷新丢失）
      const isDevelopment = import.meta.env.DEV;
      Cookies.set("token", this.token, { 
        expires: 1, // 有效期1天
        secure: !isDevelopment, // 仅在非开发环境使用HTTPS
        sameSite: "strict" // 防止CSRF
      });
      Cookies.set("role", this.role, { 
        expires: 1,
        secure: !isDevelopment,
        sameSite: "strict"
      });
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
      this.lastActivityTime = Date.now();
      return res;
    },
    // 添加注册方法
    async register(registerForm) {
      try {
        console.log("Store: 调用注册API", registerForm);

        // 调用注册API
        const res = await register(registerForm);
        console.log("Store: 注册成功", res);
        return res;
      } catch (error) {
        console.error("Store: 注册失败", error);
        throw error;
      }
    },
    // 退出登录：清除状态和存储
    logout() {
      this.token = "";
      this.role = "";
      this.userInfo = null;
      this.lastActivityTime = 0;
      Cookies.remove("token");
      Cookies.remove("role");
      localStorage.removeItem("userInfo");
    },
    setUserInfo(userData) {
      this.userInfo = userData;
      // 同时更新本地存储
      localStorage.setItem("userInfo", JSON.stringify(userData));
    },
    updateAvatar(avatarRaw) {
      this.userInfo = { ...(this.userInfo || {}), avatar: avatarRaw };
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
    },
    restoreFromStorage() {
      try {
        const s = localStorage.getItem("userInfo");
        if (s) this.userInfo = JSON.parse(s);
        const t = Cookies.get("token");
        if (t) this.token = t;
        const r = Cookies.get("role");
        if (r) this.role = r;
        this.lastActivityTime = Date.now();
      } catch (e) {
        /* ignore */
      }
    },
    // 检查token是否有效
    isTokenValid() {
      if (!this.token) return false;
      // 检查活动时间，超过30分钟无活动需要重新验证
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      return now - this.lastActivityTime < thirtyMinutes;
    },
    // 更新活动时间
    updateActivityTime() {
      this.lastActivityTime = Date.now();
    },
    // 敏感操作验证
    async verifySensitiveOperation() {
      // 这里可以实现二次验证逻辑，如密码验证或短信验证
      // 目前简单实现为检查token有效性
      return this.isTokenValid();
    },
  },
  getters: {
    // 计算可访问的头像地址
    avatarSrc: (state) => {
      const raw = state.userInfo?.avatar || "";
      if (!raw || raw === "null" || raw === "undefined") return "";
      if (/^(https?:|\/\/|data:)/.test(raw)) return raw;
      const base = (
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
      ).replace(/\/$/, "");
      return base ? `${base}${raw.startsWith("/") ? "" : "/"}${raw}` : raw;
    },
    // 获取用户真实姓名
    realName: (state) => state.userInfo?.realName || "",

    // 获取用户名
    userName: (state) => state.userInfo?.username || "",

    // 判断是否已登录
    isLoggedIn: (state) => !!state.token,

    // 判断用户角色
    isStudent: (state) => state.role === "STUDENT",
    isTeacher: (state) => state.role === "TEACHER",
    isAdmin: (state) => state.role === "ADMIN",

    // 获取最后登录时间
    lastLoginTime: (state) => state.userInfo?.lastLoginTime || "",
  },
});
