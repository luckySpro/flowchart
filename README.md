# 序图 · Diagram Studio 0.1.0

面向计算机专业图的可操作原型。独立放在 `diagram-studio/`，不接入上层护肤业务。组织：M&J Group，支持地址：473276@qq.com。

## 当前实现

- 五类场景：系统架构、程序流程、UML 类图、数据库 ER、网络拓扑，各有本地图形库与示例，共 76 个条目（程序流程 18、系统架构 22、UML 15、ER 5、网络拓扑 16）。
- ER 表提供结构化字段编辑：字段名、类型、主键/外键、可空性、增删与排序；旧版字段文本自动迁移。画布逐行绘制表格。
- 点击或拖放添加节点；拖动连接点创建正交连线；双击编辑名称；属性面板修改说明、字段、尺寸、配色与连线标签/虚实样式。
- 撤销/重做、复制、删除、搜索图形、平移、缩放、适应画布、网格开关、深浅主题。
- 浏览器草稿恢复、`.xutu` JSON 保存/打开、SVG 导出。文件最大 5 MB，最多 2000 个节点与连线；版本 1 格式。
- Tauri 2 桌面入口，Rust 负责平台应用数据目录内的原子草稿写入，窗口退出前等待保存。无账号、云服务、遥测或运行时 CDN。

这是 **X6 引擎上的新界面原型**，不是 draw.io 的完整封装，不兼容 `.drawio`。采用 X6 是为了先验证自由定制的交互；成品引擎选型仍须评估图形覆盖与改造成本。

## 本地开发

```sh
npm ci
npm run dev
# http://127.0.0.1:5186/
npm run tauri -- dev
```

前端 npm 锁文件和 Cargo.lock 固定实际依赖。发布脚本需要 Python 3.11+。已验证环境：macOS ARM64、Rust 1.98、Node 26；其他平台尚未构建或验收。

## GitHub 与下载

源码：https://github.com/luckySpro/flowchart

首版使用开发预览渠道，下载位于仓库 Releases；`DOWNLOADS.json` 是手动完整安装的下载目录，`SHA256SUMS` 用于完整性检查，不是身份签名。没有内置自动更新。已有原型需手动安装新版本，Bundle ID 与草稿 schema 保持兼容。

CI 从固定标签构建 macOS ARM64/Intel DMG、Windows x64 NSIS（内置 WebView2 离线安装器）、Linux x64 AppImage/DEB。汇总作业核对所有产物后才生成目录，失败保留草稿。

## 验证与封装

```sh
npm test
python3 scripts/licenses.py
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run tauri -- build --bundles app
```

桌面包位于 `src-tauri/target/release/bundle/macos/序图.app`。构建脚本先生成最新前端再封装资源。开发预览安装包没有 Developer ID/Authenticode 发行签名及公证；不包含自动升级。

## 数据与权限

浏览器：同源 localStorage 的 `xutu-draft-v1`；桌面：平台 `app_data_dir` 下的 `draft.json`，macOS 通常为 `~/Library/Application Support/com.mjgroup.xutu/`。两种环境的数据分开。草稿格式错误时保留原数据并停止覆盖，用户可保存当前示例为文件，或明确加载示例/打开有效文件后继续自动保存。

Rust IPC 不接受前端提交的磁盘路径，不执行 shell；草稿读写使用固定应用数据目录，打开与导出使用系统对话框选择的路径。SVG 导出拒绝脚本、外部引用及嵌入 HTML，文件写入使用同目录临时文件和原子替换。前端导入采用受控节点模型，不将文件中的 SVG markup、任意 attrs 或 tools 传入渲染器。桌面生产 CSP 不允许远程脚本。

## 尚未实现

完整 UML（时序图、用例图等）专用编辑与语义验证、ER 主外键一致性校验、网络协议校验、容器分组、自动布局、PNG/PDF 导出、多文档管理、draw.io 兼容、繁中/英文/日文语言包、Windows/Linux 安装包和签名升级。

当前的 UML 和 ER 是可编辑的图形表达，不是模型编译器或数据库设计器。手机布局仅做基本适配，触控连线未验收。

## 开源与第三方

AntV X6（MIT）、Lucide（ISC）、Tauri（MIT/Apache-2.0）及其依赖保留原作者声明。详见 `THIRD_PARTY_NOTICES.md` 和锁文件。`python3 scripts/licenses.py` 会从锁定依赖生成许可元数据和许可证文本，打包进应用；发布附件也包含各平台许可清单。
