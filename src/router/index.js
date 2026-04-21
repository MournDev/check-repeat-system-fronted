import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";

// 静态路由（无需权限）
const constantRoutes = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/login/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/login",
    name: "LoginAlias",
    component: () => import("@/views/login/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/login/Register.vue"),
  },
  {
    path: "/reset",
    name: "Reset",
    component: () => import("@/views/login/Reset.vue"),
    meta: { title: "重置密码" },
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("@/views/EmailVerified.vue"),
    meta: {
      title: "邮箱验证",
      requiresAuth: false, // 验证页面通常不需要登录
    },
  },
];

// 权限路由（需登录+对应角色）
const asyncRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true, title: "仪表盘" },
    children: [
      // 学生路由
      {
        path: "student",
        name: "StudentDashboard",
        component: () => import("@/views/student/Dashboard.vue"),
        meta: { role: "STUDENT", title: "学生仪表盘" },
      },
      {
        path: "admin",
        name: "AdminDashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { role: "ADMIN", title: "管理员仪表盘" },
      },
    ],
  },

  // 消息中心（独立路由，所有角色都可以访问）
  {
    path: "/message-center",
    name: "MessageCenter",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true, title: "消息中心" },
    children: [
      {
        path: "",
        component: () => import("@/components/MessageCenter.vue"),
        meta: { title: "消息中心" },
      },
    ],
  },

  // 学生核心路由
  {
    path: "/student",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true, roles: ["STUDENT", "TEACHER", "ADMIN"] },
    children: [
      {
        path: "paper-submit",
        name: "PaperSubmit",
        component: () => import("@/views/student/PaperSubmit.vue"),
        meta: { title: "论文提交" },
      },
      {        path: "paper-details",        name: "PaperDetail",        component: () => import("@/views/student/PaperDetail.vue"),        meta: { title: "论文详情", roles: ["STUDENT", "TEACHER", "ADMIN"] },      },
      {
        path: "my-papers",
        name: "MyPapers",
        component: () => import("@/views/student/MyPapers.vue"),
        meta: { title: "我的论文" },
      },
      {
        path: "advisor-interaction",
        name: "AdvisorInteraction",
        component: () => import("@/views/student/AdvisorInteraction.vue"),
        meta: { title: "导师互动" },
      },
      {
        path: "settings",
        name: "StudentSettings",
        component: () => import("@/views/student/Settings.vue"),
        meta: { title: "个人设置" },
      },
      {
        path: "help-center",
        name: "HelpCenter",
        component: () => import("@/views/student/HelpCenter.vue"),
        meta: { title: "帮助中心" },
      },
      // 查重功能相关路由
      {
        path: "check-monitor/:paperId",
        name: "CheckMonitor",
        component: () => import("@/views/student/CheckMonitor.vue"),
        meta: { title: "查重监控" },
      },
      {
        path: "plagiarism-report/:paperId",
        name: "PlagiarismReport",
        component: () => import("@/views/student/PlagiarismReport.vue"),
        meta: { title: "查重报告" },
      },
      {
        path: "check-history",
        name: "CheckHistoryList",
        component: () => import("@/views/student/CheckHistoryList.vue"),
        meta: { title: "查重历史" },
      },
      {
        path: "check-history/:paperId",
        name: "CheckHistory",
        component: () => import("@/views/student/CheckHistory.vue"),
        meta: { title: "查重历史详情" },
      },
      {
        path: "student-check-with-websocket",
        name: "StudentCheckWithWebSocket",
        component: () => import("@/views/student/StudentCheckWithWebSocket.vue"),
        meta: { title: "查重管理" },
      },
      {
        path: "academic-integrity",
        name: "AcademicIntegrity",
        component: () => import("@/views/student/AcademicIntegrity.vue"),
        meta: { title: "学术诚信" },
      },
      {
        path: "test-paper-list",
        name: "TestPaperList",
        component: () => import("@/views/student/TestPaperList.vue"),
        meta: { title: "论文列表测试" },
      },
    ],
  },
  // 教师核心路由
  {
    path: "/teacher",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true, role: "TEACHER" },
    children: [
      {
        path: "", // 空路径，作为默认页面
        name: "TeacherDashboard",
        component: () => import("@/views/teacher/Dashboard.vue"),
        meta: { title: "教师仪表盘" },
      },
      {
        path: "student-list",
        name: "StudentList",
        component: () => import("@/views/teacher/StudentList.vue"),
        meta: { title: "学生管理" },
      },
      {
        path: "paper-review",
        name: "PaperReview",
        component: () => import("@/views/teacher/PaperReview.vue"),
        meta: { title: "论文审核" },
        children: [
          {
            path: '',
            name: 'PendingReviewsDefault',
            component: () => import('@/views/teacher/PendingReviews.vue'),
            meta: { title: '待审核论文' }
          },
          {
            path: "pending",
            name: "PendingReviews",
            component: () => import("@/views/teacher/PendingReviews.vue"),
            meta: { title: "待审核论文" },
          },
          {
            path: "audit-records",
            name: "AuditRecords",
            component: () => import("@/views/teacher/AuditRecords.vue"),
            meta: { title: "审核记录" },
          }
        ],
      },
      {
        path: "data-statistics",
        name: "DataStatistics",
        component: () => import("@/views/teacher/DataStatistics.vue"),
        meta: { title: "数据统计" },
      },
      {
        path: "profile",
        name: "TeacherProfile",
        component: () => import("@/views/teacher/Profile.vue"),
        meta: { title: "个人中心" },
      },
      {
        path: "review-templates",
        name: "ReviewTemplates",
        component: () => import("@/views/teacher/ReviewTemplates.vue"),
        meta: { title: "审核意见模板" },
      },
      {
        path: "student-groups",
        name: "StudentGroups",
        component: () => import("@/views/teacher/StudentGroups.vue"),
        meta: { title: "学生分组管理" },
      },
      {
        path: "similarity-thresholds",
        name: "SimilarityThresholds",
        component: () => import("@/views/teacher/SimilarityThreshold.vue"),
        meta: { title: "相似度阈值设置" },
      },
      {
        path: "review-workflow",
        name: "ReviewWorkflow",
        component: () => import("@/views/teacher/ReviewWorkflow.vue"),
        meta: { title: "审核工作流配置" },
      },
      {
        path: "chat-center",
        name: "ChatCenter",
        component: () => import("@/views/teacher/ChatCenter.vue"),
        meta: { title: "在线聊天" },
      },
    ],
  },
  // 管理员核心路由
  {
    path: "/admin",
    component: () => import("@/components/layout/MainLayout.vue"),
    meta: { requiresAuth: true, role: "ADMIN" },
    children: [
      {
        path: "user-management",
        name: "UserManagement",
        component: () => import("@/views/admin/UserManagement.vue"),
        meta: { title: "用户管理" },
      },
      {
        path: "paper-assignment",
        name: "PaperAssignment",
        component: () => import("@/views/admin/PaperAssignment.vue"),
        meta: { title: "论文分配" },
      },
      {
        path: "paper-assignment/manual",
        name: "ManualPaperAssignment",
        component: () => import("@/views/admin/ManualPaperAssignment.vue"),
        meta: { title: "手动论文分配" },
      },
      {
        path: "paper-assignment/auto",
        name: "AutoPaperAssignment",
        component: () => import("@/views/admin/AutoPaperAssignment.vue"),
        meta: { title: "自动论文分配" },
      },
      {
        path: "paper-assignment/history",
        name: "PaperAssignmentHistory",
        component: () => import("@/views/admin/PaperAssignmentHistory.vue"),
        meta: { title: "论文分配记录" },
      },
      {
        path: "system-config",
        name: "SystemConfig",
        component: () => import("@/views/admin/SystemConfig.vue"),
        meta: { title: "系统配置" },
      },
      {
        path: "log-center",
        name: "LogCenter",
        component: () => import("@/views/admin/LogCenter.vue"),
        meta: { title: "日志中心" },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("@/views/admin/Settings.vue"),
        meta: { title: "个人设置" },
      },
      {
        path: "school-overview",
        name: "SchoolOverview",
        component: () => import("@/views/admin/SchoolOverview.vue"),
        meta: { title: "全校数据概览" },
      },
      {
        path: "paper-library",
        name: "PaperLibrary",
        component: () => import("@/views/admin/PaperLibrary.vue"),
        meta: { title: "论文库管理" },
      },
      {
        path: "report-management",
        name: "ReportManagement",
        component: () => import("@/views/admin/ReportManagement.vue"),
        meta: { title: "报告管理" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/common/NotFound.vue"),
    meta: { title: "页面不存在" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes],
});

// 路由守卫：验证登录状态和角色权限
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - ${import.meta.env.VITE_SYSTEM_NAME}`;
  const token = Cookies.get('token') || localStorage.getItem('token');
  const role = Cookies.get('role') || localStorage.getItem('role');

  // 不需要认证的路径
  const noAuthPaths = ['/login', '/register', '/reset', '/verify-email', '/404', '/401'];
  
  if (noAuthPaths.includes(to.path)) {
    next();
    return;
  }

  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false;
  const allowedRoles = to.meta.roles || (to.meta.role ? [to.meta.role] : []);

  if (requiresAuth) {
    // 未登录，跳转到登录页
    if (!token) {
      next("/login");
      ElMessage.warning("请先登录");
    } else {
      // 验证角色权限
      if (allowedRoles.length > 0) {
        if (allowedRoles.includes(role)) {
          next();
        } else {
          ElMessage.error("无权限访问该页面");
          next(from.path); // 回退到之前的页面
        }
      } else {
        // 如果当前路由没有权限配置，认为有权限
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
