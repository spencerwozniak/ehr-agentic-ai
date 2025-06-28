'use client';

import { useState } from 'react';

type FeatureTab = {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  image: string;
};

type FeaturesTabsProps = {
  tabs: FeatureTab[];
};

export default function FeaturesTabs({ tabs }: FeaturesTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="relative p-6 md:p-16">
        {/* Grid */}
        <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          {/* Text Column */}
          <div className="mb-10 lg:mb-0 lg:col-span-7 lg:col-start-7 lg:order-2">
            <h2 className="text-2xl text-gray-800 font-bold sm:text-3xl">
            Your Mind, Understood.
            </h2>
            <p className="mt-2 text-gray-600">
              From day one, Serelora adapts to your thoughts, behaviors, and preferences to deliver truly personal support — all backed by our adaptive AI and continuous learning.
            </p>

            {/* Tab Navs */}
            <nav
              className="grid gap-4 mt-5 md:mt-10"
              aria-label="Tabs"
              role="tablist"
              aria-orientation="vertical"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  className={`text-start hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 p-4 md:p-5 rounded-xl ${
                    activeTab === tab.id
                      ? 'bg-white shadow-md'
                      : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="flex gap-x-6">
                    <span className="shrink-0 mt-2 text-gray-800">{tab.icon}</span>
                    <span className="grow">
                      <span className="block text-lg font-semibold text-gray-800">
                        {tab.title}
                      </span>
                      <span className="block mt-1 text-gray-800">
                        {tab.description}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Image Column */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Tab Content */}
              <div>
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    id={`panel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${tab.id}`}
                    className={activeTab === tab.id ? '' : 'hidden'}
                  >
                    <img
                      className="shadow-xl shadow-gray-200 rounded-xl"
                      src={tab.image}
                      alt={tab.title}
                    />
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div className="absolute inset-0 grid grid-cols-12 size-full">
        <div className="col-span-full lg:col-span-7 lg:col-start-6 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full" 
        style={{ backgroundColor: '#ffffff' }}></div>
        </div>
      </div>
    </div>
  );
}
