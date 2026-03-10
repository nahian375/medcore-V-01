export const addNotification = (notif: {
  topic: string;
  title: string;
  message: string;
  iconType: 'info' | 'blood' | 'health' | 'hospital' | 'pharmacy' | 'alarm';
  color: string;
}) => {
  const newNotif = {
    ...notif,
    id: Date.now().toString(),
    time: 'Just now',
    read: false,
  };
  
  window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotif }));
};
