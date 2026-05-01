# 🔍 四川新数 IP 工具箱 — IP.SCXS.VIP

<p align="center">
  <strong>一站式网络诊断与隐私检测工具</strong>
</p>

<p align="center">
  <a href="https://ip.scxs.vip" target="_blank">🌐 在线体验</a>
  ·
  <a href="https://github.com/fireboy38/ip-check-tool/pkgs/container/ip-check-tool" target="_blank">📦 Docker 镜像</a>
  ·
  <a href="#部署">🚀 一键部署</a>
</p>

---

## ✨ 功能介绍

### 🌐 IP 地址检测
- **国内 IP 检测**：通过国内可达 API（ipip.net / pconline / ip-api.com）获取 IPv4 地址
- **海外 IP 检测**：通过国际 API（ipify / ip.sb / ipinfo.io）获取出口 IP
- **Google IP 检测**：通过 DNS-over-HTTPS 检测 Google 可达性
- **IPv6 检测**：检测当前网络是否支持 IPv6
- **逐个状态更新**：每个 API 独立超时与降级，不再卡在"检测中"
- **智能降级链**：国内 API 优先，失败自动切换海外 API

### 🔗 网络连通性测试
- TCPing 多节点延迟检测
- 实时连接状态显示
- 节点响应时间排名

### 🛡️ WebRTC 泄漏测试
- **6 个 STUN 服务器逐个扫描**，实时更新进度
- **ICE Candidate 类型解析**：区分 Host（本地）/ Server Reflexive（公网）/ Relay / Peer Reflexive
- **本地 IP 泄漏检测**：发现内网地址是否通过 WebRTC 暴露
- **公网 IP 泄漏检测**：检测 VPN/代理是否被 WebRTC 绕过
- **SDP 日志查看**（可折叠展开）
- **防护建议 Tab**：WebRTC 泄漏修复指南

### 🌍 DNS 泄漏测试
- **真实 DNS-over-HTTPS 查询**：Cloudflare / Google / 阿里 / 腾讯 / Quad9 / OpenDNS 六大解析器
- **6 个测试域名**：国内外各 3 个
- **解析器对比**：一键对比所有解析器解析同一域名
- **统计概览**：当前出口 IP / 成功率 / 平均响应时间
- **DNS 服务器信息**：主流公共 DNS 推荐
- **防护建议 Tab**：DNS 泄漏修复指南

### ⚡ 网速测试
- 下载速度测试
- 上传速度测试
- 延迟测试

### 🔧 高级工具
- **浏览器指纹检测**：8 大分类全面检测
  - 浏览器信息（UA / 引擎 / 版本）
  - 操作系统（平台 / 架构 / 设备类型）
  - 屏幕显示（分辨率 / 色深 / 像素比）
  - 硬件信息（CPU 核心 / GPU / 内存）
  - 网络信息（连接类型 / 下行速率 / RTT）
  - 语言时区（语言列表 / 时区偏移）
  - 安全隐私（Cookie / DNT / GPC / HTTPS）
  - 功能支持（WebGL / WebRTC / ServiceWorker 等）
- 每项支持一键复制，底部"复制全部信息"按钮

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS** | 样式系统 |
| **Webpack 5** | 构建工具 |
| **Framer Motion** | 动画效果 |
| **React Router 6** | 路由管理（HashRouter） |
| **Lucide React** | 图标库 |
| **Nginx** | 生产环境静态托管 |

---

## 🚀 部署

### Docker 部署（推荐）

```bash
# 拉取镜像
docker pull ghcr.io/fireboy38/ip-check-tool:main

# 运行容器
docker run -d -p 80:80 --name ip-check-tool ghcr.io/fireboy38/ip-check-tool:main
```

访问 `http://localhost` 即可使用。

### Docker Compose

```yaml
version: '3.8'
services:
  ip-check-tool:
    image: ghcr.io/fireboy38/ip-check-tool:main
    container_name: ip-check-tool
    ports:
      - "80:80"
    restart: unless-stopped
```

### 手动部署

```bash
# 克隆仓库
git clone https://github.com/fireboy38/ip-check-tool.git
cd ip-check-tool

# 安装依赖
npm install

# 构建
npm run build

# dist 目录部署到任意静态服务器
```

---

## 🏗️ 项目结构

```
ip-check-tool/
├── src/
│   ├── components/
│   │   ├── IPInfoSection.tsx      # IP 地址检测（含降级链）
│   │   ├── WebRTCSection.tsx      # WebRTC 泄漏测试
│   │   ├── DNSSection.tsx         # DNS 泄漏测试（DoH 查询）
│   │   ├── ConnectivityTest.tsx   # 网络连通性测试
│   │   ├── SpeedTestSection.tsx   # 网速测试
│   │   ├── Header.tsx             # 顶部导航
│   │   └── Footer.tsx             # 底部信息
│   ├── pages/
│   │   ├── Home.tsx               # 首页
│   │   └── ToolsPage.tsx          # 高级工具（浏览器指纹）
│   ├── hooks/
│   │   └── useTheme.ts            # 主题切换
│   ├── App.tsx                    # 主应用入口
│   └── index.tsx                  # 渲染入口
├── Dockerfile                     # 多阶段构建
├── nginx.conf                     # Nginx 配置
├── .github/workflows/
│   └── docker-build.yml           # 自动构建 Docker 镜像
└── package.json
```

---

## 🔄 CI/CD

项目使用 GitHub Actions 自动构建 Docker 镜像：

- **触发条件**：推送到 `main` 分支 或 打 tag（`v*`）
- **构建平台**：`linux/amd64` + `linux/arm64`
- **镜像仓库**：GitHub Container Registry (GHCR)
- **镜像地址**：`ghcr.io/fireboy38/ip-check-tool:main`

---

## 📋 主要特性

- 🌙 **深色/浅色主题**切换
- 📱 **响应式设计**，支持移动端
- ⚡ **逐个状态更新**，不再卡在"检测中"
- 🔗 **智能降级链**，国内 API 优先
- 🛡️ **真实 WebRTC 检测**，解析 ICE Candidate 类型
- 🌍 **真实 DoH 查询**，非模拟数据
- 🔒 **隐私安全**，所有检测在浏览器本地完成，不上传任何数据
- 🐳 **Docker 一键部署**
- 🔄 **CI/CD 自动构建**

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

## 📝 备案信息

蜀ICP备20007839号

---

<p align="center">
  Made with ❤️ by 四川新数
</p>
