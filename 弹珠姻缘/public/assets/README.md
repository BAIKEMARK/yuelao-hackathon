# Assets Path Guide

本目录存放《红绳懒得系，弹珠自己撞》的静态视觉资源。

前端引用路径统一从站点根路径开始：

```text
/assets/...
```

不要在代码中引用本机绝对路径、远程 URL、CDN 或未压缩大图。

## 推荐目录

```text
public/assets/
  backgrounds/
    start.webp
    board.webp
    result.webp
    gallery.webp
  characters/
    lin-daiyu.webp
    jia-baoyu.webp
    xue-baochai.webp
    sun-wukong.webp
    tang-seng.webp
    zhu-bajie.webp
    wu-song.webp
    lu-zhishen.webp
    zhuge-liang.webp
    guan-yu.webp
  balls/
    lin-daiyu.webp
    jia-baoyu.webp
    xue-baochai.webp
    sun-wukong.webp
    tang-seng.webp
    zhu-bajie.webp
    wu-song.webp
    lu-zhishen.webp
    zhuge-liang.webp
    guan-yu.webp
  newspaper/
    paper-texture.webp
    masthead.webp
    divider.webp
    seal.webp
  ui/
    red-thread.webp
    ink-mark.webp
    stamp.webp
```

## 命名规则

- 角色资源文件名必须使用 `lib/characters.js` 中的角色 `id`。
- 角色头像放 `characters/`。
- 圆形弹珠贴图放 `balls/`。
- 报纸结果页纹理、报头、印章放 `newspaper/`。
- 通用装饰元素放 `ui/`。

## 格式与体积

- 优先 `.webp`。
- 透明小图可用 `.png`。
- 单张背景建议不超过 500KB。
- 单个角色球建议不超过 120KB。
- 不提交 PSD、AI、未压缩原图或生成缓存。

## 代码引用示例

```jsx
<img src="/assets/balls/lin-daiyu.webp" alt="林黛玉弹珠" />
```

```css
.newspaper-card {
  background-image: url("/assets/newspaper/paper-texture.webp");
}
```
