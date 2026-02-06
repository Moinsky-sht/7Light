## 目标
- 将「我的」页统计区（stats-grid）改为：连续打卡、累计天数、点亮星灯、同行灯友。
- 全部使用内联 SVG 图标（24x24，fill="none"，stroke="currentColor"），不出现 Emoji。
- 做一次可见的“质感升级”：更精致的卡片层次、光晕/纹理、交互与移动端适配。

## 数据来源与口径
- 连续打卡/累计天数：沿用现有 `userStore.stats.currentStreak / totalDays`（来自 `GET /api/user/home`）。
- 点亮星灯：使用 `GET /api/user/home` 已返回的 `lampsLit` 与 `lampsTotal(49)`，展示为 `x/49`。
- 同行灯友：在 `GET /api/user/home` 里新增返回 `friendsCount`（统计 `social_connections` 中 status=ACCEPTED，且 userId 或 friendId 为本人）。避免前端额外拉取整份好友列表。

## 需要改动的文件
- 后端：扩展首页接口返回 `friendsCount`
  - [home.get.ts](file:///Users/moinsky/Desktop/7Light/web/server/api/user/home.get.ts)
- 前端：让 Store 持有 `lampsLit/lampsTotal/friendsCount`（并在 fetchHomeData 里写入）
  - [user.ts](file:///Users/moinsky/Desktop/7Light/web/stores/user.ts)
- 前端：重做 Profile stats 区块的结构与样式（4 卡片 + SVG + 响应式）
  - [profile.vue](file:///Users/moinsky/Desktop/7Light/web/pages/profile.vue)

## UI/视觉升级方案（不加注释）
- 结构：每个 stat 卡片包含 `icon`、`value`、`label`，其中“连续打卡”作为高亮卡（保留 highlight 语义）。
- 质感：
  - 玻璃拟态：半透明底 + `backdrop-filter`（在不支持时自动退化）。
  - 纹理：沿用页面现有纸纹/墨韵基调，在 stat 卡内部补一层柔和径向渐变高光。
  - 层次：细边框、柔阴影、hover/press 反馈（移动端为 active）。
- 适配：桌面 4 列；窄屏自动改为 2×2 网格，避免字体拥挤。

## 验证方式
- 启动页面后检查：
  - Profile 统计区展示 4 项且无 Emoji。
  - 点亮星灯显示为 `已亮/49`。
  - 同行灯友数量与 `/api/social/friends?status=ACCEPTED` 的 `total` 一致（抽查）。
  - 样式在小屏（2 列）与大屏（4 列）都对齐、无溢出。

确认后我会按以上步骤直接落地实现并做本地自检。