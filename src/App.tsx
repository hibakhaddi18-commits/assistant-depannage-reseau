import { useState } from 'react';
import Home from '@/components/Home';
import DiagnosisFlow from '@/components/DiagnosisFlow';
import ChatAssistant from '@/components/ChatAssistant';
import { findFlow } from '@/data/categories';
import type { Category, Flow } from '@/data/types';

export default function App() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<{ flow: Flow; category: Category } | null>(null);

  const handleSelect = (flow: Flow, category: Category) => {
    setActive({ flow, category });
    window.scrollTo({ top: 0 });
  };

  const handleHome = () => {
    setActive(null);
    window.scrollTo({ top: 0 });
  };

  if (active) {
    return (
      <>
        <DiagnosisFlow
          key={active.flow.id}
          flow={active.flow}
          category={active.category}
          onHome={handleHome}
          onSwitchFlow={handleSelect}
        />
        <ChatAssistant />
      </>
    );
  }

  return (
    <>
      <Home onSelect={handleSelect} query={query} onQueryChange={setQuery} />
      <ChatAssistant />
    </>
  );
}
