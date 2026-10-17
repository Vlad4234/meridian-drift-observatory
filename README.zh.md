# Meridian Drift Observatory · DEMO 控制室

语言：[English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md) · [Español](README.es.md) · [日本語](README.ja.md) · [简体中文](README.zh.md) · [हिन्दी](README.hi.md)

**所有余额、K 线、订单和成交都是合成的 DEMO 数据。** 这是交互式界面演示，不是真实交易应用、回测或收益证明。

## 本地运行

需要 Node.js 22 或更高版本和 npm，无第三方依赖。

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

打开 `http://localhost:4173`，按 Ctrl+C 停止。其他本地端口：`PORT=4174 npm start`。服务器只监听本机回环地址。不需要注册、密码、API 密钥、账户或环境配置文件。`name` 和 `YOUR_ACCOUNT_ID` 是示例标签。

## 演示步骤

1. 从 READY 和合成价格 100 UNIT 开始。
2. 创建 BUY 限价 99、数量 1 的模拟订单。
3. 点击“Следующий mock-шаг”：价格变为 99，余额变为 9901 UNIT，模拟持仓为 1 DEMO。这只是模拟成交。
4. 创建限价 101 的 SELL。接下来两步价格为 98、101，模拟 SELL 成交。
5. “Отменить mock-заявки”只取消未成交订单，不会平仓。
6. 选择 STALE 或 UNAVAILABLE 后，步骤、下单和取消会明确失败。选择 READY 可继续，“Сбросить демо”可重置。

提供主页、系统、操作、事件、账户五个页面。状态仅保存在当前浏览器标签页内存中，刷新即重置。没有真实交易、行情请求、交易密钥、真实账户连接、实时交易模式或收益计算。模拟操作按钮仍使用俄语，上述步骤说明了按钮含义。

## 捐赠与边界

主页提供十种语言的说明，以及所有者的公开 EVM 地址和复制按钮。仅适用于兼容 EVM 网络的原生币和代币，包括在相应网络受支持的 USDT、USDC。发送前请核对具体网络和代币。此地址不接收法币或非 EVM 网络转账。演示不会连接钱包或发送交易。捐赠地址与合成交易账户分开。

Meridian Drift 在原项目中是文字概念，并没有视觉原型。配色和布局改编自已有的 Control Room。此演示有独立 Git 历史，不含私人数据或生产服务。

`npm run build` 仅向 `dist/` 导出七个允许的文件。`npm run scan` 检查项目文件、构建产物和全部 Git 对象；如发现问题，只显示类别与位置。静态托管时，请保留 `scripts/serve.mjs` 的响应头，并将五个路由指向 `index.html`。

这个独立的公开演示采用 MIT 许可证：[LICENSE](LICENSE)。该许可不涵盖私有源仓库；另见 [NOTICE.md](NOTICE.md)。
