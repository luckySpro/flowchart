# v0.1.0 开发预览发布记录

发布日期：2026-10-14（Asia/Shanghai）。组织：M&J Group，473276@qq.com。

- 发布：https://github.com/luckySpro/flowchart/releases/tag/v0.1.0
- 固定应用源码提交：`86efd6276e2f135067170be2b4dc23e6390c54c0`，标签 `v0.1.0` 未移动。
- 全平台构建与测试：https://github.com/luckySpro/flowchart/actions/runs/38580416683
- macOS 签名修复与最终汇总：https://github.com/luckySpro/flowchart/actions/runs/38582740000
- 发布工作流修复只改变打包环境，所有安装包仍从同一应用源码标签生成。

| 平台 | 附件 | 发布检查 |
| --- | --- | --- |
| macOS ARM64 | xutu-studio_0.1.0_macos-arm64.dmg | 构建、ad-hoc 签名、严格代码/资源封装校验、DMG CRC 与 SHA-256 |
| macOS Intel | xutu-studio_0.1.0_macos-x64.dmg | 构建、ad-hoc 签名、严格代码/资源封装校验、SHA-256 |
| Windows x64 | xutu-studio_0.1.0_windows-x64.exe | 原生构建、Rust 测试、NSIS 封装、WebView2 离线安装器、SHA-256 |
| Linux x64 | xutu-studio_0.1.0_linux-x64.AppImage | 原生构建、Rust 测试、封装、SHA-256 |
| Linux x64 | xutu-studio_0.1.0_linux-x64.deb | 原生构建、Rust 测试、封装、SHA-256 |

四个目标的前端测试、Rust 测试、格式与 Clippy 门禁均通过。最终发布共 15 个附件：5 个安装包、4 个平台许可文本、4 个平台构建清单、DOWNLOADS.json、SHA256SUMS。

发布后从正式下载入口重新获取全部 15 个附件，逐个核对公开 API 大小、GitHub SHA-256 digest 和 SHA256SUMS 中的 14 条记录；DOWNLOADS.json 中的源码提交、文件名和下载 URL 一致。原始核验记录在本机隔离的 `qa/released-v0.1.0/verification.json`。

macOS ARM64 的最终 CI DMG 已只读挂载检查：版本 0.1.0、Bundle ID com.mjgroup.xutu、Mach-O ARM64，仅依赖系统 Frameworks/动态库，实际许可资源已入包；完整 ad-hoc 签名验证通过。检查完成后已卸载测试镜像。

## 实际业务与限制

本机生产 APP 已验证启动、原生草稿写入、系统对话框保存 .xutu 及 SVG；SVG 实际文件通过 XML 检查。原生打开测试在选中文件后遇到 Mac 锁屏，最终打开反馈未确认。浏览器已验证 ER 字段修改/增加与刷新恢复，以及 .xutu 保存/重新打开。

Windows、Linux 与 Intel Mac 的安装/启动及真实 GUI 操作未在独立设备验收。没有 Apple Developer ID、公证或 Windows Authenticode 发行签名；macOS 的 ad-hoc 签名只验证字节与资源完整性，不认证发行者身份。此版本保持开发预览，不作为稳定或强制更新版本。

DOWNLOADS.json 是手动完整安装目录，不是 Tauri updater 的 latest.json。首次部署需要手动安装对应平台的完整包，保留相同 Bundle ID 和 schema 1 草稿。移动平台不在本次发布范围。
