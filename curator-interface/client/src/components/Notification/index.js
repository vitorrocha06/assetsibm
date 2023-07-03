import { InlineNotification, ToastNotification } from "@carbon/react";

import "./style.scss";

export function Notification({
  setShowNotification,
  notificationContent,
  setNotificationContent,
}) {
  return (
    <ToastNotification
      className="notification"
      ariaLabel="closes notification"
      timeout={7999}
      onClose={() => {
        setShowNotification(false);
        setNotificationContent({
          title: "Inicializando",
          text: "Carregando dashboard padrão...",
          kind: "info",
        });
      }}
      onCloseButtonClick={() => {
        setShowNotification(false);
        setNotificationContent({
          title: "Inicializando",
          text: "Carregando dashboard padrão...",
          kind: "info",
        });
      }}
      statusIconDescription="notification"
      kind={notificationContent?.kind}
      subtitle={notificationContent?.text}
      title={notificationContent?.title}
    />
  );
}
