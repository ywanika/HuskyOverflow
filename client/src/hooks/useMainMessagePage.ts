import { useState } from 'react';

export type MessageTabType = 'global' | 'direct';

const useMainMessagePage = () => {
  const [activeTab, setActiveTab] = useState<MessageTabType>('global');

  const handleTabChange = (tab: MessageTabType) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
};

export default useMainMessagePage;
