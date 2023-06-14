const { Builder, By, Key, until } = require('selenium-webdriver');

class KickChat {

    // Constructor
    constructor(config={username}) {
        this.driver = null;
        this.lastMessageId = null;
        this.config = config;
    }

    // Callbacks
    async onStart() {}

    async onMessage(message) {}

    async onEnd() {}

    // Start browser
    async start() {
        this.driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build();
        
        // Connect to https://kick-chat.corard.tv/v1/chat?user=${username}&font-size=Small&stroke=Off&animate=true&badges=true&commands=true&bots=true
        await this.driver.get(`https://kick-chat.corard.tv/v1/chat?user=${this.config.username}&font-size=Small&stroke=Off&animate=true&badges=true&commands=true&bots=true`);

        this.onStart();

        // Wait for the chat container to appear
        await this.driver.wait(until.elementLocated(By.id('chat-container')));

        // Every 100ms, get the html content of the chatroom
        setInterval(async () => {
            try {
                const elements = await this.driver.findElements(By.css('#chat-container [data-id]'));

                const lastElement = elements[elements.length - 1];
                const msgProfile = await lastElement.getAttribute('data-id');
                const msgContent = await lastElement.findElement(By.css('.message_content')).getText();
                const usernameElement = await lastElement.findElement(By.css('.user_info span:not([class]) .username'));
                const username = await usernameElement.getText();
                const badges = await lastElement.findElement(By.css('.user_info .badges')).getAttribute('innerHTML');

                if (msgProfile !== this.lastMessageId) {
                    this.onMessage({
                        isModerator: badges.includes('Moderator'),
                        isVIP: badges.includes('VIP'),
                        username: username,
                        content: msgContent
                    });

                    this.lastMessageId = msgProfile;
                }
            } catch (e) {
            
            }
        }, 100);

        
    }

}
exports.KickChat = KickChat;