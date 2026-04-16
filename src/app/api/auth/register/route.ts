import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, userExists } from '@/storage/database/neon-client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TURNSTILE_SECRET_KEY =
  process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

interface RegisterRequest {
  username: string;
  password: string;
  turnstileToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, password, turnstileToken } = body;

    if (!username || !password || !turnstileToken) {
      return NextResponse.json(
        { error: '用户名、密码和人机验证不能为空' },
        { status: 400 }
      );
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.error('Turnstile secret key is not configured');
      return NextResponse.json(
        { error: '验证服务未配置，请联系管理员' },
        { status: 500 }
      );
    }

    const verifyPayload = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    });

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim();
    if (clientIp) {
      verifyPayload.append('remoteip', clientIp);
    }

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyPayload.toString(),
      cache: 'no-store',
    });

    if (!verifyResponse.ok) {
      console.error('Turnstile verify request failed', { status: verifyResponse.status });
      return NextResponse.json(
        { error: '验证服务不可用，请稍后重试' },
        { status: 502 }
      );
    }

    const verifyResult = (await verifyResponse.json()) as {
      success?: boolean;
      ['error-codes']?: string[];
    };

    if (!verifyResult.success) {
      console.warn('Turnstile verification failed', {
        errorCodes: verifyResult['error-codes'] ?? [],
      });
      return NextResponse.json(
        { error: '人机验证失败，请重试' },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { error: '用户名长度应在2-50个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6个字符' },
        { status: 400 }
      );
    }

    const exists = await userExists(username);

    if (exists) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(username, hashedPassword);

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
