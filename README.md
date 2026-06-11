# Zotero Pronounce

Zotero Pronounce 是一个 Zotero PDF 阅读器选词发音插件。用户在 Zotero PDF 里选中英文单词、短语或句子后，选中文本浮窗会出现“发音”按钮；点击后，插件调用本机的 OpenAI-compatible TTS 服务生成音频并播放。

项目仓库：`https://github.com/techyangj/Zotero-voice`

当前版本：`0.1.7`

兼容范围：Zotero `9.0.3` 到 Zotero `10.x`

默认 TTS 接口：

```text
http://127.0.0.1:8880/v1/audio/speech
```

说明：本文里的 Kokoro 是本地文本转语音模型服务，不是聊天 LLM。它提供的是发音/朗读能力。

## 功能

- 在 Zotero PDF Reader 的选中文本浮窗中加入“发音”按钮。
- 调用本地 OpenAI-compatible `/v1/audio/speech` 接口。
- 默认使用 Kokoro-FastAPI、Kokoro-82M、`af_bella` 声音。
- 自动清洗 PDF 选中文本中的换行、断行连字符、soft hyphen 和重复空格。
- 支持插件偏好设置：endpoint、model、voice、response format、speed、max text length、autoplay、debug。

## 一、安装 Zotero 插件

可以从 GitHub Releases 下载已经打包好的 XPI：

```text
https://github.com/techyangj/Zotero-voice/releases
```

也可以自己从源码构建。

先克隆仓库并安装依赖：

```bash
git clone git@github.com:techyangj/Zotero-voice.git
cd Zotero-voice
npm install
```

构建并打包插件：

```bash
npm run package
```

生成的 XPI 位于：

```text
dist/zotero-pronounce-0.1.7.xpi
```

在 Zotero 中安装：

1. 打开 Zotero。
2. 进入 `Tools -> Plugins`。
3. 点击右上角齿轮。
4. 选择 `Install Plugin From File...`。
5. 选择 `zotero-pronounce-0.1.7.xpi`。
6. 安装后确认插件处于启用状态。

## 二、安装本地 Kokoro TTS 服务

本项目不使用 Docker。推荐在 macOS 上用 `uv` 原生运行 Kokoro-FastAPI。

### 1. 安装基础工具

如果没有 Homebrew，先安装 Homebrew。然后安装 Node.js、Git 和 uv：

```bash
brew install node git uv
```

确认命令可用：

```bash
node --version
npm --version
git --version
uv --version
```

### 2. 下载 Kokoro-FastAPI

在本项目根目录执行：

```bash
mkdir -p .tts
git clone https://github.com/remsky/Kokoro-FastAPI.git .tts/Kokoro-FastAPI
```

如果已经下载过，可以更新：

```bash
git -C .tts/Kokoro-FastAPI pull --ff-only
```

### 3. 创建 Python 环境并安装依赖

进入 Kokoro-FastAPI 目录：

```bash
cd .tts/Kokoro-FastAPI
```

创建 Python 3.10 虚拟环境：

```bash
uv venv --python 3.10
```

安装依赖：

```bash
uv pip install -e ".[cpu]"
```

下载模型文件：

```bash
uv run --no-sync python docker/scripts/download_model.py --output api/src/models/v1_0
```

回到本项目根目录：

```bash
cd ../..
```

## 三、启动和停止 TTS 服务

启动后台服务：

```bash
npm run tts:start
```

服务会监听：

```text
http://127.0.0.1:8880
```

日志文件：

```text
.tts/kokoro.log
```

停止服务：

```bash
npm run tts:stop
```

Apple Silicon Mac 默认使用 `mps`。如果你想强制使用 CPU，可以这样启动：

```bash
KOKORO_DEVICE=cpu npm run tts:start
```

如果你的 `uv` 不在 PATH 里，可以指定路径：

```bash
UV_BIN=/opt/homebrew/bin/uv npm run tts:start
```

## 四、测试本地发音接口

确认服务可用：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

生成测试音频：

```bash
curl http://127.0.0.1:8880/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kokoro",
    "input": "Error mitigation for short depth quantum circuits.",
    "voice": "af_bella",
    "response_format": "mp3",
    "speed": 1.0
  }' \
  --output zotero-pronounce-test.mp3
```

如果生成了 `zotero-pronounce-test.mp3`，说明本地 TTS 服务正常。

## 五、在 Zotero 中使用

1. 确认 Kokoro 服务正在运行：`npm run tts:start`。
2. 打开 Zotero 里的 PDF。
3. 选中英文单词、短语或句子。
4. 在选中文本浮窗中点击“发音”。
5. 如果 Zotero 阻止自动播放，插件会显示音频控件，点击控件播放即可。

## 六、插件默认配置

```js
endpoint = "http://127.0.0.1:8880/v1/audio/speech"
model = "kokoro"
voice = "af_bella"
response_format = "mp3"
speed = 1.0
max_text_length = 300
autoplay = false
debug = false
```

可以在 Zotero 的插件设置页中修改这些配置。

## 七、开发命令

安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

构建插件：

```bash
npm run build
```

打包 XPI：

```bash
npm run package
```

## 八、常见问题

### 1. 点击“发音”后提示无法连接 TTS endpoint

先确认服务是否启动：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

如果无法连接，运行：

```bash
npm run tts:start
```

### 2. 服务启动慢

第一次启动会下载和加载模型，可能需要几十秒。后续启动会快很多。

### 3. Zotero 有请求但没有自动播放

Zotero/Firefox 可能会阻止某些自动播放行为。插件会显示音频控件，手动点击即可。

### 4. 想换声音

默认声音是：

```text
af_bella
```

可用声音可以通过下面命令查看：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

然后在 Zotero 插件设置里修改 `voice`。

## 九、当前实现说明

第一版只做选词发音，不接 Ollama，也不做翻译。后续可以继续加入：

- IPA 显示；
- 专业术语读法；
- 单词释义；
- Ollama 文本清洗；
- 发音缓存。
