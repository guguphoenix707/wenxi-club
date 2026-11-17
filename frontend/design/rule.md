# 前端编码约定

- 使用 TypeScript strict；避免 any、无解释的类型断言和忽略类型错误。类型描述真实数据与状态，不为了抽象增加复杂泛型。
- 页面负责组合与路由，复用组件负责展示，接口模块负责网络调用；不在页面内堆叠鉴权、数据转换和模型调用。
- 路由映射集中在 src/router，可按业务增加子路由，页面放在 src/pages
- CSS 全局文件维护设计变量与基础样式；组件局部样式优先 CSS Modules。沿用现有视觉，不引入默认组件库主题。
- 不修改 `components/ui` 源文件，避免和 shadcn 上游难以区分。改默认样式：新增 CSS 再引入，或在 `components/common/` 包装 `components/ui/`。页面引用 `common`，不直接改 `ui`。`styles/shadcn.css` 只做 token 映射。
- `components/common` 的类名以品牌前缀 `bread-` 开头，原则上不靠 shadcn 的 `data-slot` 写样式。根类是 `bread-` 加组件名，如 `.bread-button`、`.bread-input`；零件接在后面，如 `.bread-input-label`。
- 外部 `className` 只拼接，不在 JS 里按变体拼类名：`className={classes('bread-button', className)}`。变体和尺寸放在 `data-variant`、`data-size`，样式写成 `.bread-button[data-variant="default"]`。
- 有明确业务收益时推荐引入三方包
- 异步界面明确处理加载、失败、空态；支持键盘操作、可访问标签和响应式布局。
- 不在浏览器调用需要私密密钥的模型 API；接口返回值在边界验证，不默默修正后端业务数据。
- 错误文案由后端放在 `err.msg`。前端只展示这句话，不按 `code` 维护另一套文案。
- `src/lib/api` 的 `requestJson` 是唯一的响应入口。`code` 为 0 时返回 `data`。`code` 非 0、网络失败、超时或响应无法识别，都 reject 成同一种 `ApiError`。业务方法直接返回要消费的数据，不判断成功标记。
- 避免重复定义稳定接口；仅抽取真实共享的内容，优先组合，不强制继承。
- 完成后运行 lint、typecheck 和 build；交互变更补充必要的实际验证，不为纯文档或目录占位编写形式化测试。
