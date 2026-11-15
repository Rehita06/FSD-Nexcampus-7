import { useCallback, useEffect, useState } from 'react';
import type { Route } from '@/types';

const ROUTE_IDS: Route[] = ['home', 'chat', 'hub', 'admin', 'tools', 'students'];

function routeFromHash(): Route {
  const id = window.location.hash.replace('#/', '') as Route;
  return ROUTE_IDS.includes(id) ? id : 'home';
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(routeFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = `/${next}`;
  }, []);

  return { route, navigate };
}
