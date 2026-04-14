'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SiteContainer } from '@/components/site/container';
import { DottedSeparator } from '@/components/site/dotted-separator';
import { SectionHeading } from '@/components/site/section-heading';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
        return;
      }

      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      setError('登录失败，请稍后重试');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteContainer className="py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <section>
          <SectionHeading>Welcome Back</SectionHeading>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            登录并继续你的陪伴对话
          </h1>
          <p className="text-foreground/65 mt-4 text-sm leading-relaxed md:text-base">
            全新模板风格界面已启用，你的历史角色关系和聊天进度依旧保留。
          </p>
          <DottedSeparator className="my-6" />
          <p className="text-foreground/60 text-sm leading-relaxed">
            建议使用常用设备登录，以便语音缓存和对话体验更加稳定。
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-card border-border/80 rounded-2xl border p-6 shadow-sm md:p-7"
        >
          <h2 className="text-foreground text-lg font-semibold">账号登录</h2>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="username" className="text-foreground/75 mb-1.5 block text-sm font-medium">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="border-border bg-background focus:border-foreground/35 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-foreground/75 mb-1.5 block text-sm font-medium">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="border-border bg-background focus:border-foreground/35 w-full rounded-md border px-3 py-2.5 pr-10 text-sm outline-none transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-foreground/45 hover:text-foreground/80 absolute top-1/2 right-2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border"
              disabled={isLoading}
            />
            <span className="text-foreground/65">记住我（30天内免登录）</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>

          <p className="text-foreground/60 mt-5 text-center text-sm">
            还没有账号？{' '}
            <Link href="/register" className="text-foreground hover:text-black underline underline-offset-4">
              去注册
            </Link>
          </p>
        </form>
      </div>
    </SiteContainer>
  );
}
