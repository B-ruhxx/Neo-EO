import React from "react";

export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
  size = "normal", // "normal" | "small"
}) {
  return (
    <div
      className={`segmented-tabs-wrapper glass-surface ${size === "small" ? "tabs-small" : ""} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`segmented-tab-btn ${isActive ? "active" : ""}`}
            onClick={() => onChange && onChange(tab.id)}
          >
            {Icon && (
              <Icon
                size={15}
                className={`tab-icon ${tab.iconClass || ""}`}
                style={tab.iconColor ? { color: tab.iconColor } : undefined}
              />
            )}
            <span className="tab-label">{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={`tab-count ${isActive ? "active-count" : ""}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
