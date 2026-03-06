export const useLogin = () => {
  // const router = useRouter();
  // const {
  //   mutate: login,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: (data: components['schemas']['LoginRequest']) => {
  //     return apiClient.post('/api/v1/auth/login', {
  //       body: data,
  //     });
  //   },
  //   onSuccess: (data) => {
  //     const maxAge = data.expires_in ?? 86400; // default 24h
  //     document.cookie = `token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Strict`;
  //     router.push('/');
  //   },
  // });

  const login = () => {};
  const isPending = false;
  const error = null;

  return { login, isPending, error };
};
