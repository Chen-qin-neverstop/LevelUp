# 冒险家工会（RPG 计算器 + 工会接待员）

本项目将原“任务升级计算器”升级为 RPG 风格的“冒险家工会”，并新增“凯瑟琳”风格工会接待员聊天功能（安全通过后端代理调用大模型）。

## 运行后端（保护你的 API Key）
1. 安装 Node.js（https://nodejs.org/）
2. 在项目根目录（本文件所在目录）执行：
   - npm install
   - 复制 .env.example 为 .env，并填写 API_KEY=你的密钥（可配置 OPENAI_BASE_URL/OPENAI_MODEL）
   - npm run dev（或 npm start）
3. 打开 http://localhost:3000/index.html 使用前端页面；或直接用文件协议打开 index.html，但需保证后端已在 3000 端口运行。

## 说明
- 前端浮窗位于右下角“🛎️”，支持与“凯瑟琳”对话，按角色分开保存历史。
- 后端默认走 OpenAI 兼容接口（/v1/chat/completions），你也可以替换为自己的网关。

## 安全
- 不要把真实 API Key 写入前端；通过 .env 在服务端配置。

## TODO（可选）
- 支持流式输出
- 基于角色上下文更丰富的系统提示/记忆
- 简单限流与异常重试策略
