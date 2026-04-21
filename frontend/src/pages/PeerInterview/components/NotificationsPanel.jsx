import React from "react";
import RequestsGrid from "./RequestsGrid";

const NotificationsPanel = ({
  incoming,
  outgoing,
  respond,
  startAcceptedInterview,
  isSessionJoinable,
  navigate,
}) => (
  <div className="lg:col-span-12">
    <RequestsGrid
      title="Requests & Notifications"
      incoming={incoming}
      outgoing={outgoing}
      respond={respond}
      startAcceptedInterview={startAcceptedInterview}
      isSessionJoinable={isSessionJoinable}
      navigate={navigate}
      limit={12}
      gridClassName="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
    />
  </div>
);

export default NotificationsPanel;
