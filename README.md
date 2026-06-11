# Zotero Pronounce

Zotero Pronounce 是一个 Zotero PDF 阅读器选词发音插件。安装后，在 Zotero 的 PDF 中选中英文单词、短语或句子，弹出的选中文本工具栏里会出现“发音”按钮。

项目地址：https://github.com/techyangj/Zotero-voice

当前版本：`0.1.7`

已测试：macOS + Zotero `9.0.4`

兼容范围：Zotero `9.0.3` 到 Zotero `10.x`

## 快速使用

### 1. 下载插件

直接到 Releases 下载已经打包好的 XPI：

https://github.com/techyangj/Zotero-voice/releases

下载文件：

```text
zotero-pronounce-0.1.7.xpi
```

### 2. 安装到 Zotero

1. 打开 Zotero。
2. 进入 `Tools -> Plugins`。
3. 点击右上角齿轮。
4. 选择 `Install Plugin From File...`。
5. 选择刚下载的 `zotero-pronounce-0.1.7.xpi`。
6. 安装后确认 Zotero Pronounce 处于启用状态。

### 3. 启动本地语音模型服务

插件默认调用本机接口：

```text
http://127.0.0.1:8880/v1/audio/speech
```

所以使用前需要先启动本地 TTS 语音模型服务。下面的“本地语音模型服务安装”会详细说明。

### 4. 在 PDF 里发音

1. 打开 Zotero 里的 PDF。
2. 选中英文单词、短语或句子。
3. 点击弹出工具栏里的“发音”。
4. 如果 Zotero 阻止自动播放，插件会显示音频控件，点播放即可。

## 本地语音模型服务安装

这里使用 Kokoro-FastAPI 作为本地 TTS 服务。它提供的是文本转语音能力，不是聊天大模型。

本说明不使用 Docker，适合 macOS 原生安装。

### 准备工具

先安装 Homebrew，然后安装 Node.js、Git 和 uv：

```bash
brew install node git uv
```

检查是否安装成功：

```bash
node --version
npm --version
git --version
uv --version
```

### 下载本仓库

本仓库里包含启动和停止本地语音服务的脚本。

```bash
git clone https://github.com/techyangj/Zotero-voice.git
cd Zotero-voice
```

### 下载 Kokoro-FastAPI

在 `Zotero-voice` 目录里执行：

```bash
mkdir -p .tts
git clone https://github.com/remsky/Kokoro-FastAPI.git .tts/Kokoro-FastAPI
```

如果已经下载过，可以更新：

```bash
git -C .tts/Kokoro-FastAPI pull --ff-only
```

### 安装 Python 环境和依赖

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

下载 Kokoro 模型文件：

```bash
uv run --no-sync python docker/scripts/download_model.py --output api/src/models/v1_0
```

回到本仓库根目录：

```bash
cd ../..
```

## 启动和停止语音服务

启动服务：

```bash
npm run tts:start
```

启动成功后，服务地址是：

```text
http://127.0.0.1:8880
```

日志文件在：

```text
.tts/kokoro.log
```

停止服务：

```bash
npm run tts:stop
```

Apple Silicon Mac 默认使用 `mps`。如果想强制使用 CPU：

```bash
KOKORO_DEVICE=cpu npm run tts:start
```

如果 `uv` 不在 PATH 里，可以手动指定：

```bash
UV_BIN=/opt/homebrew/bin/uv npm run tts:start
```

## 测试语音服务

先确认服务能访问：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

再生成一段测试音频：

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

如果生成了 `zotero-pronounce-test.mp3`，说明本地语音模型服务正常。

## 插件默认配置

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

## 常见问题

### 点击“发音”后提示无法连接 TTS endpoint

先确认本地服务是否启动：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

如果无法连接，回到 `Zotero-voice` 目录运行：

```bash
npm run tts:start
```

### 第一次启动很慢

第一次启动需要加载模型，可能需要几十秒。后续启动通常会快很多。

### 有请求但没有自动播放

Zotero/Firefox 可能会阻止自动播放。插件会显示音频控件，手动点击播放即可。

### 想换声音

查看可用声音：

```bash
curl http://127.0.0.1:8880/v1/audio/voices
```

然后在 Zotero 插件设置里修改 `voice`。

默认声音是：

```text
af_bella
```

## 开发

普通用户不需要自己构建插件，直接下载 Release 里的 XPI 即可。

开发者可以使用下面命令：

```bash
npm install
npm test
npm run package
```

打包产物会生成在：

```text
dist/zotero-pronounce-0.1.7.xpi
```
