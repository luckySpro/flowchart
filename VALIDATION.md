# 0.1.0 原型验收

2026-10-14，macOS ARM64。

## 通过

- `npm test`：6 项模型与字段测试，覆盖五类模板序列化、引用完整性、重复 ID、非法尺寸、渲染注入与版本拒绝。
- `cargo fmt --check`、`cargo test --locked`（4 项）、`cargo clippy --locked --all-targets -- -D warnings`。
- `npm audit --omit=dev`：0 个已知依赖漏洞；不代表完整 Rust 漏洞审计或绝对安全。
- 前端生产构建，以及 Tauri macOS ARM64 APP 生产封装。主前端 JS 约 635 KB（gzip 185 KB）；保留 Vite 大块体积提示，后续可按功能拆分。
- 浏览器实际操作：新增节点、改名、说明编辑、配色、复制、撤销、重做、五类模板切换、文件保存/重新打开、刷新后恢复草稿、SVG 下载。
- 修复异步渲染在快速撤销/重做时残留旧图形的问题。修复后模型与 DOM 数量一致；实际 SVG 文件解析得到 9 个节点、10 条边。
- 检查 1440×900 桌面布局及 558×799 窄窗口；窄窗口隐藏属性面板，桌面为主要使用方式。

## 证据

- `qa/architecture-desktop.jpg`：实际浏览器的桌面尺寸界面截图。
- `qa/architecture.xutu`：实际保存并重新打开的文件。
- `qa/architecture.svg`：实际导出并通过 XML 结构检查的文件。

## 未完成的验收

- 已确认 macOS APP 实际启动及原生草稿写入。WebView Blob 下载在原生验收中出现阻塞，已改用 Rust 系统保存对话框；已通过系统保存对话框导出 SVG，导出后窗口保持响应，并检查真实输出文件。
- 手动拖出新连线、触控交互、系统原生文件选择器、Windows/Linux、干净机器离线安装、长期编辑与大量图形性能尚未验证。
- Rust 依赖漏洞数据库审计尚未执行。发布流程会生成并附带传递依赖许可元数据与实际许可证文本；Developer ID/Authenticode 签名与公证尚未配置。
- 本产品采用独立 Git 仓库 https://github.com/luckySpro/flowchart，原有护肤文件没有上传。
- 本轮增加 76 个图库条目和结构化 ER 字段编辑，已验证旧文本迁移、名称/类型修改、字段添加及刷新后恢复。
