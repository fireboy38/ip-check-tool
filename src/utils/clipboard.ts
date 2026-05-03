/**
 * 复制文本到剪贴板（兼容 HTTP 和 HTTPS 环境）
 *
 * navigator.clipboard.writeText() 只在安全上下文（HTTPS / localhost）下可用，
 * 在 HTTP 环境会抛出异常或 undefined。此函数提供 fallback：
 * 1. 优先使用 navigator.clipboard API
 * 2. 降级到 document.execCommand('copy') 方式
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 方式1：Clipboard API（需安全上下文）
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 权限被拒绝或其他错误，降级到 fallback
    }
  }

  // 方式2：创建临时 textarea + execCommand（兼容 HTTP）
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // 防止在页面上出现闪烁
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
