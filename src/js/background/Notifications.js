/**
 * Handles native system notifications for new unread notifications in Pontoon.
 */
class Notifications {
    /**
     * Initialize instance and watch for storage updates.
     * @param options
     * @param remotePontoon
     */
    constructor(options, remotePontoon) {
        this._options = options;
        this._remotePontoon = remotePontoon;
        this._watchStorageChanges();
    }

    /**
     * Check for new unread notifications if the storage gets updated.
     * @private
     */
    _watchStorageChanges() {
        this._remotePontoon.subscribeToNotificationsChange(
            (change) => {
                const notificationsData = change.newValue;
                Promise.all([
                    this._getNewUnreadNotifications(notificationsData),
                    this._options.get('show_notifications').then((option) => option['show_notifications'])
                ]).then(([
                    newUnreadNotificationIds,
                    showNotifications
                ]) => {
                    if (showNotifications && newUnreadNotificationIds.length > 0) {
                        this._notifyAboutUnreadNotifications(newUnreadNotificationIds, notificationsData);
                    }
                });
            }
        );
    }

    /**
     * Get new unread notifications that the user hasn't been notified about.
     * @param notificationsData
     * @returns {Promise.<Array.<number>>} promise that will be fulfilled with the list of unread notification ids
     * @private
     * @async
     */
    async _getNewUnreadNotifications(notificationsData) {
        let unreadNotificationIds = [0];
        if (notificationsData !== undefined) {
            unreadNotificationIds = Object.keys(notificationsData)
                .map((key) => parseInt(key))
                .filter((id) => notificationsData[id].unread);
        }
        const dataKey = 'lastUnreadNotificationId';
        const lastKnownUnreadNotificationId = await browser.storage.local.get(dataKey).then((item) => {
            return item[dataKey] || 0;
        });
        return unreadNotificationIds.filter((id) => id > lastKnownUnreadNotificationId);
    }

    /**
     * Show a system notification about new unread notifications in Pontoon.
     * @param unreadNotificationIds
     * @param notificationsData
     * @private
     */
    _notifyAboutUnreadNotifications(unreadNotificationIds, notificationsData) {
        const notificationItems = unreadNotificationIds.sort().reverse()
            .map((id) => notificationsData[id])
            .map((notification) => {
                const item = {
                    title: '',
                    message: '',
                };
                if (notification.actor) {
                    item.title = `${item.title} ${notification.actor.text}`;
                }
                if (notification.verb) {
                    item.title = `${item.title} ${notification.verb}`;
                }
                if (notification.target) {
                    item.title = `${item.title} ${notification.target.text}`;
                }
                if (notification.message) {
                    item.message = notification.message;
                }
                return item;
            });
        if (notificationItems.length === 1) {
            browser.notifications.create({
                type: 'basic',
                iconUrl: browser.extension.getURL('/img/pontoon-logo.svg'),
                title: notificationItems[0].title,
                message: notificationItems[0].message,
            });
        } else {
            browser.notifications.create({
                type: 'list',
                iconUrl: browser.extension.getURL('/img/pontoon-logo.svg'),
                title: 'You have new unread notifications',
                message: `There are ${notificationItems.length} new unread notifications in Pontoon for you.`,
                items: notificationItems,
            });
        }
        browser.storage.local.set({lastUnreadNotificationId: unreadNotificationIds.sort().reverse()[0]});
    }
}

