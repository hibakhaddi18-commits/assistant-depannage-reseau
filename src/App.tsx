import { useState } from 'react';
import Home from '@/components/Home';
import DiagnosisFlow from '@/components/DiagnosisFlow';
import UsefulCommands from '@/components/UsefulCommands';
import ChatAssistant from '@/components/ChatAssistant';
import { findFlow } from '@/data/categories';
import type { Category, Flow } from '@/data/types';

export default function App() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<{ flow: Flow; category: Category } | null>(null);
  const [showCommands, setShowCommands] = useState(false);

  const handleSelect = (flow: Flow, category: Category) => {
    setActive({ flow, category });
    setShowCommands(false);
    window.scrollTo({ top: 0 });
  };

  const handleHome = () => {
    setActive(null);
    setShowCommands(false);
    window.scrollTo({ top: 0 });
  };

  const handleShowCommands = () => {
    setShowCommands(true);
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

  if (showCommands) {
    return (
      <>
        <UsefulCommands onHome={handleHome} />
        <ChatAssistant />
      </>
    );
  }

  return (
    <>
      <Home
        onSelect={handleSelect}
        onShowCommands={handleShowCommands}
        query={query}
        onQueryChange={setQuery}
      />
      <ChatAssistant />
    </>
  );
}
