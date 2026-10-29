import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/app-shell';
import ErrorPage from '@/pages/error';
import NotFound from '@/pages/not-found';

const Dashboard = lazy(() => import('@/pages/dashboard'));
const NewQuestion = lazy(() => import('@/pages/questions/new'));
const Review = lazy(() => import('@/pages/review'));
const ImportQuestions = lazy(() => import('@/pages/import'));
const Stats = lazy(() => import('@/pages/stats'));
const TestStyle = lazy(() => import('@/pages/test-style'));

export const router = createBrowserRouter([
  {
    Component: AppShell,
    //FIXME 包含整个吗
    ErrorBoundary: ErrorPage,
    children: [
      //FIXME 主页、添加页 ；加preload吗
      { index: true, Component: Dashboard },
      { path: '/questions/new', Component: NewQuestion },
      { path: '/review', Component: Review },
      { path: '/import', Component: ImportQuestions },
      { path: '/stats', Component: Stats },
      { path: '/test-style', Component: TestStyle },
      { path: '*', Component: NotFound },
    ],
  },
]);
