import { Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>四川新数 IP 工具箱</span>
            <span className="opacity-40">|</span>
            <a
              href="https://github.com/fireboy38/ip-check-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub 开源项目</span>
            </a>
          </div>

          <p className="text-slate-500 text-xs">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">蜀ICP备20007839号</a>
            <span className="mx-2 opacity-40">|</span>
            © {new Date().getFullYear()} 四川新数
          </p>
        </div>
      </div>
    </footer>
  );
}
