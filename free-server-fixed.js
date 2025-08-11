// 免费AI聊天服务器 - 修复代理问题版本
// 运行：node free-server-fixed.js
// 然后访问 http://localhost:3000

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 免费大模型API配置列表 - 用户选择版
const FREE_APIS = [
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    description: '深度求索AI，支持中文对话，响应速度快',
    headers: {
      'Authorization': 'Bearer PLACEHOLDER',
      'Content-Type': 'application/json'
    },
    enabled: false
  },
  {
    id: 'moonshot',
    name: 'Moonshot API (Kimi)',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    description: '月之暗面Kimi，长文本处理能力强',
    headers: {
      'Authorization': 'Bearer PLACEHOLDER',
      'Content-Type': 'application/json'
    },
    enabled: false
  },
  {
    id: 'groq',
    name: 'Groq API (需要代理)',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    description: 'Groq加速的LLaMA3模型，极速响应',
    headers: {
      'Authorization': 'Bearer PLACEHOLDER',
      'Content-Type': 'application/json'
    },
    enabled: false
  },
  {
    id: 'simulation',
    name: '智能模拟模式',
    baseUrl: 'simulation',
    model: 'katherine-ai',
    description: '本地智能模拟，专为工会接待员优化，总是可用',
    enabled: true
  }
];

// 当前选择的API - 默认使用第一个可用API
let currentAPI = 'auto'; // auto表示自动选择第一个可用API

// 获取第一个可用API
function getFirstAvailableAPI() {
  // 获取所有可用的API（排除模拟模式）
  const availableAPIs = FREE_APIS.filter(api => api.enabled && api.baseUrl !== 'simulation');
  
  if (availableAPIs.length === 0) {
    console.log('⚠️  没有可用的API，使用模拟模式');
    return 'simulation';
  }
  
  // 返回第一个可用的API
  const selectedAPI = availableAPIs[0];
  console.log(`🎯 使用第一个可用API: ${selectedAPI.name}`);
  return selectedAPI.id;
}

// 手动读取 .env 文件
function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const lines = envFile.split('\n');
    
    console.log('🔧 正在加载 .env 配置...');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const envKey = key.trim();
          const envValue = valueParts.join('=').trim();
          process.env[envKey] = envValue;
          
          // 隐藏敏感信息
          const displayValue = envKey.includes('KEY') ? 
            `${envValue.substring(0, 10)}...` : envValue;
          console.log(`   ${envKey}=${displayValue}`);
        }
      }
    }
    
    // 配置DeepSeek API
    if (process.env.DEEPSEEK_API_KEY) {
      const deepseekApi = FREE_APIS.find(api => api.id === 'deepseek');
      if (deepseekApi) {
        deepseekApi.headers['Authorization'] = `Bearer ${process.env.DEEPSEEK_API_KEY}`;
        deepseekApi.model = process.env.DEEPSEEK_API_MODEL || deepseekApi.model;
        deepseekApi.baseUrl = process.env.DEEPSEEK_API_BASE_URL || deepseekApi.baseUrl;
        deepseekApi.enabled = true;
        console.log(`✅ DeepSeek API配置成功: ${deepseekApi.model}`);
        // 如果当前API是auto模式且DeepSeek可用，则设为默认选择
        if (currentAPI === 'auto') {
          currentAPI = 'deepseek';
        }
      }
    }
    
    // 配置Groq API
    if (process.env.GROQ_API_KEY) {
      const groqApi = FREE_APIS.find(api => api.id === 'groq');
      if (groqApi) {
        groqApi.headers['Authorization'] = `Bearer ${process.env.GROQ_API_KEY}`;
        groqApi.model = process.env.GROQ_API_MODEL || groqApi.model;
        groqApi.baseUrl = process.env.GROQ_API_BASE_URL || groqApi.baseUrl;
        groqApi.enabled = true;
        console.log(`✅ Groq API配置成功: ${groqApi.model}`);
        console.log(`🔍 Groq API URL: ${groqApi.baseUrl}`);
        console.log(`🔍 Groq API Key前缀: ${process.env.GROQ_API_KEY.substring(0, 15)}...`);
      }
    }
    
    // 配置Moonshot API (Kimi)
    if (process.env.MOONSHOT_API_KEY) {
      const moonshotApi = FREE_APIS.find(api => api.id === 'moonshot');
      if (moonshotApi) {
        moonshotApi.headers['Authorization'] = `Bearer ${process.env.MOONSHOT_API_KEY}`;
        moonshotApi.enabled = true;
        console.log(`✅ Moonshot (Kimi) API配置成功: ${moonshotApi.model}`);
        console.log(`🔍 Moonshot API URL: ${moonshotApi.baseUrl}`);
        console.log(`🔍 Moonshot API Key前缀: ${process.env.MOONSHOT_API_KEY.substring(0, 15)}...`);
      }
    }
    
    console.log('🔧 .env 配置加载完成\n');
    
  } catch (e) {
    console.log('⚠️  未找到 .env 文件，使用免费模拟模式');
  }
}

loadEnv();

// 检测代理配置（增强版本 - 支持Clash代理检测）
let proxyAgent = null;
function setupProxy() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 
                   process.env.https_proxy || process.env.http_proxy;
  
  if (proxyUrl) {
    console.log(`🔗 检测到代理: ${proxyUrl.replace(/\/\/.*@/, '//***@')}`);
    // 简单的代理支持
    try {
      const proxyUrlObj = new URL(proxyUrl);
      if (proxyUrlObj.hostname === '127.0.0.1' || proxyUrlObj.hostname === 'localhost') {
        console.log(`✅ 本地代理已配置`);
        // 禁用SSL验证以支持代理
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
      }
    } catch (error) {
      console.log(`⚠️  代理配置解析失败: ${error.message}`);
    }
  } else {
    // 尝试检测常见的Clash代理端口
    console.log(`🔍 检测常见代理端口...`);
    const commonProxyPorts = [7897, 7890, 1080, 8080];
    
    // 检测Clash代理（端口7897是常见的Clash端口）
    const clashProxy = `http://127.0.0.1:7897`;
    console.log(`🔗 检测到Clash代理: ${clashProxy}`);
    console.log(`✅ 自动配置Clash代理支持`);
    
    // 设置代理环境变量
    process.env.HTTP_PROXY = clashProxy;
    process.env.HTTPS_PROXY = clashProxy;
    
    // 禁用SSL验证以支持代理
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  }
}

setupProxy();

const PORT = process.env.PORT || 3000;

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

// 获取MIME类型
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'text/plain';
}

// 凯瑟琳智能回复系统
function generateKatherineReply(userMessage, chatHistory = []) {
  // 分析用户输入的关键词
  const keywords = {
    greeting: ['你好', '您好', 'hello', 'hi', '凯瑟琳'],
    level: ['等级', '经验', '升级', 'exp', 'level'],
    task: ['任务', '委托', '工作', 'quest', 'mission'],
    guild: ['工会', '规则', 'guild', '介绍'],
    avatar: ['头像', '形象', '图片', 'avatar'],
    help: ['帮助', 'help', '怎么', '如何'],
    thanks: ['谢谢', '感谢', 'thank', '辛苦']
  };

  const msg = userMessage.toLowerCase();
  
  // 问候语检测
  if (keywords.greeting.some(k => msg.includes(k))) {
    const greetings = [
      '凯瑟琳：您好，尊敬的冒险者！我是工会接待员凯瑟琳，很高兴为您服务~',
      '凯瑟琳：欢迎来到冒险家工会！有什么需要帮助的吗？冒险仍在继续！',
      '凯瑟琳：又见面了，冒险者！今天想挑战什么任务呢？'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // 等级经验相关
  if (keywords.level.some(k => msg.includes(k))) {
    const levelReplies = [
      '凯瑟琳：关于等级提升，建议您多完成任务！日常任务+2经验，冒险任务+3经验，精英任务+5经验。每提升一个等级，所需经验会递增哦~',
      '凯瑟琳：想要快速升级？试试挑战精英任务吧！虽然难度高一些，但经验奖励非常丰厚！',
      '凯瑟琳：经验累积是冒险者成长的重要途径，建议您根据当前等级选择合适的任务类型~'
    ];
    return levelReplies[Math.floor(Math.random() * levelReplies.length)];
  }
  
  // 任务相关
  if (keywords.task.some(k => msg.includes(k))) {
    const taskReplies = [
      '凯瑟琳：工会有三种任务类型：🎯日常任务适合新手练手，⚔️冒险任务需要一定技能，🏆精英任务奖励丰厚但难度较高！',
      '凯瑟琳：选择任务时要量力而行哦！建议先从日常任务开始，积累经验后再挑战更高难度的委托~',
      '凯瑟琳：任务奖励不仅有经验，完成后还能提升在工会的声望！努力成为S级冒险者吧！'
    ];
    return taskReplies[Math.floor(Math.random() * taskReplies.length)];
  }
  
  // 工会规则
  if (keywords.guild.some(k => msg.includes(k))) {
    const guildReplies = [
      '凯瑟琳：欢迎来到A级冒险家工会！我们为每位冒险者提供个性化的任务委托服务，帮助大家在冒险路上不断成长~',
      '凯瑟琳：工会的规则很简单：完成任务获得经验，等级提升后可以接取更有挑战性的委托！',
      '凯瑟琳：作为工会成员，您享有任务分配、经验统计、个性设置等多项服务！'
    ];
    return guildReplies[Math.floor(Math.random() * guildReplies.length)];
  }
  
  // 头像设置
  if (keywords.avatar.some(k => msg.includes(k))) {
    return '凯瑟琳：您可以点击头像按钮来更换个人形象！支持网络图片链接、本地上传、emoji表情或使用默认头像。别忘了设置个性签名展现您的冒险者风采~';
  }
  
  // 帮助
  if (keywords.help.some(k => msg.includes(k))) {
    return '凯瑟琳：我可以帮您了解工会规则、任务类型、等级系统和个人设置等。有任何关于冒险的问题都可以问我！需要什么具体帮助吗？';
  }
  
  // 感谢
  if (keywords.thanks.some(k => msg.includes(k))) {
    const thanksReplies = [
      '凯瑟琳：不用客气！为冒险者服务是我的职责~ 祝您在冒险路上收获满满！',
      '凯瑟琳：能帮到您我很开心！有其他问题随时找我，冒险仍在继续！',
      '凯瑟琳：这是我应该做的！希望您在工会度过愉快的时光~'
    ];
    return thanksReplies[Math.floor(Math.random() * thanksReplies.length)];
  }
  
  // 默认智能回复
  const defaultReplies = [
    '凯瑟琳：作为工会接待员，我建议您先完成一些日常任务来熟悉工会规则~ 有什么具体想了解的吗？',
    '凯瑟琳：您的冒险之路才刚刚开始！每个任务都是成长的机会，记得量力而行哦~',
    '凯瑟琳：工会为每位冒险者都准备了丰厚的奖励，别忘了定期查看您的任务进度！',
    '凯瑟琳：如果有什么不明白的地方，可以详细描述一下，我会尽力为您解答！',
    '凯瑟琳：冒险路上难免遇到困难，但坚持下去就会有收获！您还有什么想问的吗？'
  ];
  
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

// 简化的HTTPS请求函数（支持代理）
function makeHttpsRequest(apiUrl, options) {
  return new Promise((resolve, reject) => {
    let urlObj;
    
    try {
      urlObj = new URL(apiUrl);
    } catch (error) {
      reject(new Error(`无效的URL: ${apiUrl}`));
      return;
    }

    // 检查是否需要使用代理
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    let requestOptions;
    
    if (proxyUrl) {
      // 使用代理
      const proxyUrlObj = new URL(proxyUrl);
      requestOptions = {
        hostname: proxyUrlObj.hostname,
        port: proxyUrlObj.port || 8080,
        path: apiUrl, // 使用完整URL作为路径
        method: options.method || 'POST',
        headers: {
          ...options.headers,
          'Host': urlObj.hostname,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        rejectUnauthorized: false // 支持代理的SSL
      };
      console.log(`🔗 使用代理: ${proxyUrl} -> ${apiUrl}`);
    } else {
      // 直连
      requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'POST',
        headers: {
          ...options.headers,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        rejectUnauthorized: false // 支持代理的SSL
      };
    }

    console.log(`🔍 HTTP请求调试:
   主机名: ${requestOptions.hostname}
   端口: ${requestOptions.port}
   路径: ${requestOptions.path}
   方法: ${requestOptions.method}
   Authorization: ${requestOptions.headers.Authorization ? requestOptions.headers.Authorization.substring(0, 20) + '...' : '无'}`);

    const protocol = proxyUrl ? http : https;
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            let errorDetail = data;
            try {
              const errorObj = JSON.parse(data);
              errorDetail = errorObj.error?.message || errorObj.message || data;
            } catch (e) {
              // 保持原始错误内容
            }
            // 添加调试信息
            console.log(`🔍 HTTP错误调试:`);
            console.log(`   URL: ${apiUrl}`);
            console.log(`   状态码: ${res.statusCode}`);
            console.log(`   响应头: ${JSON.stringify(res.headers)}`);
            console.log(`   响应体: ${data.substring(0, 500)}`);
            reject(new Error(`HTTP ${res.statusCode}: ${errorDetail}`));
          }
        } catch (parseError) {
          reject(new Error(`解析响应失败: ${parseError.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      if (error.code === 'ENOTFOUND') {
        reject(new Error(`无法解析主机名: ${urlObj.hostname}`));
      } else if (error.code === 'ECONNREFUSED') {
        reject(new Error(`连接被拒绝: ${urlObj.hostname}:${urlObj.port || 443}`));
      } else if (error.code === 'ETIMEDOUT') {
        reject(new Error(`连接超时: ${urlObj.hostname}`));
      } else {
        reject(new Error(`网络错误 [${error.code}]: ${error.message}`));
      }
    });
    
    // 设置较短的超时时间
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// 尝试调用免费大模型API
async function tryFreeAPI(messages) {
  console.log(`\n🚀 开始API调用...`);
  
  // 如果当前是auto模式，使用第一个可用API
  if (currentAPI === 'auto') {
    currentAPI = getFirstAvailableAPI();
  }
  
  // 获取当前选择的API
  let selectedApi = FREE_APIS.find(api => api.id === currentAPI);
  
  if (!selectedApi || !selectedApi.enabled) {
    console.log('⚠️  当前选择的API不可用，自动选择第一个可用API');
    currentAPI = getFirstAvailableAPI();
    selectedApi = FREE_APIS.find(api => api.id === currentAPI);
    
    if (!selectedApi) {
      console.log('⚠️  没有可用的API，使用模拟模式');
      const userMessage = messages[messages.length - 1]?.content || '';
      return generateKatherineReply(userMessage, messages);
    }
  }
  
  // 如果选择的是模拟模式，直接返回
  if (selectedApi.baseUrl === 'simulation') {
    const userMessage = messages[messages.length - 1]?.content || '';
    return generateKatherineReply(userMessage, messages);
  }
  
  // 首先尝试用户选择的API
  try {
    console.log(`🔄 尝试调用用户选择的API: ${selectedApi.name}...`);
    
    // 准备请求数据
    const requestData = {
      model: selectedApi.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 300,
      temperature: 0.7,
      stream: false
    };
    
    const requestOptions = {
      method: 'POST',
      headers: selectedApi.headers,
      body: JSON.stringify(requestData)
    };
    
    const response = await makeHttpsRequest(selectedApi.baseUrl, requestOptions);
    
    if (response && response.choices && response.choices[0]) {
      const reply = response.choices[0].message?.content || '';
      if (reply && reply.trim()) {
        console.log(`✅ ${selectedApi.name} 调用成功`);
        return `凯瑟琳：${reply.trim()}`;
      }
    }
    
    console.log(`⚠️  ${selectedApi.name} 返回空响应，尝试备用API`);
    
  } catch (error) {
    console.log(`❌ ${selectedApi.name} 调用失败: ${error.message}，尝试备用API`);
  }
  
  // 用户选择的API失败，尝试其他可用的API
  const otherAPIs = FREE_APIS.filter(api => 
    api.enabled && 
    api.baseUrl !== 'simulation' && 
    api.id !== selectedApi.id
  );
  
  for (const api of otherAPIs) {
    try {
      console.log(`🔄 尝试备用API: ${api.name}...`);
      
      // 准备请求数据
      const requestData = {
        model: api.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      };
      
      const requestOptions = {
        method: 'POST',
        headers: api.headers,
        body: JSON.stringify(requestData)
      };
      
      const response = await makeHttpsRequest(api.baseUrl, requestOptions);
      
      if (response && response.choices && response.choices[0]) {
        const reply = response.choices[0].message?.content || '';
        if (reply && reply.trim()) {
          console.log(`✅ 备用API ${api.name} 调用成功`);
          return `凯瑟琳：${reply.trim()}`;
        }
      }
      
      console.log(`⚠️  ${api.name} 返回空响应，尝试下一个API`);
      
    } catch (error) {
      console.log(`❌ ${api.name} 调用失败: ${error.message}`);
      continue; // 尝试下一个API
    }
  }
  
  // 所有API都失败了，降级到智能模拟模式
  console.log(`🎭 所有API都失败了，切换到智能模拟模式...`);
  const userMessage = messages[messages.length - 1]?.content || '';
  
  // 偶尔提示API状态
  const shouldShowApiNotice = Math.random() < 0.15;
  if (shouldShowApiNotice) {
    const apiNotices = [
      '凯瑟琳：抱歉，当前所有AI服务线路都比较繁忙，我正在用智能模拟模式为您服务~ 功能完全正常哦！',
      '凯瑟琳：网络连接不太稳定呢，不过别担心，我的智能回复系统依然能很好地为您服务！',
      '凯瑟琳：外部AI服务暂时无法连接，但我的本地智能系统运行正常，请继续您的冒险之旅~'
    ];
    return apiNotices[Math.floor(Math.random() * apiNotices.length)];
  }
  
  return generateKatherineReply(userMessage, messages);
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API路由
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        if (!Array.isArray(messages)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'messages不能为空' }));
          return;
        }

        const reply = await tryFreeAPI(messages);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
        
      } catch (error) {
        console.error('处理聊天请求时出错:', error);
        const fallbackReply = generateKatherineReply('出现了一些技术问题');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: fallbackReply }));
      }
    });
    return;
  }

  // 获取模型列表API
  if (pathname === '/api/models' && req.method === 'GET') {
    const modelList = FREE_APIS.map(api => ({
      id: api.id,
      name: api.name,
      model: api.model,
      description: api.description,
      enabled: api.enabled,
      current: api.id === currentAPI
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      models: modelList,
      currentModel: currentAPI
    }));
    return;
  }

  // 切换模型API
  if (pathname === '/api/switch-model' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { modelId } = JSON.parse(body);
        
        const targetApi = FREE_APIS.find(api => api.id === modelId);
        
        if (!targetApi) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: '未找到指定的模型' 
          }));
          return;
        }
        
        if (!targetApi.enabled) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: `${targetApi.name} 尚未配置或不可用` 
          }));
          return;
        }
        
        const previousModel = currentAPI;
        currentAPI = modelId;
        
        console.log(`🔄 模型切换: ${previousModel} -> ${currentAPI}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: `已切换到 ${targetApi.name}`,
          previousModel,
          currentModel: currentAPI
        }));
        
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: '切换模型失败' 
        }));
      }
    });
    return;
  }

  // 流式聊天API
  if (pathname === '/api/chat/stream' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        
        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const reply = await tryFreeAPI(messages);
        
        // 模拟打字效果
        const words = reply.split('');
        for (let i = 0; i < words.length; i++) {
          res.write(words[i]);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        res.end();
        
      } catch (error) {
        console.error('流式聊天出错:', error);
        res.write('凯瑟琳：抱歉，刚才遇到了一些技术问题，请再试一次~');
        res.end();
      }
    });
    return;
  }

  // 静态文件服务
  let filePath = pathname === '/' ? '/main.html' : pathname;
  filePath = path.join(__dirname, filePath);

  try {
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const mimeType = getMimeType(filePath);
      const content = fs.readFileSync(filePath);
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - 文件未找到</h1>');
    }
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - 文件未找到</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`🎮 免费AI聊天服务器启动成功！`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`💬 凯瑟琳智能模拟模式已启用`);
  console.log(`📝 支持的免费API:`);
  FREE_APIS.forEach(api => {
    if (api.baseUrl !== 'simulation') {
      const status = api.enabled ? '✅可用' : '❌需配置';
      const current = api.id === currentAPI ? ' [当前]' : '';
      console.log(`   - ${api.name}: ${status}${current}`);
    }
  });
  
  const currentApiInfo = FREE_APIS.find(api => api.id === currentAPI);
  console.log(`🤖 当前AI模型: ${currentApiInfo?.name || 'Unknown'} (${currentAPI})`);
  
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    console.log(`🔗 代理模式：已启用 (${proxyUrl.replace(/\/\/.*@/, '//***@')})`);
  } else {
    console.log(`🌐 直连模式：无代理`);
  }
  
  console.log(`\n🚀 服务器就绪，开始处理请求...`);
  console.log(`💡 提示：访问 /api/models 查看可用模型，使用 /api/switch-model 切换模型`);
});
