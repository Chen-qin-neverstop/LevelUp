# 🚀 快速开始指南

## 最简安装步骤

1. **下载项目**
   ```bash
   git clone https://github.com/Chen-qin-neverstop/LevelUp.git
   cd LevelUp
   ```

2. **配置API密钥**
   编辑 `.env` 文件，添加至少一个API密钥：
   ```env
   # 推荐：DeepSeek（性价比高）
   DEEPSEEK_API_KEY=sk-your-deepseek-key-here
   
   # 或者：Moonshot（长文本好）
   MOONSHOT_API_KEY=sk-your-moonshot-key-here
   ```

3. **启动服务**
   ```bash
   node free-server-fixed.js
   ```

4. **开始使用**
   - 浏览器打开 `http://localhost:3000`
   - 点击右下角🛎️按钮与AI对话

## 获取API密钥

### DeepSeek（推荐）
1. 访问 [DeepSeek开放平台](https://platform.deepseek.com/)
2. 注册账号并实名认证
3. 获取API密钥
4. 新用户有免费额度

### Moonshot（Kimi）
1. 访问 [Moonshot AI](https://platform.moonshot.cn/)
2. 注册账号
3. 获取API密钥
4. 有200万tokens/月免费额度

## 故障排除

- **端口被占用**：修改 `.env` 中的 `PORT=3001`
- **API调用失败**：检查密钥是否正确，查看控制台错误信息
- **Groq无法访问**：需要开启代理工具（如Clash）

更多详细信息请查看完整的 [README.md](README.md)
