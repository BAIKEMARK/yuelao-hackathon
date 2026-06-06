import "./globals.css";

export const metadata = {
  title: "红绳懒得系，弹珠自己撞",
  description: "选择名著角色当母球，撞出 AI 姻缘档案"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
