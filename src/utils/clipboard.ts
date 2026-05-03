/**
 * 复制文本到剪贴板（兼容 HTTP 和 HTTPS 环境）
 *
 * 关键：在非安全上下文（HTTP）下，navigator.clipboard 对象存在但
 * writeText() 会抛异常。如果先 await writeText() 再降级到 execCommand，
 * 会因 await 打破用户手势上下文导致 execCommand 也失败。
 * 因此必须先检查 isSecureContext，非安全上下文直接走 execCommand。
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 非安全上下文（HTTP）：直接使用 execCommand，保留用户手势上下文
  if (!window.isSecureContext) {
    return execCommandCopy(text);
  }

  // 安全上下文（HTTPS / localhost）：优先使用 Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API 失败（如权限被拒绝），降级到 execCommand
      return execCommandCopy(text);
    }
  }

  // Clipboard API 不可用，使用 execCommand
  return execCommandCopy(text);
}

/**
 * execCommand 方式复制（同步执行，兼容 HTTP 和移动端）
 */
function execCommandCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  // 防止在页面上出现闪烁
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  // 防止 iOS 弹出键盘
  textarea.setAttribute('readonly', '');

  document.body.appendChild(textarea);

  // iOS 兼容：setSelectionRange 比 select() 更可靠
  textarea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}
