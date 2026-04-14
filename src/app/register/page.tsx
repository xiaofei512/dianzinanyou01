'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SiteContainer } from '@/components/site/container';
import { DottedSeparator } from '@/components/site/dotted-separator';
import { SectionHeading } from '@/components/site/section-heading';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('请填写所有字段');
      return;
    }

    if (username.length < 2 || username.length > 50) {
      setError('用户名长度应在2-50个字符之间');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败');
        return;
      }

      login(data.token, data.user);
      router.push('/');
    } catch (err) {
      setError('注册失败，请稍后重试');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteContainer className="py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <section>
          <SectionHeading>Create Account</SectionHeading>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            创建账号，开始专属关系旅程
          </h1>
          <p className="text-foreground/65 mt-4 text-sm leading-relaxed md:text-base">
            注册后即可进入角色选择，体验文字、语音、图片三种互动模式。
          </p>
          <DottedSeparator className="my-6" />
          <p className="text-foreground/60 text-sm leading-relaxed">
            建议用户名简洁易记，后续可持续使用同一身份进行长期对话。
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-card border-border/80 rounded-2xl border p-6 shadow-sm md:p-7"
        >
          <h2 className="text-foreground text-lg font-semibold">创建账号</h2>

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
                placeholder="2-50 个字符"
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
                  placeholder="至少 6 个字符"
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

            <div>
              <label htmlFor="confirmPassword" className="text-foreground/75 mb-1.5 block text-sm font-medium">
                确认密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="border-border bg-background focus:border-foreground/35 w-full rounded-md border px-3 py-2.5 pr-10 text-sm outline-none transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-foreground/45 hover:text-foreground/80 absolute top-1/2 right-2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                注册中...
              </>
            ) : (
              '立即注册'
            )}
          </button>

          <p className="text-foreground/60 mt-5 text-center text-sm">
            已有账号？{' '}
            <Link href="/login" className="text-foreground hover:text-black underline underline-offset-4">
              去登录
            </Link>
          </p>
        </form>
      </div>
    </SiteContainer>
  );
}
