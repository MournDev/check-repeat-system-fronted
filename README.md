# 论文查重管理系统前端

## 项目简介

论文查重管理系统是一个基于 Vue 3 + Element Plus 构建的现代化前端应用，用于管理和处理学术论文的查重、审核和管理流程。系统支持学生、教师和管理员三个角色，提供完整的论文提交、审核、统计分析等功能。

## 功能特点

### 学生端功能
- 📄 论文提交与管理
- 🔍 查重结果查看
- 📊 个人能力评估
- 📅 重要时间节点提醒
- 👨‍🏫 导师信息与联系方式
- 📈 论文进度跟踪

### 教师端功能
- 📋 论文审核工作台
- 📊 审核统计分析
- 👥 学生管理
- 📁 论文下载与管理
- ⚡ 快速操作面板
- 📈 审核效率统计

### 管理员端功能
- 🏫 学校概览
- 👥 用户管理
- 📄 论文库管理
- 📋 报告管理
- ⚙️ 系统配置
- 📊 数据统计

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **时间处理**: Day.js
- **图表库**: ECharts
- **CSS 预处理器**: SCSS
- **图标库**: Element Plus Icons

## 快速开始

### 环境要求
- Node.js 14.0+
- npm 6.0+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
check-repeat-frontend/
├── public/             # 静态资源
├── src/
│   ├── api/            # API 接口调用
│   ├── assets/         # 静态资源
│   ├── components/     # 通用组件
│   ├── composables/    # 组合式函数
│   ├── directives/     # 自定义指令
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env                # 环境变量
├── .env.development    # 开发环境变量
├── eslintrc.json       # ESLint 配置
├── index.html          # HTML 模板
├── package.json        # 项目配置
└── vite.config.js      # Vite 配置
```

## 核心功能模块

### 1. 认证系统
- 登录/注册/密码重置
- 角色权限管理
- 状态持久化

### 2. 论文管理
- 论文提交与版本管理
- 查重结果分析
- 论文状态跟踪

### 3. 审核流程
- 教师审核工作台
- 审核状态管理
- 反馈与修改建议

### 4. 数据统计
- 个人能力评估
- 相似度趋势分析
- 专业对比分析

### 5. 消息通知
- 实时消息提醒
- 通知中心
- 消息历史记录

## 响应式设计

系统采用响应式设计，适配以下设备：
- 桌面端 (1200px+)
- 平板端 (768px-1199px)
- 移动端 (320px-767px)

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 组合式 API 最佳实践
- 组件命名使用 PascalCase
- 变量命名使用 camelCase

### 提交规范
- 提交信息使用英文
- 提交信息格式：`type(scope): subject`
- 类型包括：feat, fix, docs, style, refactor, test, chore

## 部署说明

### 生产环境部署
1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到 web 服务器
3. 配置 Nginx 或其他 web 服务器

### 环境变量配置

在 `.env` 文件中配置以下环境变量：

```
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=论文查重管理系统
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 问题反馈：[GitHub Issues](https://github.com/yourusername/check-repeat-frontend/issues)

---

**备注**：本项目仅为前端部分，需要配合后端 API 服务使用。