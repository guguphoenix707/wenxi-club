'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section role="alert"><h1>页面暂时无法加载</h1><button onClick={reset}>重试</button></section>; }
