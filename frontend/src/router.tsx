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

export const router = createBrowserRouter([
  {
    Component: AppShell,
    ErrorBoundary: ErrorPage,
    children: [
      { index: true, Component: Dashboard },
      { path: '/questions/new', Component: NewQuestion },
      { path: '/review', Component: Review },
      { path: '/import', Component: ImportQuestions },
      { path: '/stats', Component: Stats },
      { path: '*', Component: NotFound },
    ],
  },
]);
