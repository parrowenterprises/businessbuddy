declare module '*.tsx' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '@/components/*' {
  const component: React.ComponentType<any>;
  export default component;
} 