import React from "react";
import { Outlet } from "react-router-dom";
import { SectionTabs } from "../../../app/shared";
import { contentTabs } from "../../../app/shared/tabs/contentTabs";

const ContentLayoutPage: React.FC = () => {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-end gap-3">
        <SectionTabs tabs={contentTabs} />
      </div>
      <Outlet />
    </div>
  );
};

export default ContentLayoutPage;