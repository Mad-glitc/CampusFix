import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Cpu, CheckCircle2, Layers, Zap, Info } from 'lucide-react';

/**
 * State Architecture Educational Module demonstrating:
 * - Unit VI: Redux Toolkit vs Zustand vs Context API comparison
 * - Interactive tabbed documentation & live comparison
 */
export const ReduxComparisonDemo = () => {
  const [activeTab, setActiveTab] = useState('zustand');
  const [counter, setCounter] = useState(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="purple" size="sm">
            Architecture Matrix
          </Badge>
          <span className="text-xs text-slate-400 font-medium">State Management Evaluation</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Global State Management: Architecture & Decision Matrix
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
          State management decisions form a critical milestone in enterprise web applications. This comparison explains
          why <strong>Zustand</strong> and <strong>TanStack Query</strong> were chosen for CampusFix
          alongside an architectural evaluation of <strong>Redux Toolkit (RTK)</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        {[
          { id: 'zustand', label: 'Zustand (Active in CampusFix)', icon: Zap },
          { id: 'redux', label: 'Redux Toolkit (RTK Structure)', icon: Layers },
          { id: 'context', label: 'Context API (Theme & Local State)', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'zustand' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Why Zustand for Client State?</Card.Title>
              <Card.Description>Lightweight store without Context wrapper re-renders</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>No Context Provider Hell:</strong> Zustand hooks work anywhere outside the component tree.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Selective Subscriptions:</strong> Components only re-render when their selected slice changes (<code>useAuthStore(s =&gt; s.user)</code>).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Minimal Boilerplate:</strong> Less than 2KB bundle footprint with built-in action closures.</span>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Zustand Implementation in CampusFix</Card.Title>
            </Card.Header>
            <Card.Content>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-normal">
{`// src/store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false })
}));`}
              </pre>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === 'redux' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Redux Toolkit (RTK) Pattern</Card.Title>
              <Card.Description>The enterprise standard for complex synchronous state</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span><strong>createSlice & Immer:</strong> Allows direct mutations safely translated to immutable updates.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span><strong>configureStore:</strong> Bundles redux-thunk, devTools extension, and middleware by default.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <span><strong>Trade-off:</strong> Higher boilerplate for simple apps compared to Zustand + TanStack Query.</span>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Redux Equivalent Slice Architecture</Card.Title>
            </Card.Header>
            <Card.Content>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-normal">
{`// Redux Toolkit Equivalent
import { createSlice, configureStore } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logOut(state) {
      state.user = null;
      state.token = null;
    }
  }
});

export const store = configureStore({
  reducer: { auth: authSlice.reducer }
});`}
              </pre>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === 'context' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>React Context API Role</Card.Title>
              <Card.Description>Built-in primitive for low-frequency updates</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Zero Dependencies:</strong> Native to React via <code>createContext</code> and <code>useContext</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Ideal Use Cases:</strong> Theme toggling (Dark/Light), Locale/i18n, and Accessibility flags.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span><strong>Caveat:</strong> Frequent updates cause re-renders in all consuming child components.</span>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>CampusFix ThemeContext</Card.Title>
            </Card.Header>
            <Card.Content>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-normal">
{`// src/context/ThemeContext.jsx
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  return (
    <ThemeContext.Provider value={{ highContrast, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};`}
              </pre>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReduxComparisonDemo;
