# 恋恋错题本 Vercel 部署

## 部署前要知道

Vercel 可以让网页获得公网地址和 HTTPS，适合先让别人打开体验。

当前项目里的 PaddleOCR / 版面检测依赖本机 Python 常驻服务，这类服务不适合直接跑在 Vercel Serverless 里。线上建议使用阿里云 OCR 生成文字块，再走现有题号锚点、题目切分、去重和小问归并逻辑；低置信度页面仍会使用 Qwen 多模态兜底复核。

## 需要配置的环境变量

在 Vercel 项目后台添加：

- `QWEN_API_KEY`
- `QWEN_VL_MODEL=qwen3.5-omni-plus`
- `QWEN_GUIDE_MODEL=qwen3.5-omni-plus`
- `QWEN_HANDWRITING_MODEL=qwen3.5-omni-plus`
- `QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
- `ALIYUN_OCR_APPCODE`
- `ALIYUN_OCR_URL=https://subject2.market.alicloudapi.com/educationservice/papercut`
- `ALIYUN_OCR_TEXT_FALLBACK_URL=https://ocrapi-advanced.taobao.com/ocrservice/advanced`
- `ALIYUN_OCR_ENABLED=1`
- `ALIYUN_OCR_CUT_TYPE=question`
- `ALIYUN_OCR_IMAGE_TYPE=photo`
- `ALIYUN_OCR_SUBJECT=JHighSchool_Math`
- `LOCAL_OCR_ENABLED=0`

不要把 `.env` 上传到 GitHub 或 Vercel。

## 首次部署

在项目目录运行：

```powershell
npm run check
vercel
```

按提示选择项目并完成部署。

## 发布正式版本

```powershell
vercel --prod
```

## 部署后检查

打开：

```text
https://你的域名/api/health
```

如果返回 `ok: true`，并且 `aliyunOcrConfigured: true`，说明后端和阿里云 OCR 配置已经读到。

再打开主页：

```text
https://你的域名/
```

## 线上功能说明

- 上传、讲解、语音播报可以在线访问。
- 麦克风必须在 HTTPS 下才稳定可用，Vercel 默认满足。
- 线上题目分割使用阿里云 OCR + 本地后处理 + Qwen 兜底。
- 错题本如果仍使用浏览器本地存储，不同用户之间不会共享数据。
