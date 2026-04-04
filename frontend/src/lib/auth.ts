import Cookies from 'js-cookie';

export const setAuth = (token: string, user: any) => {
  Cookies.set('token', token, { expires: 1, path: '/' });
  Cookies.set('role', user.role,  { expires: 1, path: '/' });
  Cookies.set('user', encodeURIComponent(JSON.stringify(user)), { expires: 1, path: '/' });
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const u = Cookies.get('user');
  return u ? JSON.parse(decodeURIComponent(u)) : null;
};

export const logout = () => {
  Cookies.remove('token');
  Cookies.remove('user');
  window.location.href = '/login';
};

export const isAdmin = () => getUser()?.role === 'admin';