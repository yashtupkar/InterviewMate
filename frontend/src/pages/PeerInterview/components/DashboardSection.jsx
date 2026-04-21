import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import DiscoverPanel from "./DiscoverPanel";
import NotificationsPanel from "./NotificationsPanel";
import SidebarPanel from "./SidebarPanel";

const DashboardSection = ({
  currentSection,
  hydrate,
  loading,
  discoverLoading,
  filteredDiscoverUsers,
  userSearch,
  setUserSearch,
  sendDirectRequest,
  sendingRequest,
  sendingToUserId,
  incoming,
  outgoing,
  respond,
  startAcceptedInterview,
  isSessionJoinable,
  navigate,
  joinQueue,
  queueBusy,
}) => (
  <div className="max-w-6xl mx-auto px-6 pt-10 relative z-10 space-y-8 pb-20">
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-black">
        {currentSection === "send-request" && "Send Invitation"}
        {currentSection === "notifications" && "Notifications"}
        {currentSection === "search" && "Search Peers"}
      </h2>
      <button
        onClick={hydrate}
        className="p-3 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 transition"
      >
        <FiRefreshCw className={loading ? "animate-spin" : ""} />
      </button>
    </div>

    <div className="grid lg:grid-cols-12 gap-8">
      {(currentSection === "send-request" || currentSection === "search") && (
        <>
          <DiscoverPanel
            currentSection={currentSection}
            discoverLoading={discoverLoading}
            filteredDiscoverUsers={filteredDiscoverUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            sendDirectRequest={sendDirectRequest}
            sendingRequest={sendingRequest}
            sendingToUserId={sendingToUserId}
          />

          <SidebarPanel
            joinQueue={joinQueue}
            queueBusy={queueBusy}
            incoming={incoming}
            outgoing={outgoing}
            respond={respond}
            startAcceptedInterview={startAcceptedInterview}
            isSessionJoinable={isSessionJoinable}
            navigate={navigate}
          />
        </>
      )}

      {currentSection === "notifications" && (
        <NotificationsPanel
          incoming={incoming}
          outgoing={outgoing}
          respond={respond}
          startAcceptedInterview={startAcceptedInterview}
          isSessionJoinable={isSessionJoinable}
          navigate={navigate}
        />
      )}
    </div>
  </div>
);

export default DashboardSection;
