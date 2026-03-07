'use client';

import logo from '@/core/assets/images/logo/primary-logo-full.svg';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useLogin } from '@/core/hooks/useLogin';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Input } from 'antd';
import Image from 'next/image';
import z from 'zod';
import './Login.css';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;

const Login = ({ callbackUrl }: { callbackUrl: string }) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const { mutate: login, isPending, error } = useLogin({ callbackUrl });

  const onSubmit = (data: FormData) => {
    login(data);
  };

  return (
    <main
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center',
        'bg-tertiary bg-linear-to-r from-tertiary via-secondary to-brand-primary bg-size-[200%_200%]',
      )}
      style={{
        animation: 'gradient 20s ease infinite',
      }}
    >
      <div className="bg-background rounded-lg p-4 shadow-lg text-foreground min-w-96 flex flex-col items-center gap-4">
        <Image src={logo} alt="Logo" width={150} height={70.31} />
        <Form
          initialValues={{ username: '', password: '' }}
          form={form}
          onFinish={onSubmit}
        >
          <Form.Item name="username" label="Username" rules={[formValidation]}>
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[formValidation]}>
            <Input.Password placeholder="Password" />
          </Form.Item>

          {error && <FormNotification text={error.message} type="error" />}
          <Button
            loading={isPending}
            type="primary"
            htmlType="submit"
            className="ml-auto"
          >
            Login
          </Button>
        </Form>
      </div>
    </main>
  );
};

export const LoginScene = ({ callbackUrl = '/' }: { callbackUrl?: string }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Login callbackUrl={callbackUrl} />
    </QueryClientProvider>
  );
};
