export default function ErrorPage() {
  return <main><section role="alert"><h1>页面暂时无法加载</h1><button onClick={() => window.location.reload()}>重新加载</button></section></main>;
}
