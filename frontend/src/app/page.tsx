import Link from 'next/link';
export default function Dashboard() {
  return <><header><p className="eyebrow">每天一点，温故知新</p><h1>今日总览</h1><p>从整理一道面试题开始，把模糊变熟悉。</p></header><section className="panel"><h2>欢迎来到面试温习社</h2><p>生产代码骨架已初始化。题库、温习计划与学习统计将在接入真实账户和数据库后呈现。</p><Link className="button" href="/questions/new">前往添加题目</Link></section><p className="note">当前未接入业务数据，不展示原型的模拟题目或学习记录。</p></>;
}
