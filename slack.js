require('dotenv').config();
const axios = require('axios');

/**
 * Send a notification to Slack when a new user joins the waitlist
 * @param {Object} data - The waitlist entry data
 * @returns {Promise<void>}
 */
async function notifySlackNewWaitlistEntry(data) {
  // Skip if no Slack webhook URL is configured
  if (!process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
    console.log('Slack notification skipped: No webhook URL configured');
    return;
  }

  try {
    // Format frameworks as a comma-separated list
    const frameworks = data.frameworks && data.frameworks.length > 0
      ? data.frameworks.join(', ')
      : 'None selected';

    // Format the message
    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Waitlist Signup!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${data.name}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${data.email}`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Company:*\n${data.company}`
            },
            {
              type: 'mrkdwn',
              text: `*Role:*\n${data.role}`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Frameworks:*\n${frameworks}`
            },
            {
              type: 'mrkdwn',
              text: `*Date:*\n${new Date(data.created_at).toLocaleString()}`
            }
          ]
        },
        {
          type: 'divider'
        }
      ]
    };

    // Send the message to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, message);
    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error.message);
    // Don't throw the error - we don't want to fail the waitlist submission if Slack notification fails
  }
}

module.exports = {
  notifySlackNewWaitlistEntry
}; 