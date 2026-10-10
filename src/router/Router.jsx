import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

export function BrowserRouter({ children }) {
  const [pathname, setPathname] = useState(() => {
    const raw = window.location.pathname || '/login';
    return raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
  });

  useEffect(() => {
    const onPopState = () => {
      const raw = window.location.pathname || '/login';
      setPathname(raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to, options = {}) => {
    const cleanTo = to.length > 1 && to.endsWith('/') ? to.slice(0, -1) : to;
    if (options.replace) {
      window.history.replaceState({}, '', cleanTo);
    } else {
      window.history.pushState({}, '', cleanTo);
    }
    setPathname(cleanTo);
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  return ctx ? ctx.navigate : () => {};
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  return { pathname: ctx ? ctx.pathname : '/' };
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
  const childrenArray = React.Children.toArray(children);
  const rawPath = decodeURIComponent(pathname || '/login').trim();
  const cleanPathname = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const normalizedPathname = cleanPathname.replace(/_/g, '-');

  // Pass 1: Exact match or normalized match
  for (const child of childrenArray) {
    const path = child.props?.path;
    if (!path || path === '*') continue;

    const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    const normalizedPath = cleanPath.replace(/_/g, '-');

    if (cleanPath === cleanPathname || normalizedPath === normalizedPathname) {
      return child.props.element;
    }
    if (path.endsWith('/*') && (cleanPathname.startsWith(path.slice(0, -2)) || normalizedPathname.startsWith(normalizedPath.slice(0, -2)))) {
      return child.props.element;
    }
  }

  // Pass 2: Wildcard fallback
  for (const child of childrenArray) {
    if (child.props?.path === '*') {
      return child.props.element;
    }
  }

  return null;
}

export function Route({ path, element }) {
  return element;
}

export function Navigate({ to, replace = true }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace]);
  return null;
}
