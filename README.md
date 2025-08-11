# 🏰 冒险家工会 - LevelUp

一个具有RPG风格的任务升级计算器，集成了智能AI工会接待员系统。玩家可以创建多个角色，计算任务经验收益，并与不同个性的AI角色进行对话。

## ✨ 主要功能

### 🎮 RPG角色管理系统
- **多角色支持**：创建和管理多个冒险者角色
- **职业系统**：战士、法师、盗贼、治疗师、弓箭手、学者
- **个性化定制**：自定义头像、签名和角色信息
- **数据持久化**：本地存储角色数据和经验记录

### 📊 任务升级计算器
- **多种任务类型**：日常、周常、主线、支线、特殊任务
- **经验计算**：智能计算经验收益和等级提升
- **状态影响**：支持各种增益/减益状态计算
- **详细报告**：生成详细的经验分解和升级报告

### 🤖 AI工会接待员
- **多角色对话**：凯瑟琳（工会接待员）、弗洛洛（鸣潮角色）、自定义角色
- **智能回复**：基于角色个性的AI对话系统
- **多模型支持**：DeepSeek、Moonshot(Kimi)、Groq等多种AI模型
- **代理安全**：后端代理保护API密钥安全

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- 现代浏览器（Chrome、Firefox、Edge等）

### 安装运行

1. **克隆项目**
```bash
git clone https://github.com/Chen-qin-neverstop/LevelUp.git
cd LevelUp
```

2. **配置API密钥**
```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件，添加你的API密钥
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
MOONSHOT_API_KEY=sk-your-moonshot-key-here
```

⚠️ **安全提醒**：
- 请勿将 `.env` 文件提交到git仓库
- API密钥是敏感信息，请妥善保管
- 项目已配置 `.gitignore` 保护你的密钥安全

3. **启动服务**
```bash
# 启动后端服务器
node free-server-fixed.js
```

4. **访问应用**
- 打开浏览器访问 `http://localhost:3000`
- 点击右下角的🛎️按钮开始与AI工会接待员对话

## 🔧 配置说明

### API配置
项目支持多种AI模型，在`.env`文件中配置：

```env
# DeepSeek API（推荐，性价比高）
DEEPSEEK_API_KEY=sk-your-deepseek-key-here

# Moonshot API（Kimi，长文本支持好）
MOONSHOT_API_KEY=sk-your-moonshot-key-here

# Groq API（速度快，需要代理）
GROQ_API_KEY=gsk-your-groq-key-here

# 端口配置
PORT=3000
```

### 代理配置
如果你使用Clash等代理工具：
- 系统会自动检测7897端口的Clash代理
- Groq API需要代理才能访问
- DeepSeek和Moonshot可以直连

## 🎭 角色系统

### 预设角色
- **凯瑟琳**：冒险家工会接待员，专业贴心，擅长回答工会相关问题
- **弗洛洛**：鸣潮世界的可爱少女，活泼好奇，语气亲切

### 自定义角色
- 支持创建自定义AI角色
- 可以设置角色名称和个性化提示词
- 每个角色有独立的对话历史

## 📱 使用指南

### 创建角色
1. 首次访问会显示角色选择界面
2. 点击"+"创建新角色
3. 选择职业、设置名称
4. 上传头像或选择表情符号

### 计算经验
1. 在任务委托板中输入各类任务数量
2. 设置当前等级和经验
3. 配置增益/减益状态
4. 点击"提交任务报告"查看结果

### AI对话
1. 点击右下角🛎️按钮打开聊天面板
2. 选择AI模型和对话角色
3. 输入消息开始对话
4. 支持角色切换和自定义角色

## 🛠️ 技术架构

### 前端技术
- **HTML5 + CSS3**：响应式界面设计
- **Vanilla JavaScript**：原生JS实现，无框架依赖
- **LocalStorage**：本地数据持久化
- **模块化设计**：清晰的组件划分

### 后端技术
- **Node.js**：轻量级服务器
- **HTTP/HTTPS**：RESTful API设计
- **代理支持**：自动检测和配置代理
- **多模型集成**：统一的AI模型调用接口

### 安全特性
- **API密钥保护**：后端代理，前端不暴露密钥
- **配置文件安全**：`.env` 文件自动排除在git仓库外
- **示例配置**：提供 `.env.example` 作为配置模板
- **智能降级**：API失败时自动切换到备用模式
- **错误处理**：完善的异常处理机制
- **用户选择优先**：尊重用户的模型选择，失败时才自动切换

## 🔌 API接口

### 模型管理
- `GET /api/models` - 获取可用模型列表
- `POST /api/switch-model` - 切换AI模型

### 对话接口
- `POST /api/chat` - 发送对话消息
- `POST /api/chat/stream` - 流式对话

## 🎨 特色功能

### 智能API选择
- 用户选择的模型优先使用
- 失败时自动尝试其他可用模型
- 支持模型状态实时监控

### 角色个性化
- 每个AI角色有独特的对话风格
- 支持自定义角色和提示词
- 角色历史记录分别保存

### 代理智能检测
- 自动检测Clash代理（端口7897）
- 根据网络环境自动配置
- 支持SSL验证跳过

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发环境设置
1. Fork本项目
2. 创建功能分支 `git checkout -b feature/new-feature`
3. 提交更改 `git commit -am 'Add new feature'`
4. 推送分支 `git push origin feature/new-feature`
5. 创建Pull Request

## 📋 更新日志

### v2.0.0 (2025-01-11)
- ✨ 新增AI工会接待员系统
- ✨ 多角色对话支持（凯瑟琳、弗洛洛、自定义）
- ✨ 多AI模型集成（DeepSeek、Moonshot、Groq）
- ✨ 智能API选择和自动降级
- ✨ 自动代理检测和配置
- 🔒 增强API安全性（后端代理保护密钥）
- 🎨 优化用户界面体验
- 🚀 用户选择优先的模型切换策略

### v1.0.0
- 🎮 RPG风格角色管理系统
- 📊 任务升级计算器
- 💾 本地数据持久化

## 🔧 故障排除

### 常见问题

**Q: 右下角按钮没反应怎么办？**
A: 检查浏览器控制台是否有错误，确认服务器正在运行在3000端口。

**Q: AI对话没有回复？**
A: 检查.env文件中的API密钥是否正确配置，查看后端控制台的错误信息。

**Q: Groq API无法使用？**
A: Groq需要代理访问，确保开启了Clash或其他代理工具。

**Q: 角色数据丢失？**
A: 数据保存在浏览器LocalStorage中，清除浏览器数据会导致丢失。

**Q: Git 推送被拒绝 (push protection) 怎么办？**
A: 这说明检测到了敏感信息（如API密钥）。请按照以下步骤解决：
```bash
# 移除 .env 文件的 Git 追踪
git rm --cached .env

# 确保 .gitignore 包含 .env
echo .env >> .gitignore

# 提交更改
git add .gitignore
git commit -m "安全更新：保护API密钥"

# 现在可以安全推送
git push
```

## 🔐 安全配置详解

### ⚠️ API 密钥保护重要提醒
- **绝不要**将 `.env` 文件提交到 Git 仓库
- **绝不要**在代码中硬编码 API 密钥
- **务必**使用 `.env.example` 作为配置模板
- **务必**将 `.env` 添加到 `.gitignore`

### 正确的配置流程
1. **首次配置**
   ```bash
   # 复制示例配置文件
   cp .env.example .env
   
   # 编辑配置文件，填入真实的 API 密钥
   # Windows用户可以使用 notepad .env
   ```

2. **API 密钥获取**
   - **DeepSeek**: 访问 [platform.deepseek.com](https://platform.deepseek.com) 注册获取
   - **Moonshot (Kimi)**: 访问 [platform.moonshot.cn](https://platform.moonshot.cn) 注册获取
   - **Groq**: 访问 [console.groq.com](https://console.groq.com) 注册获取

3. **安全检查清单**
   - [ ] `.env` 文件未被 Git 追踪
   - [ ] `.gitignore` 包含 `.env` 条目
   - [ ] 所有 API 密钥都在 `.env` 文件中，不在代码里
   - [ ] 使用 `.env.example` 作为配置模板

### GitHub 推送保护机制
GitHub 会自动扫描您的提交内容，寻找可能的敏感信息：
- API 密钥
- 访问令牌
- 私钥
- 密码

如果检测到这些信息，推送会被阻止以保护您的安全。这是一个**保护功能**，不是错误。

### 生产环境部署
在生产环境中，推荐使用：
- 环境变量
- 密钥管理服务 (如 AWS Secrets Manager, Azure Key Vault)
- 配置管理工具
- 绝不在代码仓库中存储敏感信息

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 感谢 DeepSeek、Moonshot、Groq 提供的AI服务
- 感谢开源社区的贡献和支持
- 感谢鸣潮游戏为弗洛洛角色提供的灵感

## 📞 联系方式

- 项目维护者：Chen-qin-neverstop
- GitHub：[https://github.com/Chen-qin-neverstop/LevelUp](https://github.com/Chen-qin-neverstop/LevelUp)
- Issues：[https://github.com/Chen-qin-neverstop/LevelUp/issues](https://github.com/Chen-qin-neverstop/LevelUp/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！

## 🎯 未来计划

- [ ] 添加更多预设AI角色
- [ ] 支持语音对话功能
- [ ] 增加任务模板系统
- [ ] 实现角色数据云同步
- [ ] 添加成就系统
- [ ] 支持多语言界面
- [ ] 优化移动端体验
